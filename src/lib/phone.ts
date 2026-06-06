/** Strip a phone number down to its digits for tolerant comparison. */
export function phoneDigits(input: string): string {
  return (input || '').replace(/\D/g, '');
}

/**
 * True when a stored phone matches the searched digits, ignoring formatting and
 * tolerating a missing/extra country code (suffix match). Requires ≥5 digits.
 */
export function phoneMatches(stored: string, queryDigits: string): boolean {
  if (queryDigits.length < 5) return false;
  const d = phoneDigits(stored);
  if (d === queryDigits) return true;
  if (queryDigits.length >= 7 && d.endsWith(queryDigits)) return true;
  if (d.length >= 7 && queryDigits.endsWith(d)) return true;
  // Tolerate different country-code / trunk prefixes (e.g. 021… vs +64 21…)
  // by comparing the last 8 significant digits.
  if (d.length >= 8 && queryDigits.length >= 8 && d.slice(-8) === queryDigits.slice(-8)) return true;
  return false;
}

/** Significant digits used for the DB pre-filter regex (last 8 when long enough). */
export function significantDigits(queryDigits: string): string {
  return queryDigits.length >= 8 ? queryDigits.slice(-8) : queryDigits;
}
