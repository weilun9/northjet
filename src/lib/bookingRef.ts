// Excludes visually ambiguous characters (0/O, 1/I) so refs are easy to read aloud.
const BOOKING_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generate a single "NJxxxxxxx" booking reference (no DB check). */
export function makeBookingRef(): string {
  let ref = 'NJ';
  for (let i = 0; i < 7; i++) {
    ref += BOOKING_CHARS[Math.floor(Math.random() * BOOKING_CHARS.length)];
  }
  return ref;
}

/** Generate a ref guaranteed unique against an in-memory set (used during bulk seeding). */
export function makeUniqueBookingRef(used: Set<string>): string {
  let ref: string;
  do {
    ref = makeBookingRef();
  } while (used.has(ref));
  used.add(ref);
  return ref;
}
