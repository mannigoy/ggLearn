import { ROLES } from '../lib/constants.js';

const TAB_ROLES = [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN];

/** Which part of the app a profile may see: 'auth', 'pending' or 'tabs'. */
export function routeFor(profile) {
  if (!profile) return 'auth';
  if (profile.role === ROLES.PENDING_TEACHER) return 'pending';
  if (TAB_ROLES.includes(profile.role)) return 'tabs';
  return 'auth';
}
