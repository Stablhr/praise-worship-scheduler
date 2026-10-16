import type {MemberPermission} from '@/lib/api/authApi';

export const PERMISSION_LABELS: Record<MemberPermission, string> = {
  admin: 'Admin',
  songleader: 'Song leader',
  member: 'Member'
};

/**
 * Only the Chairman and the Pastor are admins (CONTEXT.md section 2).
 * The screen hides admin controls with this; the server enforces the same rule
 * in requirePermission, because hiding a button is not security.
 */
export function isAdmin(
  user?: {permission?: MemberPermission} | null
): boolean {
  return user?.permission === 'admin';
}
