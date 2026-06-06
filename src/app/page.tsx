'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plane, ArrowRight, ArrowLeftRight, Shield, Tag, Clock, Search, CalendarClock, ChevronDown, Users, Minus, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AIRPORTS, DESTINATION_INFO, destinationsFrom, getRouteInfo, HERO_IMAGE } from '@/lib/airports';
import { todayInputValue } from '@/lib/timeUtils';
import Reveal from '@/components/Reveal';

export default function HomePage() {
  const router = useRouter();

  const [orig, setOrig] = useState('NZNE');
  const [dest, setDest] = useState('YSSY');
  const [date, setDate] = useState(todayInputValue());
  const [passengers, setPassengers] = useState(1);
  const MAX_PASSENGERS = 6;

  function swap() {
    setOrig(dest);
    setDest(orig);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!orig || !dest || !date || orig === dest) return;
    router.push(`/flights?orig=${orig}&dest=${dest}&date=${date}&passengers=${passengers}`);
  }

  // Origin → reachable destinations (route-aware dropdown)
  const destOptions = destinationsFrom(orig);
  const selectedRoute = getRouteInfo(orig, dest);

  const destinations = Object.entries(DESTINATION_INFO);

  // Fleet carousel state
  const fleet = [
    {
      name: 'SyberJet SJ30i',
      route: 'Sydney Service',
      seats: 6,
      desc: 'Ultra-long-range prestige jet — the crown jewel of the NorthJet fleet.',
      images: [
        'https://starrluxuryjets.com/wp-content/uploads/2020/09/SLJ-Syberjet-SJ30-exterior-800x600-1.jpg',
        'https://starrluxuryjets.com/wp-content/uploads/2020/09/SLJ-Syberjet-SJ30-interior-club-800x600-1.jpg',
        'https://starrluxuryjets.com/wp-content/uploads/2020/09/SLJ-Syberjet-SJ30-interior-side-800x600-1.jpg',
      ],
    },
    {
      name: 'Cirrus SF50',
      route: 'Rotorua & Great Barrier',
      seats: 4,
      desc: 'Vision Jet — a cutting-edge single-engine jet with panoramic views.',
      images: [
        'https://www.lonemountainaircraft.com/wp-content/uploads/2022/12/N15RG-017.jpg',
        'https://resources.globalair.com/aircraftforsale/images/ads/139283_19_VisionSF50_sn0162-Int1.jpg?mode=pad&bgcolor=white',
      ],
    },
    {
      name: 'HondaJet Elite',
      route: 'Chatham Islands & Tekapo',
      seats: 5,
      desc: 'Award-winning advanced light jet with exceptional fuel efficiency.',
      images: [
        'https://tse2.mm.bing.net/th/id/OIP.SuEY8eU7V7CTl3k1w6tlbQHaEK?pid=Api&P=0&h=180',
        'https://static.wixstatic.com/media/35b04a_b7540a45d6454e11b18a88511bb9c8f9~mv2.jpg/v1/fill/w_820,h_737,q_90/35b04a_b7540a45d6454e11b18a88511bb9c8f9~mv2.jpg',
        'https://s.yimg.com/ny/api/res/1.2/_LqXIGOJmcLfISMnT0vQCg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTQ4MA--/https://media.zenfs.com/en/business_insider_articles_888/6d5d86c4b0566b41c1cb3506369ccd2d',
      ],
    },
  ];
  const [fleetSlides, setFleetSlides] = useState([0, 0, 0]);
  const fleetTimers = useRef<ReturnType<typeof setInterval>[]>([]);
  useEffect(() => {
    fleetTimers.current = fleet.map((plane, i) =>
      setInterval(() => {
        setFleetSlides((prev) => {
          const next = [...prev];
          next[i] = (next[i] + 1) % plane.images.length;
          return next;
        });
      }, 3500 + i * 800)
    );
    return () => fleetTimers.current.forEach(clearInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deals = [
    { label: 'Auckland to Sydney', sub: 'Weekly prestige service', from: 'NZ$1,200', code: 'NZNE', dest2: 'YSSY' },
    { label: 'Auckland to Great Barrier', sub: '3× weekly island hop', from: 'NZ$180', code: 'NZNE', dest2: 'NZGB' },
    { label: 'Auckland to Chatham Islands', sub: 'Remote island escape', from: 'NZ$380', code: 'NZNE', dest2: 'NZCI' },
  ];

  const features = [
    { icon: <Shield className="w-5 h-5 text-primary" />, title: 'Price Guarantee', desc: 'No hidden fees or surcharges' },
    { icon: <Plane className="w-5 h-5 text-primary" />, title: 'Private Jets', desc: 'Exclusive fleet of light jets' },
    { icon: <Clock className="w-5 h-5 text-primary" />, title: '24/7 Booking', desc: 'Book anytime, anywhere' },
  ];

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ───────────────────────────────────────────────────── */}
        <section className="relative min-h-[620px] lg:min-h-[680px] aurora-bg overflow-hidden flex items-center">
          {/* Hero background photo with slow Ken Burns zoom, blended over aurora */}
          <div
            className="absolute inset-0 bg-cover bg-center animate-kenburns opacity-30"
            style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          />
          {/* Soft brand glow accents */}
          <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-3xl pointer-events-none animate-float" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '2.5s' }} />
          <div className="absolute top-1/2 right-0 w-72 h-72 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '4s' }} />

          {/* Decorative plane silhouette */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end pr-8 pointer-events-none select-none opacity-5 lg:opacity-10">
            <svg viewBox="0 0 400 300" className="w-full max-w-md" fill="white">
              <path d="M380 150 L100 80 L60 150 L100 220 L380 150Z M60 150 L0 120 L10 150 L0 180 Z M140 80 L160 50 L170 80Z M140 220 L160 250 L170 220Z" />
            </svg>
          </div>

          <div className="page-container relative z-10 py-12 w-full">
            {/* Single unified dark glass card — text + search form together */}
            <div
              className="max-w-4xl mx-auto rounded-3xl overflow-hidden animate-fade-up"
              style={{ background: 'rgba(3,7,18,0.75)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* ── Text area ── */}
              <div className="text-center px-8 pt-10 pb-7">
                <p className="text-blue-300/90 text-sm font-semibold uppercase tracking-widest mb-4">
                  New Zealand&rsquo;s Premium Private Jet
                </p>
                <h1 className="font-sora font-bold text-5xl md:text-6xl text-white leading-[1.05] tracking-tight mb-4" style={{ animationDelay: '0.08s' }}>
                  Your Journey<br />
                  <span className="text-gradient-brand">Starts Here</span>
                </h1>
                <p className="text-gray-300 text-base leading-relaxed max-w-xl mx-auto">
                  Fly exclusively from Dairy Flat Airport to premier destinations across New Zealand and Sydney.
                </p>
              </div>

              {/* ── Divider ── */}
              <div className="mx-8 h-px bg-white/10" />

              {/* ── Search form ── */}
              <form onSubmit={handleSearch} className="px-6 py-6">
                <div className="flex flex-col lg:flex-row gap-2 items-stretch lg:items-end">
                  {/* From */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">From</label>
                    <select
                      value={orig}
                      onChange={(e) => {
                        setOrig(e.target.value);
                        const validDests = destinationsFrom(e.target.value);
                        if (!validDests.includes(dest)) setDest(validDests[0] || '');
                      }}
                      className="input-field font-medium text-navy text-sm"
                    >
                      {Object.values(AIRPORTS).map((a) => (
                        <option key={a.code} value={a.code}>
                          {a.city} ({a.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap */}
                  <button
                    type="button"
                    onClick={swap}
                    className="hidden lg:flex self-end w-9 h-[42px] rounded-lg border border-white/20 hover:border-primary bg-white/10 hover:bg-primary/20 items-center justify-center transition-all flex-shrink-0"
                    title="Swap airports"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-white" />
                  </button>

                  {/* To */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">To</label>
                    <select
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                      className="input-field font-medium text-navy text-sm"
                    >
                      {destOptions.length > 0
                        ? destOptions.map((code) => (
                            <option key={code} value={code}>
                              {AIRPORTS[code].city} ({code})
                            </option>
                          ))
                        : <option value="">No routes</option>
                      }
                    </select>
                  </div>

                  {/* Date */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Depart</label>
                    <input
                      type="date"
                      value={date}
                      min={todayInputValue()}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-field font-medium text-navy text-sm"
                      required
                    />
                  </div>

                  {/* Passengers */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Passengers</label>
                    <div className="flex items-center gap-1.5 h-[42px] px-3 rounded-lg border border-gray-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        disabled={passengers <= 1}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-light transition-colors disabled:opacity-30"
                        aria-label="Remove passenger"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-navy select-none">{passengers}</span>
                      <button
                        type="button"
                        onClick={() => setPassengers((p) => Math.min(MAX_PASSENGERS, p + 1))}
                        disabled={passengers >= MAX_PASSENGERS}
                        className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary-light transition-colors disabled:opacity-30"
                        aria-label="Add passenger"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Search button */}
                  <button
                    type="submit"
                    className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap px-6 h-[42px] self-end flex-shrink-0"
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden sm:inline">Search Flights</span>
                    <span className="sm:hidden">Search</span>
                  </button>
                </div>

                {/* Route frequency hint */}
                {selectedRoute && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-blue-300 bg-white/10 rounded-lg px-3 py-2">
                    <CalendarClock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="font-medium">
                      {AIRPORTS[orig]?.city} → {AIRPORTS[dest]?.city}: {selectedRoute.frequency}
                    </span>
                    <span className="text-blue-300/60">· {selectedRoute.durationLabel}</span>
                  </div>
                )}

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-4 md:gap-5 mt-3 pt-3 border-t border-white/10">
                  {features.map((f) => (
                    <div key={f.title} className="flex items-center gap-1.5 text-xs text-gray-400">
                      {f.icon}
                      <span className="font-medium">{f.title}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium">Up to {MAX_PASSENGERS} passengers</span>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Smooth fade into the next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#F7F9FC] pointer-events-none" />

          {/* Scroll cue */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-1 text-white/40">
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </div>
        </section>

        {/* ── Popular Destinations ────────────────────────────────────── */}
        <section className="py-14 bg-[#F7F9FC]">
          <div className="page-container">
            <Reveal className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">Popular Destinations</h2>
                <p className="text-gray-500 text-sm mt-1">Explore top destinations from Dairy Flat Airport</p>
              </div>
              <Link
                href="/flights?orig=NZNE&dest=YSSY"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>

            <Reveal stagger className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {destinations.map(([code, info]) => {
                const airport = AIRPORTS[code];
                return (
                  <Link
                    key={code}
                    href={`/flights?orig=NZNE&dest=${code}&date=${todayInputValue()}`}
                    className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 aspect-[3/4]"
                  >
                    {/* Gradient fallback shown while the photo loads */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient}`} />
                    {/* Destination photo */}
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{ backgroundImage: `url(${info.image})` }}
                    />
                    {/* Dark gradient overlay for legible white text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <p className="font-sora font-bold text-lg leading-tight drop-shadow-md">{airport.city}</p>
                      <p className="text-white/80 text-xs mt-0.5 drop-shadow">{info.tagline}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-white font-semibold text-sm drop-shadow-md">
                          From NZ${info.fromPrice}
                        </p>
                        <span className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowRight className="w-3.5 h-3.5 text-white" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </Reveal>
          </div>
        </section>

        {/* ── Exclusive Deals ─────────────────────────────────────────── */}
        <section className="py-14 bg-navy">
          <div className="page-container">
            <Reveal className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-sora font-bold text-2xl text-white">Exclusive Deals</h2>
                <p className="text-gray-400 text-sm mt-1">Save more on your next adventure</p>
              </div>
              <Tag className="w-5 h-5 text-primary" />
            </Reveal>

            <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deals.map((deal) => (
                <Link
                  key={deal.label}
                  href={`/flights?orig=${deal.code}&dest=${deal.dest2}&date=${todayInputValue()}`}
                  className="group flex items-center gap-4 bg-navy-light hover:bg-[#243c6e] rounded-2xl p-5 transition-all duration-200 border border-white/5 hover:border-primary/30"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Plane className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <p className="text-white font-semibold text-sm truncate">{deal.label}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{deal.sub}</p>
                    <p className="text-primary font-bold text-sm mt-1">From {deal.from}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ── Fleet Highlight ─────────────────────────────────────────── */}
        <section className="py-14">
          <div className="page-container">
            <Reveal className="text-center mb-10">
              <h2 className="section-title">Our Fleet</h2>
              <p className="text-gray-500 text-sm mt-2">Premium aircraft for every journey</p>
            </Reveal>
            <Reveal stagger className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fleet.map((plane, i) => (
                <div
                  key={plane.name}
                  className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Aircraft photo carousel */}
                  <div className="relative h-48 overflow-hidden">
                    {plane.images.map((src, imgIdx) => (
                      <div
                        key={src}
                        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
                        style={{
                          backgroundImage: `url(${src})`,
                          opacity: fleetSlides[i] === imgIdx ? 1 : 0,
                        }}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
                    {/* Slide dots */}
                    {plane.images.length > 1 && (
                      <div className="absolute bottom-10 right-3 flex gap-1">
                        {plane.images.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setFleetSlides((prev) => { const n = [...prev]; n[i] = dotIdx; return n; })}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${fleetSlides[i] === dotIdx ? 'bg-white' : 'bg-white/40'}`}
                          />
                        ))}
                      </div>
                    )}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                      <div>
                        <h3 className="font-sora font-bold text-white text-lg leading-tight drop-shadow-md">{plane.name}</h3>
                        <p className="text-white/85 text-xs drop-shadow">{plane.route}</p>
                      </div>
                      <span className="badge bg-white/90 text-navy whitespace-nowrap">{plane.seats} seats</span>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="p-5">
                    <p className="text-gray-500 text-sm leading-relaxed">{plane.desc}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
