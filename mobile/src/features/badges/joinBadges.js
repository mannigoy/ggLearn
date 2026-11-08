const time = (b) => {
  const t = b.dateEarned ? Date.parse(b.dateEarned) : NaN;
  return Number.isNaN(t) ? null : t;
};

// Adds courseTitle to each badge, newest first. Undated or invalid dates go last.
export function withCourseNames(badges, courses) {
  const titles = new Map(courses.map((c) => [c.id, c.title]));
  return badges
    .map((b) => ({ ...b, courseTitle: titles.get(b.courseId) || 'Course removed' }))
    .sort((a, b) => {
      const ta = time(a);
      const tb = time(b);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return tb - ta;
    });
}

// '' when the date is missing or invalid, so the UI never shows "Invalid Date".
export function formatEarned(dateEarned) {
  if (!dateEarned) return '';
  const d = new Date(dateEarned);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
}
