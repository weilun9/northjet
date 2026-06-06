import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { generateSchedules } from '@/lib/scheduleGenerator';
import { makeUniqueBookingRef } from '@/lib/bookingRef';

export const dynamic = 'force-dynamic';

/**
 * Seeding wipes and reloads the whole database, so in production it must be
 * authorised with a secret. In development it's open (used by the dev-only button).
 * Prod usage: POST /api/seed?key=<AUTH_SECRET>  (or header x-seed-secret).
 */
function seedAuthorised(request: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'production') return true;
  const provided =
    request.headers.get('x-seed-secret') ||
    new URL(request.url).searchParams.get('key') ||
    '';
  return Boolean(process.env.AUTH_SECRET) && provided === process.env.AUTH_SECRET;
}

type Passenger = { name: string; email: string; phone: string };

// Minimal built-in fallback so seeding never hard-fails if the CSV is unreadable.
const FALLBACK_PASSENGERS: Passenger[] = [
  { name: 'Mr Ojas Naik', email: 'ojas.naik@proton.com', phone: '+64 21 100 0001' },
  { name: 'Miss Ella Lee', email: 'ella.lee@blobmail.com', phone: '+64 21 100 0002' },
  { name: 'Mrs Hannah King', email: 'hannah.king@bazooka.com', phone: '+64 21 100 0003' },
  { name: 'Mr Leroy Thompson', email: 'leroy.thompson@proton.com', phone: '+64 21 100 0004' },
  { name: 'Mr Miguel Williamson', email: 'miguel.williamson@quark.co.nz', phone: '+64 21 100 0005' },
  { name: 'Mrs Carol Steward', email: 'carol.steward@yippee.com', phone: '+64 21 100 0006' },
  { name: 'Mr Deniz Adan', email: 'deniz.adan@quark.co.nz', phone: '+64 21 100 0007' },
  { name: 'Mr Edwin Fowler', email: 'edwin.fowler@blobmail.com', phone: '+64 21 100 0008' },
];

function loadPassengers(): Passenger[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'randomnames.csv');
    const lines = fs.readFileSync(csvPath, 'utf-8').trim().split('\n');
    const parsed = lines.map((line, i) => {
      const cols = line.split(',');
      const title = cols[1]?.trim() ?? '';
      const first = cols[2]?.trim() ?? '';
      const last  = cols[3]?.trim() ?? '';
      const email = cols[5]?.trim() ?? '';
      const phone = `+64 21 ${String(i + 1).padStart(3, '0')} ${String((i * 7 + 1) % 9000 + 1000)}`;
      return { name: `${title} ${first} ${last}`, email, phone };
    }).filter((p) => p.email.includes('@'));
    return parsed.length > 0 ? parsed : FALLBACK_PASSENGERS;
  } catch (e) {
    console.warn('Could not read randomnames.csv, using fallback passengers:', e);
    return FALLBACK_PASSENGERS;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(request: NextRequest) {
  try {
    if (!seedAuthorised(request)) {
      return NextResponse.json(
        { error: 'Forbidden — seeding is disabled in production without a valid key.' },
        { status: 403 }
      );
    }

    await connectDB();

    await Schedule.deleteMany({});

    const allPassengers = loadPassengers();

    type RawSchedule = {
      departureUTC: Date;
      totalSeats: number;
      bookings: object[];
    };

    const schedules = generateSchedules(new Date(), 8) as RawSchedule[];
    const now = new Date();
    const usedRefs = new Set<string>();

    for (const s of schedules) {
      const isPast = s.departureUTC < now;

      // Past flights: 50–100% full. Future flights: 0–60% full.
      const minFill = isPast ? 0.5 : 0;
      const maxFill = isPast ? 1.0 : 0.6;
      const fillRatio = minFill + Math.random() * (maxFill - minFill);
      const bookingCount = Math.min(
        s.totalSeats,
        Math.round(s.totalSeats * fillRatio),
      );

      if (bookingCount === 0) continue;

      const passengers = shuffle(allPassengers).slice(0, bookingCount);
      const bookedAt = new Date(s.departureUTC.getTime() - Math.random() * 14 * 86400_000);

      s.bookings = passengers.map((p) => ({
        bookingRef: makeUniqueBookingRef(usedRefs),
        email: p.email,
        phone: p.phone,
        passengers: [{ name: p.name }],
        bookedAt,
        status: 'confirmed',
      }));
    }

    await Schedule.insertMany(schedules);

    const totalBookings = schedules.reduce((n, s) => n + s.bookings.length, 0);

    return NextResponse.json({
      message: `Database seeded with ${schedules.length} flights and ${totalBookings} pre-existing bookings.`,
      flights: schedules.length,
      bookings: totalBookings,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seeding failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST to this endpoint to seed the database.' });
}
