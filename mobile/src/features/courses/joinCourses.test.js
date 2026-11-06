import { splitCourses } from './joinCourses';

const courses = [
  { id: 'c1', title: 'Weather', gradeLevel: '3' },
  { id: 'c2', title: 'Plants', gradeLevel: 'K' },
  { id: 'c3', title: 'Magnets', gradeLevel: '3' },
];

describe('splitCourses', () => {
  it('puts an enrolled course only in mine, sorted by title', () => {
    const { mine, others } = splitCourses(courses, [{ courseId: 'c1' }], 'All');
    expect(mine.map((c) => c.id)).toEqual(['c1']);
    expect(others.map((c) => c.id)).toEqual(['c3', 'c2']);
  });

  it('applies the grade filter only to others', () => {
    const { mine, others } = splitCourses(courses, [{ courseId: 'c2' }], '3');
    expect(mine.map((c) => c.id)).toEqual(['c2']);
    expect(others.map((c) => c.id)).toEqual(['c3', 'c1']);
    expect(splitCourses(courses, [{ courseId: 'c2' }], '5').others).toEqual([]);
  });

  it("keeps everything for 'All'", () => {
    const { mine, others } = splitCourses(courses, [], 'All');
    expect(mine).toEqual([]);
    expect(others).toHaveLength(3);
  });

  it('drops an enrollment whose course no longer exists', () => {
    const { mine } = splitCourses(courses, [{ courseId: 'gone' }, { courseId: 'c1' }], 'All');
    expect(mine.map((c) => c.id)).toEqual(['c1']);
  });
});
