import {
  addDaysToKey,
  getManilaTodayKey,
  getWeekdayFromKey
} from '@/lib/date/manila';

/** The month a Manila day key belongs to, such as "2026-10". */
export function getMonthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

/** The month key `months` away from this one. */
export function shiftMonthKey(monthKey: string, months: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1 + months, 1));
  const nextMonth = String(shifted.getUTCMonth() + 1).padStart(2, '0');

  return `${shifted.getUTCFullYear()}-${nextMonth}`;
}

/** The first and last Manila day of a month, for the services request. */
export function getMonthRange(monthKey: string): {from: string; to: string} {
  const nextMonth = shiftMonthKey(monthKey, 1);

  return {
    from: `${monthKey}-01`,
    to: addDaysToKey(`${nextMonth}-01`, -1)
  };
}

/**
 * The days of a month in calendar order, starting on Sunday, padded with nulls
 * so the first day lands under the right weekday.
 */
export function getMonthGrid(monthKey: string): (string | null)[] {
  const {from, to} = getMonthRange(monthKey);
  const days: (string | null)[] = Array(getWeekdayFromKey(from)).fill(null);

  let day = from;

  while (day <= to) {
    days.push(day);
    day = addDaysToKey(day, 1);
  }

  return days;
}

/** Sunday first, like the calendar that ships with the phone. */
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

export function isToday(dateKey: string): boolean {
  return dateKey === getManilaTodayKey();
}
