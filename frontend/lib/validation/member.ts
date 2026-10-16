/**
 * Admin-side checks for the add/edit member sheet.
 *
 * These mirror the backend Zod rules in `backend/api/dtos/member.dto.ts` so an
 * admin sees what is wrong before the request is sent. The backend validates
 * everything again; this is only for faster, friendlier feedback.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateMemberName(name: string): string | null {
  const value = name.trim();

  if (!value) return 'Please enter a name.';
  if (value.length > 80) return 'That name is too long.';

  return null;
}

export function validateMemberEmail(email: string): string | null {
  const value = email.trim();

  if (!value) return 'Please enter an email address.';
  return EMAIL_PATTERN.test(value) ? null : 'Please enter a valid email address.';
}
