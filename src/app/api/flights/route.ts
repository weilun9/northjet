import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { AIRPORTS, isValidRoute } from '@/lib/airports';
import { serializeFlight } from '@/lib/serializers';
import { zonedWallToUTC } from '@/lib/tz';

export const dynamic = 'force-dynamic';

/** Convert a local calendar date (YYYY-MM-DD, midnight) in a timezone into a UTC instant. */
function localDateToUTC(dateStr: string, timeZone: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return zonedWallToUTC(y, m - 1, d, 0, 0, timeZone);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

/**
 * GET /api/flights
 *   ?orig=NZNE&dest=YSSY&date1=2026-06-10&date2=2026-06-30   (canonical: date range)
 *   ?orig=NZNE&dest=YSSY&date=2026-06-10&days=14             (start + window length)
 *
 * Returns scheduled flights on the route departing within the window, soonest first.
 * Already-departed flights are never returned.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orig = searchParams.get('orig');
    const dest = searchParams.get('dest');

    if (!orig || !dest) {
      return NextResponse.json(
        { error: 'Missing required parameters: orig and dest' },
        { status: 400 }
      );
    }

    const originAirport = AIRPORTS[orig];
    if (!originAirport || !AIRPORTS[dest]) {
      return NextResponse.json({ error: 'Unknown origin or destination airport' }, { status: 400 });
    }
    if (!isValidRoute(orig, dest)) {
      return NextResponse.json({ error: `No direct route from ${orig} to ${dest}` }, { status: 400 });
    }

    // Resolve the search window (in the origin's local time → UTC).
    const date1 = searchParams.get('date1');
    const date2 = searchParams.get('date2');
    const date = searchParams.get('date');
    const days = Math.min(parseInt(searchParams.get('days') || '30', 10) || 30, 90);

    const tz = originAirport.timezone;
    let startUTC: Date;
    let endUTC: Date;

    if (date1) {
      startUTC = localDateToUTC(date1, tz);
      // date2 is an inclusive end date → extend to the following midnight.
      endUTC = date2 ? addDays(localDateToUTC(date2, tz), 1) : addDays(startUTC, 30);
    } else if (date) {
      startUTC = localDateToUTC(date, tz);
      endUTC = addDays(startUTC, days);
    } else {
      // No dates supplied → default to the next 30 days from now.
      startUTC = new Date();
      endUTC = addDays(startUTC, 30);
    }

    // Never surface flights that have already departed.
    const now = new Date();
    const effectiveStart = startUTC > now ? startUTC : now;
    if (endUTC <= effectiveStart) endUTC = addDays(effectiveStart, 1);

    const schedules = await Schedule.find({
      origin: orig,
      destination: dest,
      departureUTC: { $gte: effectiveStart, $lt: endUTC },
    }).sort({ departureUTC: 1 });

    return NextResponse.json(schedules.map(serializeFlight));
  } catch (error) {
    console.error('Flights API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
