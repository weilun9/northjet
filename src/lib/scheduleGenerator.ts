import { zonedWallToUTC } from './tz';

/**
 * Converts a local wall-clock date/time in an IANA timezone to UTC (DST-aware).
 * @param year, month (0-based), day – local calendar date
 * @param hour, minute – local time
 * @param timeZone – IANA zone, e.g. 'Pacific/Auckland'
 */
function localToUTC(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  return zonedWallToUTC(year, month, day, hour, minute, timeZone);
}

/** Returns the Monday (UTC 00:00) of the week containing `date` */
function getMondayOfWeek(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function generateSchedules(startDate: Date = new Date(), weeks = 8) {
  const NZ = 'Pacific/Auckland';   // UTC+12 / +13 (NZST / NZDT, DST-aware)
  const AEST = 'Australia/Sydney'; // UTC+10 / +11 (AEST / AEDT)
  const NZCT = 'Pacific/Chatham';  // UTC+12:45 / +13:45 (Chatham Islands)

  const schedules: object[] = [];
  const monday = getMondayOfWeek(startDate);

  for (let week = 0; week < weeks; week++) {
    const weekStart = new Date(monday);
    weekStart.setUTCDate(weekStart.getUTCDate() + week * 7);

    /** Returns { year, month (0-based), day } for Mon+offset */
    const dayOf = (offset: number) => {
      const d = new Date(weekStart);
      d.setUTCDate(d.getUTCDate() + offset);
      return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
    };

    // ── Sydney Prestige (SyberJet SJ30i, 6 seats) ─────────────────────
    // Out: Friday 10:00 NZST → arrive Sydney 11:15 AEST (3h 15m westbound)
    const fri = dayOf(4);
    schedules.push({
      flightNumber: 'NJ101',
      aircraft: 'SyberJet SJ30i',
      totalSeats: 6,
      origin: 'NZNE',
      destination: 'YSSY',
      departureUTC: localToUTC(fri.year, fri.month, fri.day, 10, 0, NZ),
      arrivalUTC: localToUTC(fri.year, fri.month, fri.day, 11, 15, AEST),
      price: 1200,
      bookings: [],
    });

    // Return: Sunday 14:00 AEST → arrive Dairy Flat 19:00 NZST (3h 00m eastbound)
    const sun = dayOf(6);
    schedules.push({
      flightNumber: 'NJ102',
      aircraft: 'SyberJet SJ30i',
      totalSeats: 6,
      origin: 'YSSY',
      destination: 'NZNE',
      departureUTC: localToUTC(sun.year, sun.month, sun.day, 14, 0, AEST),
      arrivalUTC: localToUTC(sun.year, sun.month, sun.day, 19, 0, NZ),
      price: 1200,
      bookings: [],
    });

    // ── Rotorua Shuttle (Cirrus SF50, 4 seats) – Mon–Fri ─────────────
    for (let d = 0; d < 5; d++) {
      const day = dayOf(d);

      // AM pair
      schedules.push({
        flightNumber: 'NJ201',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZNE',
        destination: 'NZRO',
        departureUTC: localToUTC(day.year, day.month, day.day, 7, 0, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 7, 50, NZ),
        price: 120,
        bookings: [],
      });
      schedules.push({
        flightNumber: 'NJ202',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZRO',
        destination: 'NZNE',
        departureUTC: localToUTC(day.year, day.month, day.day, 8, 30, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 9, 20, NZ),
        price: 120,
        bookings: [],
      });

      // PM pair
      schedules.push({
        flightNumber: 'NJ203',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZNE',
        destination: 'NZRO',
        departureUTC: localToUTC(day.year, day.month, day.day, 16, 30, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 17, 20, NZ),
        price: 120,
        bookings: [],
      });
      schedules.push({
        flightNumber: 'NJ204',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZRO',
        destination: 'NZNE',
        departureUTC: localToUTC(day.year, day.month, day.day, 18, 0, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 18, 50, NZ),
        price: 120,
        bookings: [],
      });
    }

    // ── Great Barrier Island (Cirrus SF50, 4 seats) ───────────────────
    // Out: Mon / Wed / Fri  09:00 NZST → 09:40 NZST (40 min)
    for (const d of [0, 2, 4]) {
      const day = dayOf(d);
      schedules.push({
        flightNumber: 'NJ301',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZNE',
        destination: 'NZGB',
        departureUTC: localToUTC(day.year, day.month, day.day, 9, 0, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 9, 40, NZ),
        price: 180,
        bookings: [],
      });
    }
    // Return: Tue / Thu / Sat  10:00 NZST → 10:40 NZST
    for (const d of [1, 3, 5]) {
      const day = dayOf(d);
      schedules.push({
        flightNumber: 'NJ302',
        aircraft: 'Cirrus SF50',
        totalSeats: 4,
        origin: 'NZGB',
        destination: 'NZNE',
        departureUTC: localToUTC(day.year, day.month, day.day, 10, 0, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 10, 40, NZ),
        price: 180,
        bookings: [],
      });
    }

    // ── Chatham Islands (HondaJet Elite, 5 seats) ─────────────────────
    // Out: Tue / Fri  08:00 NZST → 10:45 NZCT (2h, timezone +0:45)
    for (const d of [1, 4]) {
      const day = dayOf(d);
      schedules.push({
        flightNumber: 'NJ401',
        aircraft: 'HondaJet Elite',
        totalSeats: 5,
        origin: 'NZNE',
        destination: 'NZCI',
        departureUTC: localToUTC(day.year, day.month, day.day, 8, 0, NZ),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 10, 45, NZCT),
        price: 380,
        bookings: [],
      });
    }
    // Return: Wed / Sat  09:00 NZCT → 10:15 NZST
    for (const d of [2, 5]) {
      const day = dayOf(d);
      schedules.push({
        flightNumber: 'NJ402',
        aircraft: 'HondaJet Elite',
        totalSeats: 5,
        origin: 'NZCI',
        destination: 'NZNE',
        departureUTC: localToUTC(day.year, day.month, day.day, 9, 0, NZCT),
        arrivalUTC: localToUTC(day.year, day.month, day.day, 10, 15, NZ),
        price: 380,
        bookings: [],
      });
    }

    // ── Lake Tekapo (HondaJet Elite, 5 seats) ─────────────────────────
    // Out: Monday 09:00 NZST → 10:30 NZST (1h 30m)
    const mon = dayOf(0);
    schedules.push({
      flightNumber: 'NJ501',
      aircraft: 'HondaJet Elite',
      totalSeats: 5,
      origin: 'NZNE',
      destination: 'NZTL',
      departureUTC: localToUTC(mon.year, mon.month, mon.day, 9, 0, NZ),
      arrivalUTC: localToUTC(mon.year, mon.month, mon.day, 10, 30, NZ),
      price: 280,
      bookings: [],
    });
    // Return: Tuesday 10:00 NZST → 11:30 NZST
    const tue = dayOf(1);
    schedules.push({
      flightNumber: 'NJ502',
      aircraft: 'HondaJet Elite',
      totalSeats: 5,
      origin: 'NZTL',
      destination: 'NZNE',
      departureUTC: localToUTC(tue.year, tue.month, tue.day, 10, 0, NZ),
      arrivalUTC: localToUTC(tue.year, tue.month, tue.day, 11, 30, NZ),
      price: 280,
      bookings: [],
    });
  }

  return schedules;
}
