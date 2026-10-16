export type UserType = 'user' | 'admin' | 'member';

export function getDashboardPath(userType: UserType) {
  if (userType === 'admin') return '/admin/dashboard';
  if (userType === 'user') return '/dashboard';
  if (userType === 'member') return '/home';
  return '/customer/dashboard';
}