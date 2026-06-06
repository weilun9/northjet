/**
 * Timezone helpers backed by the IANA database via Intl — DST-aware.
 * Replaces fixed UTC offsets so local times stay correct year-round
 * (e.g. NZ switches between NZST/UTC+12 and NZDT/UTC+13).
 */

/** Offset (minutes, +ve = ahead of UTC) of an IANA zone at a given UTC instant. */
function zoneOffsetMinutes(utcMs: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(utcMs))) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // some runtimes emit '24' at midnight
  const asUTC = Date.UTC(
    Number(map.year), Number(map.month) - 1, Number(map.day),
    hour, Number(map.minute), Number(map.second)
  );
  return (asUTC - utcMs) / 60000;
}

/** Convert a wall-clock time in `timeZone` to the matching UTC instant (DST-aware). */
export function zonedWallToUTC(
  year: number, monthIndex: number, day: number,
  hour: number, minute: number, timeZone: string
): Date {
  const guess = Date.UTC(year, monthIndex, day, hour, minute, 0);
  const o1 = zoneOffsetMinutes(guess, timeZone);
  let utc = guess - o1 * 60000;
  // Re-check once to settle DST boundary cases.
  const o2 = zoneOffsetMinutes(utc, timeZone);
  if (o2 !== o1) utc = guess - o2 * 60000;
  return new Date(utc);
}

export interface ZoneParts {
  year: number;
  month: number;   // 1-12
  day: number;
  hour: number;    // 0-23
  minute: number;
  weekday: number; // 0=Sun … 6=Sat
}

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/**
 * Short zone abbreviation for an instant (e.g. NZST/NZDT/AEST/AEDT).
 * Falls back to `fallback` when the runtime only offers a "GMT+12:45"-style label
 * (e.g. for the Chatham Islands).
 */
export function zoneAbbr(utc: string | Date, timeZone: string, fallback: string): string {
  const date = typeof utc === 'string' ? new Date(utc) : utc;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      timeZoneName: 'short',
    }).formatToParts(date);
    const name = parts.find((p) => p.type === 'timeZoneName')?.value;
    if (name && /^[A-Za-z]{2,5}$/.test(name)) return name;
  } catch {
    // fall through to fallback
  }
  return fallback;
}

/** Break a UTC instant into wall-clock parts in `timeZone`. */
export function getZoneParts(utc: string | Date, timeZone: string): ZoneParts {
  const date = typeof utc === 'string' ? new Date(utc) : utc;
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(date)) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    weekday: WEEKDAY_INDEX[map.weekday] ?? 0,
  };
}
