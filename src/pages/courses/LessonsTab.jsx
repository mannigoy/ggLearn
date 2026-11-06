import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { TOPICS } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { createLesson, deleteLesson, listLessons, updateLesson } from '../../services/lessonApi.js';
import LessonForm from '../lessons/LessonForm.jsx';

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

export default function LessonsTab({ courseId, isStaff, go }) {
  const lessons = useAsync(async () => (await listLessons(courseId)).slice().sort(byOrder), [courseId]);
  const [adding, setAdding] = useState(false);
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async (body) => {
    const items = lessons.data ?? [];
    const order = items.reduce((max, l) => Math.max(max, l.order ?? 0), 0) + 1;
    await createLesson(courseId, { ...body, order });
    setAdding(false);
    lessons.reload();
  };

  const run = async (action) => {
    if (busy) return;
    setActionError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setActionError(err.message);
    } finally {
      // A failed move may have changed one lesson, so show the real order either way.
      lessons.reload();
      setBusy(false);
    }
  };

  const remove = (lesson) => run(() => deleteLesson(lesson.id));
  const move = (index, step) =>
    run(async () => {
      const a = lessons.data[index];
      const b = lessons.data[index + step];
      // Equal or missing orders would make a swap a no-op, so fall back to positions.
      const same = (a.order ?? 0) === (b.order ?? 0);
      const orderA = same ? index + step + 1 : b.order;
      const orderB = same ? index + 1 : a.order;
      const toBody = (l, order) => ({ title: l.title, topic: l.topic, content: l.content, order });
      await updateLesson(a.id, toBody(a, orderA));
      await updateLesson(b.id, toBody(b, orderB));
    });

  if (adding) return <LessonForm onSave={add} onCancel={() => setAdding(false)} />;

  let body;
  if (lessons.loading) body = <Loading label="Loading lessons…" />;
  else if (!lessons.data) body = <ErrorState message={lessons.error} onRetry={lessons.reload} />;
  else if (lessons.data.length === 0) {
    body = <Empty title="No lessons yet">{isStaff ? 'Add the first lesson.' : 'Your teacher will add lessons soon.'}</Empty>;
  } else {
    const last = lessons.data.length - 1;
    body = (
      <ol className="plain-list">
        {lessons.data.map((lesson, i) => (
          <li key={lesson.id} className="item course-card">
            <button type="button" className="course-open grow" onClick={() => go({ name: 'lesson', id: lesson.id })}>
              <b>{lesson.title}</b>
              <span className="chip sun">{TOPICS[lesson.topic] ?? lesson.topic}</span>
            </button>
            {isStaff && (
              <div className="admin-role">
                <button type="button" className="btn small plain" disabled={busy || i === 0} onClick={() => move(i, -1)}>
                  Move up<span className="sr-only"> {lesson.title}</span>
                </button>
                <button type="button" className="btn small plain" disabled={busy || i === last} onClick={() => move(i, 1)}>
                  Move down<span className="sr-only"> {lesson.title}</span>
                </button>
                <Confirm label={<>Delete<span className="sr-only"> {lesson.title}</span></>} onYes={() => remove(lesson)} />
              </div>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <section className="card" aria-label="Lessons">
      {isStaff && (
        <div className="page-head">
          <h2>Lessons</h2>
          <button type="button" className="btn" onClick={() => setAdding(true)}>Add lesson</button>
        </div>
      )}
      {actionError && <p className="alert" role="alert">{actionError}</p>}
      {lessons.data && lessons.error && <ErrorState message={lessons.error} onRetry={lessons.reload} />}
      {body}
    </section>
  );
}
