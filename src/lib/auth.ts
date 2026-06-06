import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET = process.env.AUTH_SECRET || 'dev-insecure-secret-change-me';
export const SESSION_COOKIE = 'nj_session';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export interface SessionPayload {
  uid: string;
  email: string;
  name: string;
  exp: number; // unix seconds
}

// ── Password hashing (scrypt) ────────────────────────────────────────────
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return test.length === expected.length && crypto.timingSafeEqual(test, expected);
}

// ── Stateless session token: base64url(payload).HMAC-SHA256 ───────────────
export function signToken(data: Omit<SessionPayload, 'exp'>): string {
  const payload: SessionPayload = { ...data, exp: Math.floor(Date.now() / 1000) + MAX_AGE };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string): SessionPayload | null {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Cookie helpers (call inside route handlers) ──────────────────────────
export function setSessionCookie(token: string): void {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(): void {
  cookies().set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}

export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
