/**
 * Admin-side checks for the add/edit service sheet.
 *
 * These mirror the backend Zod rules in `backend/api/dtos/service.dto.ts` so an
 * admin sees what is wrong before the request is sent.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export function validateServiceDate(date: string): string | null {
  const value = date.trim();

  if (!value) return 'Please choose a date.';
  if (!DATE_PATTERN.test(value)) return 'Please choose a valid date.';

  return null;
}

export function validateServiceTime(time: string): string | null {
  const value = time.trim();

  if (!value) return 'Please choose a time.';
  if (!TIME_PATTERN.test(value)) return 'Please choose a valid time.';

  return null;
}

export function validateServiceNotes(notes: string): string | null {
  return notes.trim().length > 200 ? 'Those notes are too long.' : null;
}
