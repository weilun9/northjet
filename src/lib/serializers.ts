import type { ISchedule, IBooking } from '@/models/Schedule';
import type { FlightSummary, BookingWithFlight } from '@/types';

/** Seats taken by confirmed bookings (each booking occupies passengers.length seats). */
export function confirmedSeats(schedule: Pick<ISchedule, 'bookings'>): number {
  return schedule.bookings
    .filter((b) => b.status === 'confirmed')
    .reduce((sum, b) => sum + b.passengers.length, 0);
}

export function availableSeats(schedule: Pick<ISchedule, 'bookings' | 'totalSeats'>): number {
  return schedule.totalSeats - confirmedSeats(schedule);
}

/** Convert a Schedule document into the wire shape consumed by the frontend. */
export function serializeFlight(s: ISchedule): FlightSummary {
  const booked = confirmedSeats(s);
  return {
    _id: String(s._id),
    flightNumber: s.flightNumber,
    aircraft: s.aircraft,
    totalSeats: s.totalSeats,
    origin: s.origin,
    destination: s.destination,
    departureUTC: s.departureUTC.toISOString(),
    arrivalUTC: s.arrivalUTC.toISOString(),
    price: s.price,
    availableSeats: s.totalSeats - booked,
    bookingCount: booked,
  };
}

/** Convert an embedded booking + its parent schedule into a flat booking record. */
export function serializeBooking(s: ISchedule, b: IBooking): BookingWithFlight {
  return {
    bookingRef: b.bookingRef,
    passengers: b.passengers.map((p) => p.name),
    seats: b.passengers.length,
    email: b.email,
    phone: b.phone,
    bookedAt: b.bookedAt.toISOString(),
    status: b.status,
    flightId: String(s._id),
    flightNumber: s.flightNumber,
    aircraft: s.aircraft,
    origin: s.origin,
    destination: s.destination,
    departureUTC: s.departureUTC.toISOString(),
    arrivalUTC: s.arrivalUTC.toISOString(),
    price: s.price,
  };
}
