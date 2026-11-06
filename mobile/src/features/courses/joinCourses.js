const byTitle = (a, b) => String(a.title).localeCompare(String(b.title));

// mine: enrolled courses (never grade-filtered). others: the rest, filtered by grade unless 'All'.
export function splitCourses(courses, enrollments, grade) {
  const enrolled = new Set(enrollments.map((e) => e.courseId));
  const mine = courses.filter((c) => enrolled.has(c.id)).sort(byTitle);
  const others = courses
    .filter((c) => !enrolled.has(c.id) && (grade === 'All' || c.gradeLevel === grade))
    .sort(byTitle);
  return { mine, others };
}
