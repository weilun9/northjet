import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, signToken, setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** POST /api/auth/register – create an account and start a session. */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json().catch(() => null);
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').toLowerCase().trim();
    const password = String(body?.password || '');

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const user = await User.create({ name, email, passwordHash: hashPassword(password) });
    setSessionCookie(signToken({ uid: String(user._id), email: user.email, name: user.name }));

    return NextResponse.json(
      { id: String(user._id), name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
