import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { serializeFlight } from '@/lib/serializers';

export const dynamic = 'force-dynamic';

/** GET /api/flights/[flightId] – fetch a single scheduled flight with live availability. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { flightId: string } }
) {
  try {
    await connectDB();

    if (!mongoose.isValidObjectId(params.flightId)) {
      return NextResponse.json({ error: 'Invalid flight id' }, { status: 400 });
    }

    const schedule = await Schedule.findById(params.flightId);
    if (!schedule) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    return NextResponse.json(serializeFlight(schedule));
  } catch (error) {
    console.error('Flight detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
