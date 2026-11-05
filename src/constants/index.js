export const STORAGE_KEY = 'gglearn-basic';
// Set to false when the school switches to admin-created accounts.
export const ALLOW_SELF_REGISTER = true;

export const TOPICS = {
  life: 'Life Science',
  earth: 'Earth Science',
  physical: 'Physical Science'
};

export const ROLES = {
  STUDENT: 'student',
  // Signed up as a teacher; acts like no role until an admin approves.
  PENDING_TEACHER: 'pending_teacher',
  TEACHER: 'teacher',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  student: 'Student',
  pending_teacher: 'Teacher (pending)',
  teacher: 'Teacher',
  admin: 'Admin'
};
