'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, Mail, Lock, User, Loader2, AlertCircle,
  Eye, EyeOff, ArrowRight, ShieldCheck, Ticket, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { HERO_IMAGE } from '@/lib/airports';
import RotatingText from '@/components/RotatingText';

type Mode = 'login' | 'register';
const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, login, register } = useAuth();

  const redirect = params.get('redirect') || '/';
  const initialMode: Mode = params.get('mode') === 'register' ? 'register' : 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in → bounce to the redirect target.
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  function switchMode(next: Mode) {
    setMode(next);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'register' && !name.trim()) return setError('Please enter your name.');
    if (!EMAIL_RE.test(email)) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      router.replace(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const perks = [
    { icon: <Ticket className="w-4 h-4" />, text: 'Manage all your bookings in one place' },
    { icon: <ShieldCheck className="w-4 h-4" />, text: 'Faster, secure checkout' },
    { icon: <Clock className="w-4 h-4" />, text: 'Booking history at your fingertips' },
  ];

  return (
    <main className="min-h-screen grid lg:grid-cols-2">
      {/* ── Brand panel (left) ───────────────────────────────────────── */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-navy">
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/90 to-navy/70" />

        <Link href="/" className="relative flex items-center gap-2.5 group w-fit">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Plane className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-sora font-bold text-2xl text-white">
            North<span className="text-primary">Jet</span>
          </span>
        </Link>

        <div className="relative animate-fade-up">
          <p className="text-primary-light/80 text-sm font-semibold uppercase tracking-[0.2em] mb-3">
            Welcome to NorthJet
          </p>
          <h1 className="font-sora font-bold text-4xl xl:text-5xl text-white leading-tight mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>Fly to</span>
            <RotatingText
              texts={['Sydney', 'Rotorua', 'Great Barrier', 'Chatham Islands', 'Lake Tekapo']}
              mainClassName="px-3 bg-gradient-to-r from-primary to-accent text-white overflow-hidden py-1 justify-center rounded-xl"
              staggerFrom="last"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-1"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              rotationInterval={2200}
            />
          </h1>
          <p className="text-gray-300 mb-8 max-w-md">
            Sign in to book exclusive flights from Dairy Flat Airport and manage your journeys.
          </p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-gray-200 text-sm">
                <span className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-primary-light">
                  {p.icon}
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-gray-400">© 2026 NorthJet Airways</p>
      </div>

      {/* ── Form panel (right) ───────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-[#F7F9FC]">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <Link href="/" className="lg:hidden flex items-center gap-2.5 mb-8 w-fit">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow">
              <Plane className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-sora font-bold text-2xl text-navy">
              North<span className="text-primary">Jet</span>
            </span>
          </Link>

          <h2 className="font-sora font-bold text-2xl text-navy mb-1">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {mode === 'login'
              ? 'Welcome back! Enter your details to continue.'
              : 'Join NorthJet — it only takes a moment.'}
          </p>

          {/* Mode toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-navy'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="animate-fade-up" style={{ animationDelay: '0.04s' }}>
                <label className="label" htmlFor="name">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="name" type="text" placeholder="John Doe" autoComplete="name"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <label className="label" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email" type="email" placeholder="you@example.com" autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="animate-fade-up" style={{ animationDelay: '0.16s' }}>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password" type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                />
                <button
                  type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit" disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 animate-fade-up"
              style={{ animationDelay: '0.22s' }}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-primary font-semibold hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-primary">← Continue browsing without an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
