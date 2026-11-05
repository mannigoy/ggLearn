import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { ErrorState, Loading } from '../../components/ui/States.jsx';
import Tabs from '../../components/ui/Tabs.jsx';
import { ROLES, TOPICS } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import { unenroll } from '../../services/enrollmentApi.js';
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
  const course = useAsync(() => getCourse(id), [id]);
  const [leaveError, setLeaveError] = useState('');

  const back = (
    <button type="button" className="btn small plain" onClick={() => go({ name: 'courses' })}>
      Back to courses
    </button>
  );

  if (course.loading) return <>{back}<Loading label="Loading course…" /></>;
  if (course.error) return <>{back}<ErrorState message={course.error} onRetry={course.reload} /></>;

  const c = course.data;
  const isStaff = user.role === ROLES.ADMIN || (user.role === ROLES.TEACHER && c.teacherUid === user.uid);
  const isStudent = user.role === ROLES.STUDENT;
  const active = isStaff && TABS.some((t) => t.id === tab) ? tab : 'lessons';

  const leave = async () => {
    setLeaveError('');
    try {
      await unenroll(id, user.uid);
      go({ name: 'courses' });
    } catch (err) {
      setLeaveError(err.message);
    }
  };

  return (
    <>
      {back}
      <div className="page-head">
        <div>
          <h1>{c.title}</h1>
          <span className="chip">{gradeName(c.gradeLevel)}</span>{' '}
          <span className="chip sun">{TOPICS[c.topic] ?? c.topic}</span>
        </div>
        {isStudent && <Confirm label="Leave course" onYes={leave} />}
      </div>
      {leaveError && <p className="alert" role="alert">{leaveError}</p>}
      {isStaff && <Tabs tabs={TABS} active={active} onChange={(next) => go({ name: 'course', id, tab: next })} />}
      {active === 'lessons' && <LessonsTab courseId={id} isStaff={isStaff} go={go} />}
      {isStaff && active === 'students' && <StudentsTab courseId={id} />}
      {isStaff && active === 'badges' && <BadgesTab courseId={id} />}
    </>
  );
}
