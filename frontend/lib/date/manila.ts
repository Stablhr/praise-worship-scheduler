/**
 * Every date in the app is stored in UTC and shown in Asia/Manila (UTC+08:00).
 * CONTEXT.md section 10.
 *
 * Manila is UTC+08:00 and never changes, so a day key ("2026-10-24") plus the
 * offset is enough to name an exact instant. Screens pass day keys around and
 * never do timezone arithmetic themselves.
 */

export const MANILA_TIME_ZONE = 'Asia/Manila';
export const MANILA_OFFSET = '+08:00';

const dayKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const longDayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TIME_ZONE,
  weekday: 'long',
  month: 'long',
  day: 'numeric'
});

const shortDayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TIME_ZONE,
  month: 'short',
  day: 'numeric'
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TIME_ZONE,
  month: 'long',
  year: 'numeric'
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: MANILA_TIME_ZONE,
  hour: 'numeric',
  minute: '2-digit'
});

/** Hour of the day (0-23) in Manila, whatever the phone's own time zone is. */
export function getManilaHour(date: Date = new Date()): number {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TIME_ZONE,
    hour: 'numeric',
    hour12: false
  }).format(date);

  return Number(formatted) % 24;
}

export function getGreeting(date: Date = new Date()): string {
  const hour = getManilaHour(date);

  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

/** "Juan Dela Cruz" -> "Juan" */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** Today in Manila, as a YYYY-MM-DD day key. */
export function getManilaTodayKey(date: Date = new Date()): string {
  return toDayKey(date);
}

/** The Manila calendar day an instant falls on. */
export function toDayKey(instant: Date): string {
  const parts = dayKeyFormatter.formatToParts(instant);
  const part = (type: 'year' | 'month' | 'day') =>
    parts.find(item => item.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

/**
 * The exact instant of a Manila wall-clock date and time.
 * `time` is HH:mm in Manila and defaults to the start of the day.
 */
export function getManilaInstant(dateKey: string, time = '00:00'): Date {
  return new Date(`${dateKey}T${time}:00${MANILA_OFFSET}`);
}

/** Moves a Manila day key by whole days, crossing months and years safely. */
export function addDaysToKey(dateKey: string, days: number): string {
  // Noon keeps the arithmetic far away from either midnight boundary.
  const instant = getManilaInstant(dateKey, '12:00');
  instant.setUTCDate(instant.getUTCDate() + days);

  return toDayKey(instant);
}

/** Weekday of a Manila day: 0 is Sunday, 6 is Saturday. */
export function getWeekdayFromKey(dateKey: string): number {
  return getManilaInstant(dateKey, '12:00').getUTCDay();
}

/** "Saturday, October 24" */
export function formatDayLabel(dateKey: string): string {
  return longDayFormatter.format(getManilaInstant(dateKey, '12:00'));
}

/** "Oct 24" */
export function formatShortDayLabel(dateKey: string): string {
  return shortDayFormatter.format(getManilaInstant(dateKey, '12:00'));
}

/** "October 2026", from a month key such as "2026-10". */
export function formatMonthLabel(monthKey: string): string {
  return monthFormatter.format(getManilaInstant(`${monthKey}-01`, '12:00'));
}

/** "15:00" -> "3:00 PM" */
export function formatTimeLabel(time: string): string {
  return timeFormatter.format(new Date(`1970-01-01T${time}:00${MANILA_OFFSET}`));
}
