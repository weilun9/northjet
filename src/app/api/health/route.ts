import { NextResponse } from 'next/server';
import connectDB, { hasMongoUri } from '@/lib/mongodb';
import Schedule from '@/models/Schedule';

export const dynamic = 'force-dynamic';

function classifyMongoError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('MONGODB_URI is not set')) return 'missing_mongodb_uri';
  if (message.includes('bad auth') || message.includes('Authentication failed')) {
    return 'authentication_failed';
  }
  if (
    message.includes('Server selection timed out') ||
    message.includes('querySrv') ||
    message.includes('ECONNREFUSED') ||
    message.includes('ETIMEDOUT')
  ) {
    return 'network_or_atlas_access';
  }

  return 'unknown_mongo_error';
}

export async function GET() {
  const mongoUriPresent = hasMongoUri();

  try {
    await connectDB();
    const scheduleCount = await Schedule.countDocuments();

    return NextResponse.json({
      ok: true,
      mongoUriPresent,
      database: 'connected',
      scheduleCount,
    });
  } catch (error) {
    const code = classifyMongoError(error);

    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        ok: false,
        mongoUriPresent,
        database: 'unavailable',
        code,
      },
      { status: 503 }
    );
  }
}
