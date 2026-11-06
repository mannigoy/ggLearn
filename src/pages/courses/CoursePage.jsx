import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { ErrorState, Loading } from '../../components/ui/States.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { ROLES, TOPICS } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import { enroll, myEnrollments, unenroll } from '../../services/enrollmentApi.js';
import BadgesTab from './BadgesTab.jsx';
import LessonsTab from './LessonsTab.jsx';
import StudentsTab from './StudentsTab.jsx';

const gradeName = (g) => (g === 'K' ? 'Kindergarten' : `Grade ${g}`);
const TABS = [
  { id: 'lessons', label: 'Lessons' },
  { id: 'students', label: 'Students' },
  { id: 'badges', label: 'Badges' }
];

export default function CoursePage({ user, id, tab, go }) {
  const isStudent = user.role === ROLES.STUDENT;
  // A student also needs to know whether they have joined this course.
  const course = useAsync(async () => {
    const [found, mine] = await Promise.all([getCourse(id), isStudent ? myEnrollments() : Promise.resolve([])]);
    return { course: found, enrolled: !isStudent || mine.some((e) => e.courseId === id) };
  }, [id, isStudent]);
  const [actionError, setActionError] = useState('');
  const [joining, setJoining] = useState(false);

  const back = (
    <button type="button" className="btn small plain" onClick={() => go({ name: 'courses' })}>
      Back to courses
    </button>
  );

  if (course.loading) return <>{back}<Loading label="Loading course…" /></>;
  if (!course.data) return <>{back}<ErrorState message={course.error} onRetry={course.reload} /></>;

  const c = course.data.course;
  const enrolled = course.data.enrolled;
  const isStaff = user.role === ROLES.ADMIN || (user.role === ROLES.TEACHER && c.teacherUid === user.uid);
  const active = isStaff && TABS.some((t) => t.id === tab) ? tab : 'lessons';

  const leave = async () => {
    setActionError('');
    try {
      await unenroll(id, user.uid);
      go({ name: 'courses' });
    } catch (err) {
      setActionError(err.message);
    }
  };

  const join = async () => {
    if (joining) return;
    setActionError('');
    setJoining(true);
    try {
      await enroll(id);
      course.reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <>
      {back}
      {course.error && <ErrorState message={course.error} onRetry={course.reload} />}
      <div className="page-head">
        <div>
          <h1>{c.title}</h1>
          <span className="chip">{gradeName(c.gradeLevel)}</span>{' '}
          <span className="chip sun">{TOPICS[c.topic] ?? c.topic}</span>
        </div>
        {isStudent && enrolled && <Confirm label="Leave course" onYes={leave} />}
        {isStudent && !enrolled && (
          <button type="button" className="btn" disabled={joining} onClick={join}>Enroll</button>
        )}
      </div>
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      {isStaff && <Tabs tabs={TABS} active={active} onChange={(next) => go({ name: 'course', id, tab: next })} />}
      {isStudent && !enrolled && <p className="muted">Enroll to see the lessons.</p>}
      {active === 'lessons' && !(isStudent && !enrolled) && <LessonsTab courseId={id} isStaff={isStaff} go={go} />}
      {isStaff && active === 'students' && <StudentsTab courseId={id} />}
      {isStaff && active === 'badges' && <BadgesTab courseId={id} />}
    </>
  );
}
