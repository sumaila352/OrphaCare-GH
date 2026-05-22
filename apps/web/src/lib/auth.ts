import type { AuthUser } from './api';

export function isStaff(user: AuthUser) {
  return user.roles.some((r) => r === 'admin' || r === 'staff');
}

export function isDonor(user: AuthUser) {
  return user.roles.includes('donor') && !isStaff(user);
}

export function homePathForUser(user: AuthUser) {
  if (isStaff(user)) return '/dashboard';
  if (user.roles.includes('donor')) return '/my/donations';
  return '/login';
}
