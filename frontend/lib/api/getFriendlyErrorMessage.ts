import type {NormalizedApiError} from './types';

function isNormalizedApiError(error: unknown): error is NormalizedApiError {
  return (
    !!error &&
    typeof error === 'object' &&
    'message' in error &&
    'code' in error &&
    typeof (error as Record<string, unknown>).message === 'string' &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
}

function hasStringMessage(error: unknown): error is {message: string} {
  return (
    !!error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function getDuplicateKeyFriendlyMessage(rawMessage: string): string | null {
  const msg = rawMessage.toLowerCase();

  if (!msg.includes('e11000') && !msg.includes('duplicate key')) return null;

  if (
    msg.includes('phonenumber') ||
    msg.includes('phoneNumber_1'.toLowerCase())
  ) {
    return 'Phone number already exists.';
  }

  if (msg.includes('email') || msg.includes('email_1')) {
    return 'Email already exists.';
  }

  return 'Account already exists.';
}

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!error) return fallback;

  if (isNormalizedApiError(error)) {
    switch (error.code) {
      case 'EMAIL_EXISTS':
        return 'Email already exists.';
      case 'PHONE_EXISTS':
        return 'Phone number already exists.';
      case 'USERNAME_EXISTS':
        return 'Username already taken.';
      case 'ALREADY_VERIFIED':
        return 'Your email is already verified. Please sign in.';
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'NOT_VERIFIED':
        return 'Your email is not verified yet. Please verify your email to continue.';
      case 'INVALID_CODE':
        return 'Invalid verification code.';
      case 'EXPIRED_CODE':
        return 'Verification code expired or invalid. Please request a new code.';
      case 'USER_NOT_FOUND':
        return 'User not found.';
      case 'ACCOUNT_EXISTS':
        return 'This email already has an account. Please sign in instead.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment and try again.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection and try again.';
      case 'ACCOUNT_NOT_FOUND':
        return 'We could not find an account with that email. Tap “Create an account” to make one.';
      case 'ACCOUNT_NOT_ACTIVATED':
        return 'You have not set up your account yet. Tap “Create an account” to choose a password.';
      case 'MEMBER_NOT_FOUND':
        return 'We could not find your account. Please create an account again.';
      case 'MEMBER_EXISTS':
        return 'This email is already on the team list.';
      case 'CANNOT_REMOVE_SELF':
        return 'You cannot remove your own account.';
      case 'LAST_ADMIN':
        return 'There must always be at least one admin on the team.';
      case 'SERVICE_NOT_FOUND':
        return 'We could not find this service. It may have been removed.';
      case 'INVALID_ROLE':
        return 'That role is not part of this service.';
      case 'DUPLICATE_ROLE':
        return 'Only one member can hold a role for now.';
      case 'FORBIDDEN':
        return 'You do not have permission to do that.';
      case 'YOUTUBE_NOT_CONFIGURED':
        return 'YouTube search is not available right now. You can still add a song manually.';
      case 'YOUTUBE_SEARCH_FAILED':
        return 'YouTube search failed. Please try again.';
      case 'VIDEO_NOT_FOUND':
        return 'We could not find this video on YouTube.';
      default:
        break;
    }

    const duplicateKeyMessage = getDuplicateKeyFriendlyMessage(error.message);
    if (duplicateKeyMessage) return duplicateKeyMessage;

    if (error.message.includes('at least 8 character')) {
      return 'Password must be at least 8 characters.';
    }

    if (error.message.includes('uppercase letter')) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (error.message.includes('lowercase letter')) {
      return 'Password must contain at least one lowercase letter.';
    }

    if (error.message.includes('at least one digit')) {
      return 'Password must contain at least one digit.';
    }

    if (error.message.includes('special character')) {
      return 'Password must contain at least one special character.';
    }

    if (error.message.toLowerCase().includes('invalid email')) {
      return 'Please enter a valid email address.';
    }

    return fallback;
  }

  if (hasStringMessage(error)) {
    const msg = error.message;

    const duplicateKeyMessage = getDuplicateKeyFriendlyMessage(msg);
    if (duplicateKeyMessage) return duplicateKeyMessage;

    if (msg.includes('at least 8 character')) {
      return 'Password must be at least 8 characters.';
    }

    if (msg.includes('uppercase letter')) {
      return 'Password must contain at least one uppercase letter.';
    }

    if (msg.includes('lowercase letter')) {
      return 'Password must contain at least one lowercase letter.';
    }

    if (msg.includes('at least one digit')) {
      return 'Password must contain at least one digit.';
    }

    if (msg.includes('special character')) {
      return 'Password must contain at least one special character.';
    }

    return fallback;
  }

  return fallback;
}
