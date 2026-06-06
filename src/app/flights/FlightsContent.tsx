'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plane, ChevronRight, ArrowRight, AlertCircle, Loader2, ArrowLeft,
  CalendarDays, Search as SearchIcon, ArrowLeftRight, Info,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Reveal from '@/components/Reveal';
import { AIRPORTS, destinationsFrom, getRouteInfo } from '@/lib/airports';
import { FlightSummary } from '@/types';
import {
  formatTime, formatDateShort, formatDateFull, formatDateInput,
  flightDuration, todayInputValue, zoneAbbr,
} from '@/lib/timeUtils';

const SEARCH_HORIZON_DAYS = 30;

function addDaysToInput(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

function FlightCard({ flight, onSelect }: { flight: FlightSummary; onSelect: () => void }) {
  const origin = AIRPORTS[flight.origin];
  const destination = AIRPORTS[flight.destination];
  if (!origin || !destination) return null;

  const depTime = formatTime(flight.departureUTC, origin.timezone);
  const arrTime = formatTime(flight.arrivalUTC, destination.timezone);
  const depDate = formatDateShort(flight.departureUTC, origin.timezone);
  const arrDate = formatDateShort(flight.arrivalUTC, destination.timezone);
  const duration = flightDuration(flight.departureUTC, flight.arrivalUTC);
  const isSameDay = depDate === arrDate;

  return (
    <div className="card p-0 overflow-hidden hover:shadow-card-hover transition-all duration-200">
      <div className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {/* Airline badge */}
          <div className="flex-shrink-0 flex flex-row md:flex-col items-center gap-3 md:gap-1 md:w-16">
            <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <p className="text-xs text-gray-400 font-medium">NorthJet</p>
          </div>

          {/* Flight times */}
          <div className="flex-1 flex items-center gap-2 md:gap-4">
            <div className="text-center min-w-[68px]">
              <p className="font-sora font-bold text-2xl text-navy leading-none">{depTime}</p>
              <p className="text-xs font-semibold text-primary mt-1">{flight.origin}</p>
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{depDate}</p>
              <p className="text-xs text-gray-400">{zoneAbbr(flight.departureUTC, origin.timezone, origin.tzLabel)}</p>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">{duration}</span>
              <div className="w-full flex items-center gap-1">
                <div className="flex-1 h-px bg-gray-200" />
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <span className="text-[11px] font-semibold text-accent">Direct</span>
            </div>

            <div className="text-center min-w-[68px]">
              <p className="font-sora font-bold text-2xl text-navy leading-none">{arrTime}</p>
              <p className="text-xs font-semibold text-primary mt-1">{flight.destination}</p>
              <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">{arrDate}</p>
              <p className="text-xs text-gray-400">{zoneAbbr(flight.arrivalUTC, destination.timezone, destination.tzLabel)}</p>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-gray-100 flex-shrink-0" />

          {/* Price + CTA */}
          <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 md:w-36">
            <div>
              <p className="text-xs text-gray-400 md:text-right">per passenger</p>
              <p className="font-sora font-bold text-2xl text-navy">NZ${flight.price}</p>
            </div>
            <button
              onClick={onSelect}
              disabled={flight.availableSeats === 0}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {flight.availableSeats === 0 ? 'Full' : 'Select'}
              {flight.availableSeats > 0 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="mt-4 pt-3.5 border-t border-gray-100 flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Plane className="w-3 h-3" /> {flight.aircraft}
          </span>
          <span className="text-xs text-gray-400">Flight {flight.flightNumber}</span>

          {flight.availableSeats === 0 && <span className="badge badge-red">Fully Booked</span>}
          {flight.availableSeats > 0 && flight.availableSeats <= 2 && (
            <span className="badge badge-red">
              ⚡ Only {flight.availableSeats} seat{flight.availableSeats !== 1 ? 's' : ''} left!
            </span>
          )}
          {flight.availableSeats > 2 && (
            <span className="badge badge-green">{flight.availableSeats} seats available</span>
          )}
          {!isSameDay && <span className="badge badge-blue">Next day arrival</span>}
        </div>
      </div>
    </div>
  );
}

export default function FlightsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const origParam = params.get('orig') || 'NZNE';
  const destParam = params.get('dest') || 'YSSY';
  const dateParam = params.get('date') || todayInputValue();

  const [flights, setFlights] = useState<FlightSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [orig, setOrig] = useState(origParam);
  const [dest, setDest] = useState(destParam);
  const [date, setDate] = useState(dateParam);

  const fetchFlights = useCallback(async (o: string, d: string, dt: string) => {
    setLoading(true);
    setError('');
    try {
      const date2 = addDaysToInput(dt, SEARCH_HORIZON_DAYS);
      const res = await fetch(`/api/flights?orig=${o}&dest=${d}&date1=${dt}&date2=${date2}`);
      if (!res.ok) throw new Error('Failed');
      setFlights(await res.json());
    } catch {
      setError('Could not load flights. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights(origParam, destParam, dateParam);
  }, [origParam, destParam, dateParam, fetchFlights]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (orig === dest) return;
    router.push(`/flights?orig=${orig}&dest=${dest}&date=${date}`);
  }

  function handleOrigChange(value: string) {
    setOrig(value);
    const dests = destinationsFrom(value);
    if (!dests.includes(dest)) setDest(dests[0] || '');
  }

  function swap() {
    const newOrig = dest;
    const newDest = orig;
    setOrig(newOrig);
    // guard: ensure resulting route is valid
    const dests = destinationsFrom(newOrig);
    setDest(dests.includes(newDest) ? newDest : dests[0] || '');
  }

  const originAirport = AIRPORTS[origParam];
  const destAirport = AIRPORTS[destParam];
  const routeInfo = getRouteInfo(origParam, destParam);
  const destOptions = destinationsFrom(orig);

  // Group flights by local departure date for a scannable, calendar-like layout.
  const groups: { key: string; label: string; items: FlightSummary[] }[] = [];
  for (const f of flights) {
    const tz = AIRPORTS[f.origin]?.timezone ?? 'Pacific/Auckland';
    const key = formatDateInput(f.departureUTC, tz);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: formatDateFull(f.departureUTC, tz), items: [] };
      groups.push(group);
    }
    group.items.push(f);
  }

  const firstDepartureLabel =
    flights.length > 0
      ? formatDateShort(flights[0].departureUTC, AIRPORTS[flights[0].origin]?.timezone ?? 'Pacific/Auckland')
      : null;
  const searchedDateShort = formatDateShort(`${dateParam}T00:00:00Z`, 'UTC');
  const showNextAvailableHint =
    firstDepartureLabel && firstDepartureLabel !== searchedDateShort;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F7F9FC]">
        {/* Condensed search bar */}
        <div className="bg-white border-b border-gray-100 py-4 shadow-sm">
          <div className="page-container">
            <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="label">From</label>
                <select
                  value={orig}
                  onChange={(e) => handleOrigChange(e.target.value)}
                  className="input-field text-sm py-2.5 min-w-[160px]"
                >
                  {Object.values(AIRPORTS).map((a) => (
                    <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={swap}
                title="Swap"
                className="w-10 h-[42px] rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-light flex items-center justify-center transition-all"
              >
                <ArrowLeftRight className="w-4 h-4 text-gray-500" />
              </button>

              <div>
                <label className="label">To</label>
                <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="input-field text-sm py-2.5 min-w-[160px]"
                >
                  {destOptions.map((code) => (
                    <option key={code} value={code}>{AIRPORTS[code].city} ({code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Depart on or after</label>
                <input
                  type="date"
                  value={date}
                  min={todayInputValue()}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field text-sm py-2.5"
                />
              </div>
              <button type="submit" className="btn-primary py-2.5 text-sm flex items-center gap-1.5">
                <SearchIcon className="w-4 h-4" />
                Update Search
              </button>
            </form>
          </div>
        </div>

        <div className="page-container py-8">
          {/* Page title */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to search
            </Link>
            <h1 className="font-sora font-bold text-2xl text-navy flex items-center gap-2 flex-wrap">
              {originAirport?.city || origParam}
              <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
              {destAirport?.city || destParam}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                From {new Date(dateParam + 'T00:00:00').toLocaleDateString('en-NZ', {
                  weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                })} · next {SEARCH_HORIZON_DAYS} days
              </p>
              {routeInfo && (
                <span className="badge bg-primary-light text-primary">{routeInfo.frequency}</span>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-primary animate-spin" />
              </div>
              <p className="text-gray-500 text-sm">Searching available flights…</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="card p-5 flex items-center gap-3 bg-red-50 border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* No flights */}
          {!loading && !error && flights.length === 0 && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                <Plane className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-sora font-bold text-lg text-navy mb-2">No flights in this window</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-3">
                No <strong>{originAirport?.city}</strong> → <strong>{destAirport?.city}</strong> departures
                in the {SEARCH_HORIZON_DAYS} days after {searchedDateShort}.
              </p>
              {routeInfo && (
                <p className="text-xs text-gray-400 max-w-xs mx-auto mb-6">
                  This route operates: <strong>{routeInfo.frequency}</strong>. Try an earlier start date.
                </p>
              )}
              <Link href="/" className="btn-primary inline-flex">Change Search</Link>
            </div>
          )}

          {/* Flight list, grouped by date */}
          {!loading && !error && flights.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-sm text-gray-500 font-medium">
                  {flights.length} flight{flights.length !== 1 ? 's' : ''} found
                </p>
                {showNextAvailableHint && (
                  <p className="text-xs text-accent font-medium flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-full">
                    <Info className="w-3.5 h-3.5" />
                    Next available departure is {firstDepartureLabel}
                  </p>
                )}
              </div>

              {groups.map((group) => (
                <div key={group.key}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <h2 className="font-sora font-semibold text-sm text-navy">{group.label}</h2>
                    <span className="text-xs text-gray-400">
                      ({group.items.length} flight{group.items.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <Reveal stagger className="space-y-3">
                    {group.items.map((flight) => (
                      <FlightCard
                        key={flight._id}
                        flight={flight}
                        onSelect={() => router.push(`/booking/${flight._id}`)}
                      />
                    ))}
                  </Reveal>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
