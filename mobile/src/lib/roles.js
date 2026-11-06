/** Staff on a course: an admin, or the teacher who owns it. */
export const isStaff = (profile, course) =>
  Boolean(profile) && (profile.role === 'admin' || course?.teacherUid === profile.uid);
