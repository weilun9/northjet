export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  tzOffset: number; // minutes ahead of UTC (e.g. NZ = 720 for UTC+12)
  tzLabel: string;  // display label e.g. "NZST"
}

export interface BookingRecord {
  bookingRef: string;
  passengers: string[]; // passenger names
  seats: number;        // = passengers.length
  email: string;
  phone: string;
  bookedAt: string;
  status: 'confirmed' | 'cancelled';
}

export interface FlightSummary {
  _id: string;
  flightNumber: string;
  aircraft: string;
  totalSeats: number;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
  availableSeats: number;
  bookingCount?: number;
}

export interface BookingWithFlight extends BookingRecord {
  flightId: string;
  flightNumber: string;
  aircraft: string;
  origin: string;
  destination: string;
  departureUTC: string;
  arrivalUTC: string;
  price: number;
}
