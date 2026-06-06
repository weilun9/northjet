'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Plane, ArrowRight, Mail, Phone, Info, Loader2, AlertCircle,
  CheckCircle2, XCircle, Calendar, Clock, ChevronRight, Trash2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { AIRPORTS } from '@/lib/airports';
import { BookingWithFlight } from '@/types';
import { formatTime, formatDateShort, formatDateFull, flightDuration, isFutureFlight, zoneAbbr } from '@/lib/timeUtils';
import { useAuth } from '@/context/AuthContext';

function BookingCard({
  booking,
  onCancel,
}: {
  booking: BookingWithFlight;
  onCancel: (ref: string) => void;
}) {
  const origin = AIRPORTS[booking.origin];
  const destination = AIRPORTS[booking.destination];
  if (!origin || !destination) return null;

  const isCancelled = booking.status === 'cancelled';
  const isPast = !isFutureFlight(booking.departureUTC);
  const canCancel = !isCancelled && !isPast;
  const duration = flightDuration(booking.departureUTC, booking.arrivalUTC);

  return (
    <div className={`card overflow-hidden transition-all ${isCancelled ? 'opacity-60' : ''}`}>
      {/* Status bar */}
      <div className={`h-1 ${isCancelled ? 'bg-red-400' : isPast ? 'bg-gray-300' : 'bg-accent'}`} />

      <div className="p-5 md:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              ${isCancelled ? 'bg-red-100' : isPast ? 'bg-gray-100' : 'bg-primary-light'}`}>
              <Plane className={`w-5 h-5 ${isCancelled ? 'text-red-400' : isPast ? 'text-gray-400' : 'text-primary'}`} />
            </div>
            <div>
              <p className="font-bold text-navy text-sm">{booking.flightNumber}</p>
              <p className="text-xs text-gray-400">{booking.aircraft}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {booking.bookingRef}
            </p>
            {isCancelled ? (
              <span className="badge badge-red mt-1.5">Cancelled</span>
            ) : isPast ? (
              <span className="badge bg-gray-100 text-gray-500 mt-1.5">Completed</span>
            ) : (
              <span className="badge badge-green mt-1.5">Confirmed</span>
            )}
          </div>
        </div>

        {/* Route times */}
        <div className="flex items-center gap-3 mb-4">
          <div className="text-center">
            <p className="font-sora font-bold text-xl text-navy leading-none">
              {formatTime(booking.departureUTC, origin.timezone)}
            </p>
            <p className="text-xs font-semibold text-primary mt-1">{booking.origin}</p>
            <p className="text-xs text-gray-400 mt-0.5">{zoneAbbr(booking.departureUTC, origin.timezone, origin.tzLabel)}</p>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-gray-400">{duration}</span>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-200" />
              <Plane className="w-3 h-3 text-primary" />
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <span className="text-xs font-semibold text-accent">Direct</span>
          </div>

          <div className="text-center">
            <p className="font-sora font-bold text-xl text-navy leading-none">
              {formatTime(booking.arrivalUTC, destination.timezone)}
            </p>
            <p className="text-xs font-semibold text-primary mt-1">{booking.destination}</p>
            <p className="text-xs text-gray-400 mt-0.5">{zoneAbbr(booking.arrivalUTC, destination.timezone, destination.tzLabel)}</p>
          </div>
        </div>

        {/* Date + price row */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDateFull(booking.departureUTC, origin.timezone)}
          </div>
          <div className="text-right">
            <p className="font-bold text-navy">NZ${booking.price * booking.seats}</p>
            <p className="text-[11px] text-gray-400">{booking.seats} passenger{booking.seats !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/booking/confirmation?ref=${booking.bookingRef}`}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 hover:bg-primary-light rounded-lg py-2 transition-colors"
          >
            View Details
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          {canCancel && (
            <button
              onClick={() => onCancel(booking.bookingRef)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 rounded-lg py-2 px-3 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Cancel confirmation dialog
function CancelDialog({
  bookingRef,
  onConfirm,
  onCancel,
  loading,
}: {
  bookingRef: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
        </div>
        <h3 className="font-sora font-bold text-lg text-navy text-center mb-2">Cancel Booking?</h3>
        <p className="text-sm text-gray-500 text-center mb-1">
          Booking reference: <span className="font-bold text-navy">{bookingRef}</span>
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          This action cannot be undone. Your seat will be released.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 btn-outline py-2.5"
            disabled={loading}
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-2.5 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type SearchBy = 'email' | 'phone';

export default function MyBookingsPage() {
  const [searchBy, setSearchBy] = useState<SearchBy>('email');
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<{ type: SearchBy; value: string } | null>(null);
  const [bookings, setBookings] = useState<BookingWithFlight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelRef, setCancelRef] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState('');

  async function fetchBookings(type: SearchBy, value: string) {
    setLoading(true);
    setError('');
    setCancelMsg('');
    try {
      const param =
        type === 'email'
          ? `email=${encodeURIComponent(value.toLowerCase().trim())}`
          : `phone=${encodeURIComponent(value.trim())}`;
      const res = await fetch(`/api/bookings?${param}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBookings(data);
      setSubmitted({ type, value: value.trim() });
    } catch {
      setError('Could not load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    fetchBookings(searchBy, query.trim());
  }

  async function handleCancelConfirm() {
    if (!cancelRef || !submitted) return;
    setCancelling(true);
    try {
      const param =
        submitted.type === 'email'
          ? `email=${encodeURIComponent(submitted.value)}`
          : `phone=${encodeURIComponent(submitted.value)}`;
      const res = await fetch(`/api/bookings/${cancelRef}?${param}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setCancelMsg(data.error || 'Failed to cancel booking.');
      } else {
        setCancelMsg(`Booking ${cancelRef} has been cancelled.`);
        await fetchBookings(submitted.type, submitted.value);
      }
    } catch {
      setCancelMsg('Network error. Please try again.');
    } finally {
      setCancelling(false);
      setCancelRef(null);
    }
  }

  // Auto-load bookings for a signed-in user using their account email.
  const { user } = useAuth();
  useEffect(() => {
    if (user && !submitted) {
      setSearchBy('email');
      setQuery(user.email);
      fetchBookings('email', user.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' && isFutureFlight(b.departureUTC)
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== 'confirmed' || !isFutureFlight(b.departureUTC)
  );

  return (
    <>
      <Navbar />

      {cancelRef && (
        <CancelDialog
          bookingRef={cancelRef}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelRef(null)}
          loading={cancelling}
        />
      )}

      <main className="min-h-screen bg-[#F7F9FC]">
        {/* Page header */}
        <div className="bg-navy py-10">
          <div className="page-container">
            <h1 className="font-sora font-bold text-3xl text-white mb-2">My Bookings</h1>
            <p className="text-gray-400 text-sm">Look up your flights by email or phone number — no login required</p>
          </div>
        </div>

        <div className="page-container py-8">
          {/* Search */}
          <div className="card p-6 mb-6">
            {/* Search-by toggle */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Search by</span>
              <div className="inline-flex p-0.5 bg-gray-100 rounded-lg">
                {(['email', 'phone'] as SearchBy[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setSearchBy(t); setError(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all ${
                      searchBy === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-navy'
                    }`}
                  >
                    {t === 'email' ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                {searchBy === 'email' ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input
                  type={searchBy === 'email' ? 'email' : 'tel'}
                  inputMode={searchBy === 'email' ? 'email' : 'tel'}
                  placeholder={searchBy === 'email' ? 'name@example.com' : 'e.g. +64 21 123 4567'}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 sm:w-auto disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Find Bookings
              </button>
            </form>

            {/* Inline guidance */}
            <p className="text-xs text-gray-400 mt-2.5 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 mt-px flex-shrink-0" />
              {searchBy === 'email'
                ? 'Enter the email you booked with — capitalisation doesn’t matter.'
                : 'Enter the phone number you booked with — spaces, dashes and the +64 prefix are all fine.'}
            </p>
          </div>

          {/* How it works — user guidance */}
          <div className="card p-5 mb-8 bg-primary-light/40 border-primary/10">
            <h3 className="font-sora font-semibold text-sm text-navy mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" /> How it works
            </h3>
            <ol className="space-y-2.5 text-sm text-gray-600">
              {[
                'Search with the email or phone number you booked with.',
                'See all your flights, split into Upcoming and Past & Cancelled.',
                'Open any booking for the full invoice, or cancel an upcoming flight any time before it departs.',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-px">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>

          {/* Cancel success message */}
          {cancelMsg && (
            <div className={`flex items-center gap-2.5 p-4 rounded-xl mb-6 text-sm font-medium
              ${cancelMsg.includes('cancelled') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {cancelMsg.includes('cancelled') ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {cancelMsg}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          )}

          {/* Results */}
          {!loading && submitted && bookings.length === 0 && !error && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                {submitted.type === 'email'
                  ? <Mail className="w-7 h-7 text-primary" />
                  : <Phone className="w-7 h-7 text-primary" />}
              </div>
              <h3 className="font-sora font-bold text-lg text-navy mb-2">No bookings found</h3>
              <p className="text-gray-500 text-sm mb-6">
                No bookings found for <strong>{submitted.value}</strong>.<br />
                Make sure you&apos;re using the {submitted.type === 'email' ? 'email address' : 'phone number'} you booked with.
              </p>
              <Link href="/" className="btn-primary inline-flex">
                Search & Book a Flight
              </Link>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="space-y-8">
              <p className="text-sm text-gray-500 font-medium">
                Showing {bookings.length} booking{bookings.length !== 1 ? 's' : ''} for{' '}
                <span className="text-navy font-semibold">{submitted?.value}</span>
              </p>

              {/* Upcoming */}
              {upcomingBookings.length > 0 && (
                <div>
                  <h2 className="font-sora font-bold text-base text-navy mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    Upcoming Flights ({upcomingBookings.length})
                  </h2>
                  <Reveal stagger className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingBookings.map((b) => (
                      <BookingCard key={b.bookingRef} booking={b} onCancel={setCancelRef} />
                    ))}
                  </Reveal>
                </div>
              )}

              {/* Past / Cancelled */}
              {pastBookings.length > 0 && (
                <div>
                  <h2 className="font-sora font-bold text-base text-gray-400 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    Past & Cancelled ({pastBookings.length})
                  </h2>
                  <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pastBookings.map((b) => (
                      <BookingCard key={b.bookingRef} booking={b} onCancel={setCancelRef} />
                    ))}
                  </Reveal>
                </div>
              )}
            </div>
          )}

          {/* Empty state prompt */}
          {!loading && !submitted && (
            <div className="card p-12 text-center border-2 border-dashed border-gray-200 bg-transparent shadow-none">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg text-navy mb-2">Find Your Bookings</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Enter the email or phone number you used when booking to view all your NorthJet flights.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
