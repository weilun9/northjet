import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** GET /api/auth/me – current user from the session cookie, or null. */
export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: { id: session.uid, name: session.name, email: session.email },
  });
}
