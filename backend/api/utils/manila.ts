/**
 * Every date is stored in UTC and shown in Asia/Manila (CONTEXT.md section 10).
 *
 * Manila is UTC+08:00 and has never used daylight saving, so the offset is a
 * constant. Keeping the conversion in one place means the rest of the server
 * works with plain "YYYY-MM-DD" day keys and never does timezone arithmetic.
 */

export const MANILA_TIME_ZONE = 'Asia/Manila';
export const MANILA_OFFSET = '+08:00';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: MANILA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

/** The Manila calendar day (YYYY-MM-DD) an instant falls on. */
export function manilaDateKey(instant: Date): string {
  return dayKeyFormatter.format(instant);
}

/**
 * The exact instant of a Manila wall-clock date and time, for storing in UTC.
 * `time` is HH:mm in Manila, and defaults to the start of the day.
 */
export function manilaInstant(dateKey: string, time = '00:00'): Date {
  return new Date(`${dateKey}T${time}:00${MANILA_OFFSET}`);
}

/**
 * True for a real Manila day such as "2026-10-24", false for rubbish or for a
 * day that does not exist ("2026-02-30").
 */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_KEY_PATTERN.test(value)) return false;

  const instant = manilaInstant(value);

  return !Number.isNaN(instant.getTime()) && manilaDateKey(instant) === value;
}

/** True for a 24-hour clock time such as "15:00". */
export function isValidTime(value: unknown): value is string {
  return typeof value === 'string' && TIME_PATTERN.test(value);
}

/** Moves a Manila day key by whole days, crossing months and years safely. */
export function addDays(dateKey: string, days: number): string {
  // Noon keeps the arithmetic far away from either midnight boundary.
  const instant = manilaInstant(dateKey, '12:00');
  instant.setUTCDate(instant.getUTCDate() + days);

  return manilaDateKey(instant);
}

/** Weekday of a Manila day: 0 is Sunday, 6 is Saturday. */
export function getWeekday(dateKey: string): number {
  return manilaInstant(dateKey, '12:00').getUTCDay();
}
