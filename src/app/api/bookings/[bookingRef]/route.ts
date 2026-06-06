import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { serializeBooking } from '@/lib/serializers';
import { getSession } from '@/lib/auth';
import { phoneDigits, phoneMatches } from '@/lib/phone';

export const dynamic = 'force-dynamic';

/** GET /api/bookings/[bookingRef] – a single booking with its flight details. */
export async function GET(
  _request: NextRequest,
  { params }: { params: { bookingRef: string } }
) {
  try {
    await connectDB();

    const schedule = await Schedule.findOne({ 'bookings.bookingRef': params.bookingRef });
    const booking = schedule?.bookings.find((b) => b.bookingRef === params.bookingRef);
    if (!schedule || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(serializeBooking(schedule, booking));
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** DELETE /api/bookings/[bookingRef] – cancel a booking (frees the seat). */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingRef: string } }
) {
  try {
    await connectDB();

    const schedule = await Schedule.findOne({ 'bookings.bookingRef': params.bookingRef });
    const booking = schedule?.bookings.find((b) => b.bookingRef === params.bookingRef);
    if (!schedule || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Ownership check: prove the booking's email OR phone — via an authenticated session
    // or a matching ?email= / ?phone=. Stops arbitrary ref-based cancels.
    const session = getSession();
    const sp = new URL(request.url).searchParams;
    const requesterEmail = (session?.email || sp.get('email') || '').toLowerCase().trim();
    const requesterPhone = phoneDigits(sp.get('phone') || '');
    const ownsByEmail = !!requesterEmail && booking.email === requesterEmail;
    const ownsByPhone = phoneMatches(booking.phone, requesterPhone);
    if (!ownsByEmail && !ownsByPhone) {
      return NextResponse.json({ error: 'Not authorised to cancel this booking.' }, { status: 403 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Booking is already cancelled' }, { status: 400 });
    }
    if (schedule.departureUTC <= new Date()) {
      return NextResponse.json(
        { error: 'Cannot cancel a booking for a flight that has already departed' },
        { status: 400 }
      );
    }

    booking.status = 'cancelled';
    await schedule.save();

    return NextResponse.json({ message: 'Booking cancelled successfully', bookingRef: params.bookingRef });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
