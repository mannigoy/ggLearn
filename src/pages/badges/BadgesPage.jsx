import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { myBadges } from '../../services/badgeApi.js';
import { listCourses } from '../../services/courseApi.js';

export default function BadgesPage() {
  const data = useAsync(async () => {
    const [badges, courses] = await Promise.all([myBadges(), listCourses()]);
    return { badges, titles: new Map(courses.map((c) => [c.id, c.title])) };
  }, []);

  let body;
  if (data.loading) body = <Loading label="Loading badges…" />;
  else if (data.error) body = <ErrorState message={data.error} onRetry={data.reload} />;
  else if (data.data.badges.length === 0) {
    body = <Empty title="No badges yet. Finish a course to earn one." />;
  } else {
    body = (
      <ul className="plain-list">
        {data.data.badges.map((b) => (
          <li key={b.id} className="item">
            <span className="grow">
              <b>{b.title}</b>
              <small className="muted">
                {data.data.titles.get(b.courseId) ?? 'A course'} on {new Date(b.dateEarned).toLocaleDateString()}
              </small>
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <h1>My badges</h1>
      <section className="card" aria-label="Badges">{body}</section>
    </>
  );
}
