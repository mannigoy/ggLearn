import { withCourseNames } from './joinBadges.js';

const courses = [{ id: 'c1', title: 'Plants' }];

describe('withCourseNames', () => {
  it('adds the course title and removed-course fallback', () => {
    const out = withCourseNames(
      [{ id: 'b1', courseId: 'c1', dateEarned: '2026-11-03T00:00:00Z' }, { id: 'b2', courseId: 'gone', dateEarned: '2026-11-01T00:00:00Z' }],
      courses,
    );
    expect(out.find((b) => b.id === 'b1').courseTitle).toBe('Plants');
    expect(out.find((b) => b.id === 'b2').courseTitle).toBe('Course removed');
  });

  it('sorts newest first with undated badges last', () => {
    const out = withCourseNames(
      [
        { id: 'none', courseId: 'c1', dateEarned: null },
        { id: 'old', courseId: 'c1', dateEarned: '2026-01-01T00:00:00Z' },
        { id: 'bad', courseId: 'c1', dateEarned: 'nonsense' },
        { id: 'new', courseId: 'c1', dateEarned: '2026-11-01T00:00:00Z' },
      ],
      courses,
    );
    expect(out.slice(0, 2).map((b) => b.id)).toEqual(['new', 'old']);
    expect(out.slice(2).map((b) => b.id).sort()).toEqual(['bad', 'none']);
  });

  it('does not mutate its input', () => {
    const input = [{ id: 'a', courseId: 'c1', dateEarned: null }, { id: 'b', courseId: 'c1', dateEarned: '2026-01-01T00:00:00Z' }];
    withCourseNames(input, courses);
    expect(input.map((b) => b.id)).toEqual(['a', 'b']);
  });
});
