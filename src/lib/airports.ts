import { Airport } from '@/types';

export const AIRPORTS: Record<string, Airport> = {
  NZNE: {
    code: 'NZNE',
    name: 'Dairy Flat Airport',
    city: 'Auckland',
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
    tzOffset: 720, // UTC+12
    tzLabel: 'NZST',
  },
  YSSY: {
    code: 'YSSY',
    name: 'Sydney Airport',
    city: 'Sydney',
    country: 'Australia',
    timezone: 'Australia/Sydney',
    tzOffset: 600, // UTC+10
    tzLabel: 'AEST',
  },
  NZRO: {
    code: 'NZRO',
    name: 'Rotorua Airport',
    city: 'Rotorua',
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
    tzOffset: 720,
    tzLabel: 'NZST',
  },
  NZGB: {
    code: 'NZGB',
    name: 'Claris Airport',
    city: 'Great Barrier Island',
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
    tzOffset: 720,
    tzLabel: 'NZST',
  },
  NZCI: {
    code: 'NZCI',
    name: 'Tuuta Airport',
    city: 'Chatham Islands',
    country: 'New Zealand',
    timezone: 'Pacific/Chatham',
    tzOffset: 765, // UTC+12:45
    tzLabel: 'NZCT',
  },
  NZTL: {
    code: 'NZTL',
    name: 'Lake Tekapo Airport',
    city: 'Lake Tekapo',
    country: 'New Zealand',
    timezone: 'Pacific/Auckland',
    tzOffset: 720,
    tzLabel: 'NZST',
  },
};

// Valid direct routes
export const VALID_ROUTES: [string, string][] = [
  ['NZNE', 'YSSY'],
  ['YSSY', 'NZNE'],
  ['NZNE', 'NZRO'],
  ['NZRO', 'NZNE'],
  ['NZNE', 'NZGB'],
  ['NZGB', 'NZNE'],
  ['NZNE', 'NZCI'],
  ['NZCI', 'NZNE'],
  ['NZNE', 'NZTL'],
  ['NZTL', 'NZNE'],
];

export function isValidRoute(orig: string, dest: string): boolean {
  return VALID_ROUTES.some(([o, d]) => o === orig && d === dest);
}

/**
 * Per-route operating pattern, expressed in the ORIGIN airport's local weekday
 * (0 = Sun … 6 = Sat). Used to guide the user when searching infrequent routes.
 */
export interface RouteInfo {
  days: number[];        // local weekdays the route departs
  frequency: string;     // short human label, e.g. "Twice daily · Mon–Fri"
  durationLabel: string; // approximate block time
}

export const ROUTE_INFO: Record<string, RouteInfo> = {
  'NZNE-YSSY': { days: [5],            frequency: 'Weekly · Fridays',        durationLabel: '~3h 15m' },
  'YSSY-NZNE': { days: [0],            frequency: 'Weekly · Sundays',        durationLabel: '~3h' },
  'NZNE-NZRO': { days: [1, 2, 3, 4, 5], frequency: 'Twice daily · Mon–Fri',  durationLabel: '~50m' },
  'NZRO-NZNE': { days: [1, 2, 3, 4, 5], frequency: 'Twice daily · Mon–Fri',  durationLabel: '~50m' },
  'NZNE-NZGB': { days: [1, 3, 5],      frequency: 'Mon · Wed · Fri',         durationLabel: '~40m' },
  'NZGB-NZNE': { days: [2, 4, 6],      frequency: 'Tue · Thu · Sat',         durationLabel: '~40m' },
  'NZNE-NZCI': { days: [2, 5],         frequency: 'Tue & Fri',               durationLabel: '~2h' },
  'NZCI-NZNE': { days: [3, 6],         frequency: 'Wed & Sat',               durationLabel: '~2h' },
  'NZNE-NZTL': { days: [1],            frequency: 'Weekly · Mondays',        durationLabel: '~1h 30m' },
  'NZTL-NZNE': { days: [2],            frequency: 'Weekly · Tuesdays',       durationLabel: '~1h 30m' },
};

export function getRouteInfo(orig: string, dest: string): RouteInfo | undefined {
  return ROUTE_INFO[`${orig}-${dest}`];
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Destinations reachable from a given origin. */
export function destinationsFrom(orig: string): string[] {
  return VALID_ROUTES.filter(([o]) => o === orig).map(([, d]) => d);
}

/** True if the route operates on the given local weekday (0 = Sun). */
export function routeOperatesOn(orig: string, dest: string, weekday: number): boolean {
  return ROUTE_INFO[`${orig}-${dest}`]?.days.includes(weekday) ?? false;
}

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_LABELS[weekday] ?? '';
}

// Destination info for the landing page
const UNSPLASH = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export interface DestinationInfo {
  tagline: string;
  gradient: string;
  fromPrice: number;
  icon: string;
  image: string;
}

export const DESTINATION_INFO: Record<string, DestinationInfo> = {
  YSSY: {
    tagline: 'Australia',
    gradient: 'from-amber-400 to-orange-500',
    fromPrice: 1200,
    icon: '',
    image: 'https://www.sydneytravelguide.com.au/wp-content/uploads/2024/09/Sydney-harbour.jpg',
  },
  NZRO: {
    tagline: 'Geothermal Wonders',
    gradient: 'from-emerald-400 to-teal-600',
    fromPrice: 120,
    icon: '',
    image: 'https://cdn.audleytravel.com/2188/1559/79/1022064-champagne-pool-rotorua.jpg',
  },
  NZGB: {
    tagline: 'Island Paradise',
    gradient: 'from-cyan-400 to-blue-600',
    fromPrice: 180,
    icon: '',
    image: 'https://i0.wp.com/blog.doc.govt.nz/wp-content/uploads/2013/08/great-barrier-island-beach-andris-apse.jpg',
  },
  NZCI: {
    tagline: 'Remote & Rugged',
    gradient: 'from-violet-400 to-purple-700',
    fromPrice: 380,
    icon: '',
    image: 'https://tse1.mm.bing.net/th/id/OIP.sEK-JZHTHsxqCgLxN0S6UwHaFj?cb=thfvnextfalcon2&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  NZTL: {
    tagline: 'Alpine Escape',
    gradient: 'from-sky-400 to-indigo-600',
    fromPrice: 280,
    icon: '',
    image: 'https://wallpaperaccess.com/full/10826901.jpg',
  },
};

// Hero background (plane wing over clouds)
export const HERO_IMAGE = UNSPLASH('1436491865332-7a61a109cc05', 1600);
