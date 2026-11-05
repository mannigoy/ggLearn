import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { ROLES, TOPICS } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import {
  createExperiment,
  deleteExperiment,
  listExperiments,
  updateExperiment
} from '../../services/experimentApi.js';
import { getLesson, updateLesson } from '../../services/lessonApi.js';
import { createQuiz, deleteQuiz, listQuizzes, updateQuiz } from '../../services/quizApi.js';
import ExperimentForm from './ExperimentForm.jsx';
import LessonForm from './LessonForm.jsx';
import QuizForm from './QuizForm.jsx';

const paragraphs = (content) =>
  (content ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Shared add/edit/delete state for a section's list. */
function useSection(list, { create, update, remove }) {
  const [editing, setEditing] = useState(null); // null, 'new' or an item id
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async (body) => {
    if (editing === 'new') await create(body);
    else await update(editing, body);
    setEditing(null);
    list.reload();
  };

  const del = async (item) => {
    if (busy) return;
    setActionError('');
    setBusy(true);
    try {
      await remove(item.id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      list.reload();
      setBusy(false);
    }
  };

  return { editing, setEditing, actionError, busy, save, del };
}

function ExperimentsSection({ lessonId, isStaff }) {
  const list = useAsync(() => listExperiments(lessonId), [lessonId]);
  const s = useSection(list, {
    create: (body) => createExperiment(lessonId, body),
    update: updateExperiment,
    remove: deleteExperiment
  });

  let body;
  if (s.editing) {
    const initial = s.editing === 'new' ? undefined : list.data.find((x) => x.id === s.editing);
    body = <ExperimentForm initial={initial} onSave={s.save} onCancel={() => s.setEditing(null)} />;
  } else if (list.loading) body = <Loading label="Loading experiments…" />;
  else if (list.error) body = <ErrorState message={list.error} onRetry={list.reload} />;
  else if (list.data.length === 0) {
    body = <Empty title="No experiments yet">{isStaff ? 'Add the first experiment.' : 'Check back soon.'}</Empty>;
  } else {
    body = (
      <ul className="plain-list">
        {list.data.map((x) => (
          <li key={x.id} className="item">
            <div className="grow">
              <h3>{x.title}</h3>
              <h4>Materials</h4>
              <ul>{x.materials.map((m, i) => <li key={i}>{m}</li>)}</ul>
              <h4>Steps</h4>
              <ol>{x.steps.map((st, i) => <li key={i}>{st}</li>)}</ol>
              {x.safetyNotes && (
                <div className="alert" role="note">
                  <b>Safety first</b>
                  <span className="grow">{x.safetyNotes}</span>
                </div>
              )}
            </div>
            {isStaff && (
              <div className="admin-role">
                <button type="button" className="btn small plain" disabled={s.busy} onClick={() => s.setEditing(x.id)}>
                  Edit<span className="sr-only"> {x.title}</span>
                </button>
                <Confirm label={<>Delete<span className="sr-only"> {x.title}</span></>} onYes={() => s.del(x)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="card" aria-label="Experiments">
      <div className="page-head">
        <h2>Experiments</h2>
        {isStaff && !s.editing && (
          <button type="button" className="btn" onClick={() => s.setEditing('new')}>Add experiment</button>
        )}
      </div>
      {s.actionError && <p className="alert" role="alert">{s.actionError}</p>}
      {body}
    </section>
  );
}

function QuizzesSection({ lessonId, isStaff, go }) {
  const list = useAsync(() => listQuizzes(lessonId), [lessonId]);
  const s = useSection(list, {
    create: (body) => createQuiz(lessonId, body),
    update: updateQuiz,
    remove: deleteQuiz
  });

  let body;
  if (s.editing) {
    const initial = s.editing === 'new' ? undefined : list.data.find((q) => q.id === s.editing);
    body = (
      <QuizForm
        initial={initial}
        totalPoints={initial?.totalPoints ?? 0}
        onSave={s.save}
        onCancel={() => s.setEditing(null)}
      />
    );
  } else if (list.loading) body = <Loading label="Loading quizzes…" />;
  else if (list.error) body = <ErrorState message={list.error} onRetry={list.reload} />;
  else if (list.data.length === 0) {
    body = <Empty title="No quizzes yet">{isStaff ? 'Add the first quiz.' : 'Check back soon.'}</Empty>;
  } else {
    body = (
      <ul className="plain-list">
        {list.data.map((q) => (
          <li key={q.id} className="item course-card">
            <button type="button" className="course-open grow" onClick={() => go({ name: 'quiz', id: q.id })}>
              <b>{q.title}</b>
              <small>{plural(q.totalPoints, 'question')} · pass with {q.passingScore}</small>
            </button>
            {isStaff && (
              <div className="admin-role">
                <button type="button" className="btn small plain" disabled={s.busy} onClick={() => s.setEditing(q.id)}>
                  Edit<span className="sr-only"> {q.title}</span>
                </button>
                <Confirm label={<>Delete<span className="sr-only"> {q.title}</span></>} onYes={() => s.del(q)} />
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="card" aria-label="Quizzes">
      <div className="page-head">
        <h2>Quizzes</h2>
        {isStaff && !s.editing && (
          <button type="button" className="btn" onClick={() => s.setEditing('new')}>Add quiz</button>
        )}
      </div>
      {s.actionError && <p className="alert" role="alert">{s.actionError}</p>}
      {body}
    </section>
  );
}

export default function LessonPage({ user, id, go }) {
  const lesson = useAsync(() => getLesson(id), [id]);
  const courseId = lesson.data?.courseId ?? null;
  // The course is only needed for the staff check; if it fails, staff buttons stay hidden.
  const course = useAsync(() => (courseId ? getCourse(courseId) : Promise.resolve(null)), [courseId]);
  const [editing, setEditing] = useState(false);

  const back = (
    <button
      type="button"
      className="btn small plain"
      onClick={() => go(courseId ? { name: 'course', id: courseId } : { name: 'courses' })}
    >
      {courseId ? 'Back to course' : 'Back to courses'}
    </button>
  );

  if (lesson.loading) return <>{back}<Loading label="Loading lesson…" /></>;
  if (lesson.error) return <>{back}<ErrorState message={lesson.error} onRetry={lesson.reload} /></>;

  const l = lesson.data;
  const c = course.data;
  const isStaff = Boolean(c) && (user.role === ROLES.ADMIN || (user.role === ROLES.TEACHER && c.teacherUid === user.uid));

  const saveLesson = async (body) => {
    await updateLesson(id, { ...body, order: l.order });
    setEditing(false);
    lesson.reload();
  };

  return (
    <>
      {back}
      {editing ? (
        <LessonForm initial={l} onSave={saveLesson} onCancel={() => setEditing(false)} />
      ) : (
        <article className="card">
          <div className="page-head">
            <div>
              <h1>{l.title}</h1>
              <span className="chip sun">{TOPICS[l.topic] ?? l.topic}</span>
            </div>
            {isStaff && <button type="button" className="btn" onClick={() => setEditing(true)}>Edit lesson</button>}
          </div>
          {paragraphs(l.content).map((p, i) => <p key={i}>{p}</p>)}
        </article>
      )}
      <ExperimentsSection lessonId={id} isStaff={isStaff} />
      <QuizzesSection lessonId={id} isStaff={isStaff} go={go} />
    </>
  );
}
