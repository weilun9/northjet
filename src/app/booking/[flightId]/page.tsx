'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, Clock, ArrowRight, AlertCircle, Loader2,
  User, Mail, Phone, ChevronRight, ArrowLeft, CheckCircle, Minus, Plus,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AIRPORTS } from '@/lib/airports';
import { FlightSummary } from '@/types';
import { formatTime, formatDateFull, flightDuration } from '@/lib/timeUtils';
import { useAuth } from '@/context/AuthContext';

export default function BookingPage() {
  const { flightId } = useParams<{ flightId: string }>();
  const router = useRouter();

  const [flight, setFlight] = useState<FlightSummary | null>(null);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [passengers, setPassengers] = useState<string[]>(['']);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Prefill the lead passenger + contact for a signed-in user (still editable).
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      setPassengers((p) => (p[0] ? p : [user.name, ...p.slice(1)]));
      setEmail((e) => e || user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!flightId) return;
    fetch(`/api/flights/${flightId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Flight not found');
        return r.json();
      })
      .then(setFlight)
      .catch(() => setLoadError('Flight not found or unavailable.'));
  }, [flightId]);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    const names = passengers.map((n) => n.trim());
    if (names.some((n) => !n)) {
      setFormError('Please enter a name for every passenger.');
      return;
    }
    if (!email.trim() || !phone.trim()) {
      setFormError('Email and phone number are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightId, passengers: names, email, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Booking failed. Please try again.');
      } else {
        router.push(`/booking/confirmation?ref=${data.bookingRef}`);
      }
    } catch {
      setFormError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-8">
          <div className="card p-10 text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="font-sora font-bold text-xl text-navy mb-2">Flight Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">{loadError}</p>
            <Link href="/" className="btn-primary inline-flex">Back to Search</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const origin = flight ? AIRPORTS[flight.origin] : null;
  const destination = flight ? AIRPORTS[flight.destination] : null;

  const maxPassengers = flight ? Math.max(1, Math.min(flight.availableSeats, 6)) : 1;
  const seatCount = passengers.length;
  const totalPrice = flight ? flight.price * seatCount : 0;

  const steps = ['Flights', 'Passengers', 'Review', 'Confirmation'];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F9FC]">
        {/* Progress stepper */}
        <div className="bg-white border-b border-gray-100 py-4">
          <div className="page-container">
            <div className="flex items-center gap-2">
              {steps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 ${i < 2 ? 'text-gray-400' : i === 2 ? 'text-primary' : 'text-gray-400'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${i < 2 ? 'bg-gray-100 text-gray-400'
                        : i === 2 ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-400'}`}>
                      {i < 2 ? <CheckCircle className="w-4 h-4 text-accent" /> : i + 1}
                    </div>
                    <span className={`hidden sm:block text-xs font-semibold ${i === 2 ? 'text-primary' : 'text-gray-400'}`}>
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="page-container py-8">
          <Link href="/flights" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to flights
          </Link>

          {!flight ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* ── Passenger Form ───────────────────────────── */}
              <div className="lg:col-span-2">
                <div className="card p-6 md:p-8 animate-fade-up">
                  <h1 className="font-sora font-bold text-xl text-navy mb-1">Passenger Details</h1>
                  <p className="text-gray-500 text-sm mb-6">Enter your information to complete the booking</p>

                  <form onSubmit={handleBook} className="space-y-5">
                    {/* Passengers */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="label mb-0">Passengers</label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPassengers((p) => (p.length > 1 ? p.slice(0, -1) : p))}
                            disabled={passengers.length <= 1}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:hover:border-gray-200"
                            aria-label="Remove passenger"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center font-semibold text-navy">{passengers.length}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers((p) => (p.length < maxPassengers ? [...p, ''] : p))}
                            disabled={passengers.length >= maxPassengers}
                            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:hover:border-gray-200"
                            aria-label="Add passenger"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {passengers.map((p, i) => (
                          <div key={i} className="relative animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder={`Passenger ${i + 1} full name`}
                              value={p}
                              onChange={(e) =>
                                setPassengers((arr) => arr.map((v, idx) => (idx === i ? e.target.value : v)))
                              }
                              className="input-field pl-10"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-1.5">
                        {maxPassengers} seat{maxPassengers !== 1 ? 's' : ''} available — add up to {maxPassengers} passenger{maxPassengers !== 1 ? 's' : ''} per booking.
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="label" htmlFor="email">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Your booking confirmation will be sent here</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="label" htmlFor="phone">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+64 21 123 4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input-field pl-10"
                          required
                        />
                      </div>
                    </div>

                    {/* Error */}
                    {formError && (
                      <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {formError}
                      </div>
                    )}

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting || flight.availableSeats === 0}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Confirming…
                          </>
                        ) : (
                          <>
                            Confirm Booking · NZ${totalPrice}
                            <ChevronRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                      {flight.availableSeats === 0 && (
                        <p className="text-red-500 text-xs text-center mt-2">This flight is fully booked.</p>
                      )}
                      <p className="text-xs text-gray-400 text-center mt-3">
                        By confirming, you agree to our terms and cancellation policy.
                      </p>
                    </div>
                  </form>
                </div>
              </div>

              {/* ── Trip Summary Sidebar ─────────────────────── */}
              <div className="space-y-4">
                <div className="card p-6 sticky top-24 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-sora font-bold text-base text-navy">Trip Summary</h2>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold text-navy">{origin?.city}</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-navy">{destination?.city}</span>
                  </div>

                  {/* Flight details */}
                  <div className="bg-primary-light rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Plane className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Flight</p>
                        <p className="text-sm font-bold text-navy">{flight.flightNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-sora font-bold text-xl text-navy leading-none">
                          {formatTime(flight.departureUTC, origin!.timezone)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{origin?.code}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateFull(flight.departureUTC, origin!.timezone)}
                        </p>
                      </div>
                      <div className="flex flex-col items-center px-2 pt-1">
                        <span className="text-xs text-gray-400">{flightDuration(flight.departureUTC, flight.arrivalUTC)}</span>
                        <div className="flex items-center gap-1 my-1">
                          <div className="w-10 h-px bg-gray-300" />
                          <Plane className="w-3 h-3 text-primary rotate-90" />
                          <div className="w-10 h-px bg-gray-300" />
                        </div>
                        <span className="text-xs text-accent font-semibold">Direct</span>
                      </div>
                      <div className="text-right">
                        <p className="font-sora font-bold text-xl text-navy leading-none">
                          {formatTime(flight.arrivalUTC, destination!.timezone)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{destination?.code}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDateFull(flight.arrivalUTC, destination!.timezone)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1 border-t border-primary/10">
                      <Clock className="w-3.5 h-3.5" />
                      {flight.aircraft}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Availability</span>
                    <span className={`font-semibold ${flight.availableSeats === 0 ? 'text-red-500' : flight.availableSeats <= 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {flight.availableSeats === 0 ? 'Fully Booked' : `${flight.availableSeats} of ${flight.totalSeats} seats`}
                    </span>
                  </div>

                  {/* Price breakdown */}
                  <div className="border-t border-gray-100 pt-4 space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fare · NZ${flight.price} × {seatCount}</span>
                      <span className="font-medium">NZ${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Taxes & Fees</span>
                      <span className="font-medium text-accent">Included</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-2.5 mt-1">
                      <span className="text-navy">Total</span>
                      <span className="text-navy">NZ${totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Cancellation note */}
                <div className="card p-4 bg-amber-50 border-amber-200 animate-fade-up" style={{ animationDelay: '0.18s' }}>
                  <p className="text-xs text-amber-700 font-medium">
                    ⚠️ Cancellation is available until flight departure. Bookings on full flights cannot be made.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
