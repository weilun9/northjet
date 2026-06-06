'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plane, Menu, X, BookOpen, Search, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState('');

  const navLinks = [
    { href: '/', label: 'Flights' },
    { href: '/my-bookings', label: 'My Bookings' },
  ];

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg('');
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMsg(res.ok ? `✓ ${data.flights} flights · ${data.bookings} bookings` : '✗ Seed failed');
    } catch {
      setSeedMsg('✗ Error');
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedMsg(''), 4000);
    }
  }

  async function handleLogout() {
    setMenuOpen(false);
    setMobileOpen(false);
    await logout();
    router.push('/');
  }

  const initials = user
    ? user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/20">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-200">
              <Plane className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-sora font-bold text-xl text-white tracking-tight">
              North<span className="text-primary">Jet</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-1.5 py-2 text-sm font-medium transition-colors ${
                  isActive(href) ? 'text-primary' : 'text-gray-400 hover:text-white'
                }`}
              >
                {href === '/' ? <Search className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {label}
                <span
                  className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-primary origin-left transition-transform duration-300 ${
                    isActive(href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Dev seed button — development only */}
            {process.env.NODE_ENV === 'development' && (
              <div className="hidden md:flex items-center gap-2">
                {seedMsg && (
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    seedMsg.startsWith('✓') ? 'bg-emerald-900/60 text-emerald-400' : 'bg-red-900/60 text-red-400'
                  }`}>
                    {seedMsg}
                  </span>
                )}
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="text-xs text-gray-500 hover:text-primary border border-dashed border-white/20 hover:border-primary px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  title="Seed database with 8 weeks of flights"
                >
                  {seeding ? 'Seeding…' : '⚡ Seed DB'}
                </button>
              </div>
            )}

            {/* Auth area (desktop) */}
            <div className="hidden md:block relative">
              {loading ? (
                <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />
              ) : user ? (
                <>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-white/20 hover:border-primary hover:bg-white/10 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {initials}
                    </span>
                    <span className="text-sm font-medium text-gray-200 max-w-[110px] truncate">{user.name}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-xl shadow-xl border border-white/10 py-2 z-50">
                        <div className="px-4 py-2 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link
                          href="/my-bookings"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                        >
                          <BookOpen className="w-4 h-4 text-gray-500" /> My Bookings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 btn-primary text-sm py-2 px-4"
                >
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 py-3 space-y-1">
            {/* User block */}
            {user ? (
              <div className="px-4 py-3 mb-1 flex items-center gap-3 bg-white/5 rounded-lg mx-1">
                <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                  {initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 btn-primary mx-1 mb-2"
              >
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}

            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href) ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {href === '/' ? <Search className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                {label}
              </Link>
            ))}

            {user && (
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            )}

            {process.env.NODE_ENV === 'development' && (
              <div className="px-4 pt-2 border-t border-white/10">
                <button
                  onClick={() => { handleSeed(); setMobileOpen(false); }}
                  disabled={seeding}
                  className="text-xs text-gray-500 border border-dashed border-white/20 px-3 py-1.5 rounded-lg w-full text-center"
                >
                  {seeding ? 'Seeding…' : '⚡ Seed Database'}
                </button>
                {seedMsg && (
                  <p className={`text-xs mt-1 text-center font-medium ${
                    seedMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'
                  }`}>{seedMsg}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
