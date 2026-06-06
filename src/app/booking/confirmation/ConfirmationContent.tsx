'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, CheckCircle2, ArrowRight, Loader2, AlertCircle,
  MapPin, Clock, User, Mail, Phone, Calendar, Download,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AIRPORTS } from '@/lib/airports';
import { BookingWithFlight } from '@/types';
import { formatTime, formatDateFull, formatDateShort, flightDuration, zoneAbbr } from '@/lib/timeUtils';

export default function ConfirmationContent() {
  const params = useSearchParams();
  const ref = params.get('ref');

  const [booking, setBooking] = useState<BookingWithFlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ref) {
      setError('No booking reference found.');
      setLoading(false);
      return;
    }
    fetch(`/api/bookings/${ref}`)
      .then((r) => {
        if (!r.ok) throw new Error('Booking not found');
        return r.json();
      })
      .then(setBooking)
      .catch(() => setError('Could not load booking. Check your reference number.'))
      .finally(() => setLoading(false));
  }, [ref]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#F7F9FC] flex items-center justify-center p-8">
          <div className="card p-10 text-center max-w-sm">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="font-sora font-bold text-xl text-navy mb-2">Booking Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">{error}</p>
            <Link href="/" className="btn-primary inline-flex">Back to Search</Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const origin = AIRPORTS[booking.origin];
  const destination = AIRPORTS[booking.destination];
  const duration = flightDuration(booking.departureUTC, booking.arrivalUTC);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F9FC] py-10">
        <div className="page-container max-w-3xl">
          {/* Success banner */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 mb-8 text-white flex items-center gap-4 shadow-lg animate-fade-up">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-sora font-bold text-xl md:text-2xl mb-0.5">Booking Confirmed!</h1>
              <p className="text-emerald-100 text-sm">
                Your seat is reserved. Check in at Dairy Flat Airport 30 minutes before departure.
              </p>
            </div>
          </div>

          {/* Booking reference card */}
          <div className="card p-6 mb-6 border-2 border-primary/20 animate-fade-up" style={{ animationDelay: '0.08s' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                  Booking Reference
                </p>
                <p className="font-sora font-bold text-3xl text-primary tracking-widest">
                  {booking.bookingRef}
                </p>
              </div>
              <div className="text-right">
                <span className="badge badge-green text-sm px-3 py-1.5">
                  ✓ {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
                <p className="text-xs text-gray-400 mt-2">
                  Booked {new Date(booking.bookedAt).toLocaleDateString('en-NZ', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice card */}
          <div className="card overflow-hidden mb-6 animate-fade-up" style={{ animationDelay: '0.16s' }}>
            {/* Flight route header */}
            <div className="bg-navy p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/40 flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">NorthJet · Flight {booking.flightNumber}</p>
                  <p className="text-sm font-semibold">{booking.aircraft}</p>
                </div>
              </div>

              {/* Times */}
              <div className="flex items-center gap-4">
                {/* Departure */}
                <div>
                  <p className="font-sora font-bold text-3xl leading-none">
                    {formatTime(booking.departureUTC, origin.timezone)}
                  </p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">{origin.code}</p>
                  <p className="text-xs text-gray-400">{origin.city}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateFull(booking.departureUTC, origin.timezone)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{zoneAbbr(booking.departureUTC, origin.timezone, origin.tzLabel)}</p>
                </div>

                {/* Duration */}
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1">{duration}</span>
                  <div className="w-full flex items-center gap-1">
                    <div className="flex-1 h-px bg-gray-600" />
                    <Plane className="w-4 h-4 text-primary" />
                    <div className="flex-1 h-px bg-gray-600" />
                  </div>
                  <span className="text-xs text-accent font-semibold mt-1">Direct</span>
                </div>

                {/* Arrival */}
                <div className="text-right">
                  <p className="font-sora font-bold text-3xl leading-none">
                    {formatTime(booking.arrivalUTC, destination.timezone)}
                  </p>
                  <p className="text-sm font-semibold text-gray-300 mt-1">{destination.code}</p>
                  <p className="text-xs text-gray-400">{destination.city}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateFull(booking.arrivalUTC, destination.timezone)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{zoneAbbr(booking.arrivalUTC, destination.timezone, destination.tzLabel)}</p>
                </div>
              </div>
            </div>

            {/* Details grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Passenger */}
              <div>
                <h3 className="font-sora font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
                  Passenger{booking.passengers.length !== 1 ? 's' : ''} ({booking.passengers.length})
                </h3>
                <div className="space-y-2.5">
                  {booking.passengers.map((pName, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm">
                      <User className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-navy">{pName}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2.5 text-sm">
                    <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600">{booking.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600">{booking.phone}</span>
                  </div>
                </div>
              </div>

              {/* Journey */}
              <div>
                <h3 className="font-sora font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
                  Journey Details
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600">{origin.name} → {destination.name}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600">
                      {formatDateShort(booking.departureUTC, origin.timezone)}, {formatTime(booking.departureUTC, origin.timezone)} {zoneAbbr(booking.departureUTC, origin.timezone, origin.tzLabel)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-600">Duration: {duration}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price summary */}
            <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
              <h3 className="font-sora font-semibold text-sm text-gray-500 uppercase tracking-wider mb-3">
                Price Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Base Fare (per seat)</span>
                  <span className="font-medium">NZ${booking.price}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Airport Taxes & Fees</span>
                  <span className="font-medium text-accent">Included</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Passengers</span>
                  <span className="font-medium">{booking.seats}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-200">
                  <span className="text-navy">Total Paid</span>
                  <span className="text-primary text-xl font-sora">NZ${booking.price * booking.seats}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 animate-fade-up" style={{ animationDelay: '0.24s' }}>
            <Link href="/" className="btn-primary flex items-center gap-2">
              <Plane className="w-4 h-4" />
              Book Another Flight
            </Link>
            <Link href="/my-bookings" className="btn-outline flex items-center gap-2">
              View My Bookings
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Important info */}
          <div className="mt-6 card p-5 bg-blue-50 border-blue-200 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <h4 className="font-semibold text-blue-800 text-sm mb-2">Important Information</h4>
            <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
              <li>Please arrive at Dairy Flat Airport at least 30 minutes before departure.</li>
              <li>Bring a valid photo ID. All times are shown in local airport time.</li>
              <li>Cancellations must be made before the flight departs via the My Bookings page.</li>
              <li>Your booking reference is <strong>{booking.bookingRef}</strong> — save this for your records.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
