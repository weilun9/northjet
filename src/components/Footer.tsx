import Link from 'next/link';
import { Plane } from 'lucide-react';

export default function Footer() {
  const routes = [
    { label: 'Auckland → Sydney', path: '/flights?orig=NZNE&dest=YSSY' },
    { label: 'Auckland → Rotorua', path: '/flights?orig=NZNE&dest=NZRO' },
    { label: 'Auckland → Great Barrier', path: '/flights?orig=NZNE&dest=NZGB' },
    { label: 'Auckland → Chatham Islands', path: '/flights?orig=NZNE&dest=NZCI' },
    { label: 'Auckland → Lake Tekapo', path: '/flights?orig=NZNE&dest=NZTL' },
  ];

  return (
    <footer className="bg-navy text-white mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Plane className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-sora font-bold text-xl tracking-tight">
                North<span className="text-primary">Jet</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Premium private jet travel from Dairy Flat Airport, Auckland. Exclusive routes across
              New Zealand and beyond.
            </p>
          </div>

          {/* Popular Routes */}
          <div>
            <h3 className="font-sora font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Popular Routes
            </h3>
            <ul className="space-y-2">
              {routes.map((r) => (
                <li key={r.path}>
                  <Link
                    href={r.path}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-sora font-semibold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Help
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/my-bookings" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Manage Bookings
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Search Flights
                </Link>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-navy-light rounded-xl">
              <p className="text-xs text-gray-400 font-medium mb-1">Operating from</p>
              <p className="text-sm font-semibold">Dairy Flat Airport (NZNE)</p>
              <p className="text-xs text-gray-400 mt-0.5">Albany, Auckland, New Zealand</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-navy-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} NorthJet Airways. A 159.352 Assignment 2 project.
          </p>
          <p className="text-xs text-gray-600">
            All times shown in local airport time.
          </p>
        </div>
      </div>
    </footer>
  );
}
