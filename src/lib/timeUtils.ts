import { getZoneParts } from './tz';
export { zoneAbbr } from './tz';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => n.toString().padStart(2, '0');

/** HH:MM in the given IANA timezone (e.g. 'Pacific/Auckland'). */
export function formatTime(utc: string | Date, timeZone: string): string {
  const p = getZoneParts(utc, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** e.g. "Fri 5 Jun" in the given timezone. */
export function formatDateShort(utc: string | Date, timeZone: string): string {
  const p = getZoneParts(utc, timeZone);
  return `${DAYS_SHORT[p.weekday]} ${p.day} ${MONTHS_SHORT[p.month - 1]}`;
}

/** e.g. "Friday, 5 June 2026" in the given timezone. */
export function formatDateFull(utc: string | Date, timeZone: string): string {
  const p = getZoneParts(utc, timeZone);
  return `${DAYS_FULL[p.weekday]}, ${p.day} ${MONTHS_FULL[p.month - 1]} ${p.year}`;
}

/** "YYYY-MM-DD" in the given timezone. */
export function formatDateInput(utc: string | Date, timeZone: string): string {
  const p = getZoneParts(utc, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

export function flightDuration(departureUTC: string | Date, arrivalUTC: string | Date): string {
  const dep = typeof departureUTC === 'string' ? new Date(departureUTC) : departureUTC;
  const arr = typeof arrivalUTC === 'string' ? new Date(arrivalUTC) : arrivalUTC;
  const totalMinutes = Math.round((arr.getTime() - dep.getTime()) / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function isFutureFlight(departureUTC: string): boolean {
  return new Date(departureUTC) > new Date();
}

export function todayInputValue(): string {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}
