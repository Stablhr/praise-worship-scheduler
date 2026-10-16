/**
 * Every date in the app is stored in UTC and shown in Asia/Manila (UTC+08:00).
 * CONTEXT.md section 10.
 */

export const MANILA_TIME_ZONE = 'Asia/Manila';

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
