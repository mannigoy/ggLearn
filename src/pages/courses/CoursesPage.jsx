import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { GRADES, ROLES, TOPICS } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { listUsers } from '../../services/adminUserApi.js';
import { createCourse, deleteCourse, listCourses, updateCourse } from '../../services/courseApi.js';
import { enroll, myEnrollments } from '../../services/enrollmentApi.js';
import CourseForm from './CourseForm.jsx';

const gradeName = (g) => (g === 'K' ? 'Kindergarten' : `Grade ${g}`);

function CourseCard({ course, onOpen, children }) {
  return (
    <li className="item course-card">
      <button type="button" className="course-open grow" onClick={() => onOpen(course)}>
        <b>{course.title}</b>
        <small className="muted">{course.teacherName ? `Teacher: ${course.teacherName}` : 'No teacher yet'}</small>
        <span className="chip">{gradeName(course.gradeLevel)}</span>{' '}
        <span className="chip sun">{TOPICS[course.topic] ?? course.topic}</span>
      </button>
      {children}
    </li>
  );
}

function StaffCourses({ user, go }) {
  const isAdmin = user.role === ROLES.ADMIN;
  const courses = useAsync(() => listCourses(isAdmin ? {} : { mine: true }), [isAdmin]);
  const teachers = useAsync(
    async () => (isAdmin ? (await listUsers()).filter((u) => u.role === ROLES.TEACHER) : null),
    [isAdmin]
  );
  const [editing, setEditing] = useState(null); // null, 'new' or a course
  const [actionError, setActionError] = useState('');

  const save = async (body) => {
    if (editing === 'new') await createCourse(body);
    else await updateCourse(editing.id, body);
    setEditing(null);
    courses.reload();
  };
  const remove = async (course) => {
    setActionError('');
    try {
      await deleteCourse(course.id);
      courses.reload();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (editing) {
    return (
      <CourseForm
        initial={editing === 'new' ? null : editing}
        teachers={isAdmin ? teachers.data ?? [] : undefined}
        onSave={save}
        onCancel={() => setEditing(null)}
      />
    );
  }

  let body;
  if (courses.loading) body = <Loading label="Loading courses…" />;
  else if (courses.error) body = <ErrorState message={courses.error} onRetry={courses.reload} />;
  else if (courses.data.length === 0) {
    body = <Empty title="No courses yet">Create your first course to add lessons.</Empty>;
  } else {
    body = (
      <ul className="plain-list">
        {courses.data.map((c) => (
          <CourseCard key={c.id} course={c} onOpen={(x) => go({ name: 'course', id: x.id, tab: 'lessons' })}>
            <div className="admin-role">
              <button type="button" className="btn small plain" onClick={() => setEditing(c)}>Edit</button>
              <Confirm label="Delete" onYes={() => remove(c)} />
            </div>
          </CourseCard>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div className="page-head">
        <h1>{isAdmin ? 'All courses' : 'My courses'}</h1>
        <button type="button" className="btn" onClick={() => setEditing('new')}>New course</button>
      </div>
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      <section className="card" aria-label="Courses">{body}</section>
    </>
  );
}

function StudentCourses({ go }) {
  const data = useAsync(async () => {
    const [courses, enrollments] = await Promise.all([listCourses(), myEnrollments()]);
    return { courses, enrolledIds: new Set(enrollments.map((e) => e.courseId)) };
  }, []);
  const [grade, setGrade] = useState('all');
  const [enrollError, setEnrollError] = useState('');
  const [busyId, setBusyId] = useState('');

  const join = async (course) => {
    setEnrollError('');
    setBusyId(course.id);
    try {
      await enroll(course.id);
      data.reload();
    } catch (err) {
      setEnrollError(err.message);
    } finally {
      setBusyId('');
    }
  };
  const open = (c) => go({ name: 'course', id: c.id, tab: 'lessons' });

  if (data.loading) return <><h1>My courses</h1><Loading label="Loading courses…" /></>;
  if (data.error) return <><h1>My courses</h1><ErrorState message={data.error} onRetry={data.reload} /></>;

  const mine = data.data.courses.filter((c) => data.data.enrolledIds.has(c.id));
  const others = data.data.courses.filter(
    (c) => !data.data.enrolledIds.has(c.id) && (grade === 'all' || c.gradeLevel === grade)
  );

  return (
    <>
      <h1>My courses</h1>
      <section className="card" aria-labelledby="mine-title">
        <h2 id="mine-title">Joined</h2>
        {mine.length === 0 ? (
          <Empty title="You haven’t joined a course yet">Pick one from Browse below.</Empty>
        ) : (
          <ul className="plain-list">
            {mine.map((c) => <CourseCard key={c.id} course={c} onOpen={open} />)}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="browse-title">
        <h2 id="browse-title">Browse</h2>
        <div className="field">
          <label htmlFor="grade-filter">Grade</label>
          <select id="grade-filter" value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="all">All grades</option>
            {GRADES.map((g) => <option key={g} value={g}>{gradeName(g)}</option>)}
          </select>
        </div>
        {enrollError && <p className="alert" role="alert">{enrollError}</p>}
        {others.length === 0 ? (
          <Empty title="No courses to show" />
        ) : (
          <ul className="plain-list">
            {others.map((c) => (
              <CourseCard key={c.id} course={c} onOpen={open}>
                <button type="button" className="btn small" disabled={busyId === c.id} onClick={() => join(c)}>
                  Enroll<span className="sr-only"> in {c.title}</span>
                </button>
              </CourseCard>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function ReadOnlyCourses({ go }) {
  const courses = useAsync(() => listCourses(), []);
  return (
    <>
      <h1>All courses</h1>
      <section className="card" aria-label="Courses">
        {courses.loading && <Loading label="Loading courses…" />}
        {!courses.loading && courses.error && <ErrorState message={courses.error} onRetry={courses.reload} />}
        {!courses.loading && !courses.error && (courses.data.length === 0 ? (
          <Empty title="No courses yet" />
        ) : (
          <ul className="plain-list">
            {courses.data.map((c) => (
              <CourseCard key={c.id} course={c} onOpen={(x) => go({ name: 'course', id: x.id, tab: 'lessons' })} />
            ))}
          </ul>
        ))}
      </section>
    </>
  );
}

export default function CoursesPage({ user, go }) {
  if (user.role === ROLES.TEACHER || user.role === ROLES.ADMIN) return <StaffCourses user={user} go={go} />;
  if (user.role === ROLES.STUDENT) return <StudentCourses go={go} />;
  return <ReadOnlyCourses go={go} />;
}
