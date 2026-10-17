/**
 * Client-side checks for the sign-in form.
 *
 * These mirror the backend Zod rules in `backend/api/dtos/auth.dto.ts` so a
 * member sees what is wrong before the request is sent. The backend still
 * validates everything again; this is only for faster, friendlier feedback.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | null {
  return name.trim().length > 0 ? null : 'Please enter your name.';
}

export function validateEmail(email: string): string | null {
  const value = email.trim();

  if (!value) return 'Please enter your email address.';
  return EMAIL_PATTERN.test(value) ? null : 'Please enter a valid email address.';
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one digit.';
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.';
  }

  return null;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): string | null {
  if (!confirmation) return 'Please repeat your password.';
  return password === confirmation ? null : 'The passwords do not match.';
}

export function validatePosition(position: string): string | null {
  return position.trim().length > 0 ? null : 'Please choose the position you serve in.';
}
