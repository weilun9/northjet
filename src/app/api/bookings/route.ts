import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { makeBookingRef } from '@/lib/bookingRef';
import { serializeBooking } from '@/lib/serializers';
import { phoneDigits, phoneMatches, significantDigits } from '@/lib/phone';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** POST /api/bookings – create a booking on a scheduled flight. */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const flightId = String(body.flightId || '');
    const email = String(body.email || '').toLowerCase().trim();
    const phone = String(body.phone || '').trim();

    // Accept `passengers: string[]` (or [{name}]) — or a single `passengerName` for compat.
    const rawPassengers: unknown[] = Array.isArray(body.passengers)
      ? body.passengers
      : body.passengerName
      ? [body.passengerName]
      : [];
    const names: string[] = rawPassengers
      .map((p) => String(typeof p === 'string' ? p : (p as { name?: string })?.name || '').trim())
      .filter((n) => n.length > 0);

    // ── Validation ────────────────────────────────────────────────
    if (!flightId || names.length === 0 || !email || !phone) {
      return NextResponse.json(
        { error: 'Please provide a flight, at least one passenger name, an email and a phone number' },
        { status: 400 }
      );
    }
    if (!mongoose.isValidObjectId(flightId)) {
      return NextResponse.json({ error: 'Invalid flight id' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    if (names.length > 6) {
      return NextResponse.json({ error: 'A single booking can have at most 6 passengers' }, { status: 400 });
    }

    const seatsRequested = names.length;
    const now = new Date();

    // Atomic capacity guard: the document is updated only if it is still in the future,
    // the passenger isn't already booked on it, AND confirmed seats < capacity. MongoDB
    // serialises single-document writes, so this cannot oversell under concurrency.
    const guard = {
      _id: flightId,
      departureUTC: { $gt: now },
      bookings: { $not: { $elemMatch: { email, status: 'confirmed' } } },
      $expr: {
        $lte: [
          {
            $add: [
              {
                $sum: {
                  $map: {
                    input: {
                      $filter: {
                        input: '$bookings',
                        as: 'b',
                        cond: { $eq: ['$$b.status', 'confirmed'] },
                      },
                    },
                    as: 'b',
                    in: { $size: '$$b.passengers' },
                  },
                },
              },
              seatsRequested,
            ],
          },
          '$totalSeats',
        ],
      },
    };

    // The retry only guards against the astronomically rare booking-ref collision,
    // which the unique index on bookings.bookingRef would reject with code 11000.
    for (let attempt = 0; attempt < 3; attempt++) {
      const booking = {
        bookingRef: makeBookingRef(),
        email,
        phone,
        passengers: names.map((name) => ({ name })),
        bookedAt: new Date(),
        status: 'confirmed' as const,
      };

      try {
        const updated = await Schedule.findOneAndUpdate(
          guard,
          { $push: { bookings: booking } },
          { new: true }
        );

        if (updated) {
          const created = updated.bookings.find((b) => b.bookingRef === booking.bookingRef);
          return NextResponse.json(serializeBooking(updated, created!), { status: 201 });
        }

        // The guard didn't match — read the doc once to report the precise reason.
        const sched = await Schedule.findById(flightId);
        if (!sched) {
          return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }
        if (sched.departureUTC <= now) {
          return NextResponse.json({ error: 'This flight has already departed' }, { status: 400 });
        }
        const dup = sched.bookings.find((b) => b.email === email && b.status === 'confirmed');
        if (dup) {
          return NextResponse.json(
            { error: `You already have a confirmed booking (${dup.bookingRef}) on this flight` },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: 'Not enough seats left on this flight for your party' },
          { status: 409 }
        );
      } catch (e) {
        if ((e as { code?: number }).code === 11000) continue; // duplicate ref → retry
        throw e;
      }
    }

    return NextResponse.json(
      { error: 'Could not generate a unique booking reference, please retry' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/bookings?email=xxx  – all bookings for a passenger by email, OR
 * GET /api/bookings?phone=xxx  – by phone number (formatting-tolerant).
 * Soonest departure first.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const params = new URL(request.url).searchParams;
    const email = params.get('email')?.toLowerCase().trim() || '';
    const phoneRaw = params.get('phone')?.trim() || '';

    if (email) {
      const schedules = await Schedule.find({ 'bookings.email': email }).sort({ departureUTC: 1 });
      const bookings = schedules.flatMap((s) =>
        s.bookings.filter((b) => b.email === email).map((b) => serializeBooking(s, b))
      );
      return NextResponse.json(bookings);
    }

    if (phoneRaw) {
      const digits = phoneDigits(phoneRaw);
      if (digits.length < 5) {
        return NextResponse.json(
          { error: 'Please enter at least 5 digits of the phone number' },
          { status: 400 }
        );
      }
      // Separator-tolerant DB pre-filter on the significant digits, then match in JS.
      const pattern = significantDigits(digits).split('').join('\\D*');
      const schedules = await Schedule.find({ 'bookings.phone': { $regex: pattern } }).sort({
        departureUTC: 1,
      });
      const bookings = schedules.flatMap((s) =>
        s.bookings.filter((b) => phoneMatches(b.phone, digits)).map((b) => serializeBooking(s, b))
      );
      return NextResponse.json(bookings);
    }

    return NextResponse.json(
      { error: 'Provide an email or phone query parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
