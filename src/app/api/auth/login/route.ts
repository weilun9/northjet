import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, signToken, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** POST /api/auth/login – verify credentials and start a session. */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      // Same message for both cases to avoid leaking which emails exist.
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    setSessionCookie(signToken({ uid: String(user._id), email: user.email, name: user.name }));
    return NextResponse.json({ id: String(user._id), name: user.name, email: user.email });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
