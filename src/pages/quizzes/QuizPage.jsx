import { useState } from 'react';
import Confirm from '../../components/ui/Confirm.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Empty, ErrorState, Loading } from '../../components/ui/States.jsx';
import { ROLES } from '../../constants/index.js';
import { useAsync } from '../../hooks/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import { createQuestion, deleteQuestion, listQuestions, updateQuestion } from '../../services/questionApi.js';
import { getQuiz } from '../../services/quizApi.js';
import QuestionForm from './QuestionForm.jsx';

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

export default function QuizPage({ user, id, go }) {
  const quiz = useAsync(() => getQuiz(id), [id]);
  const lessonId = quiz.data?.lessonId ?? null;
  const courseId = quiz.data?.courseId ?? null;
  // The course is only needed for the staff check; if it fails, staff buttons stay hidden.
  const course = useAsync(() => (courseId ? getCourse(courseId) : Promise.resolve(null)), [courseId]);
  const questions = useAsync(() => listQuestions(id), [id]);
  const [editing, setEditing] = useState(null); // null, 'new' or a question id
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = (
    <button
      type="button"
      className="btn small plain"
      onClick={() => go(lessonId ? { name: 'lesson', id: lessonId } : { name: 'courses' })}
    >
      {lessonId ? 'Back to lesson' : 'Back to courses'}
    </button>
  );

  if (quiz.loading) return <>{back}<Loading label="Loading quiz…" /></>;
  if (!quiz.data) return <>{back}<ErrorState message={quiz.error} onRetry={quiz.reload} /></>;

  const q = quiz.data;
  const c = course.data;
  const isStaff = Boolean(c) && (user.role === ROLES.ADMIN || (user.role === ROLES.TEACHER && c.teacherUid === user.uid));

  const save = async (body) => {
    if (editing === 'new') {
      const order = (questions.data ?? []).reduce((max, x) => Math.max(max, x.order ?? 0), 0) + 1;
      await createQuestion(id, { ...body, order });
    } else {
      const existing = questions.data.find((x) => x.id === editing);
      await updateQuestion(editing, { ...body, order: existing?.order });
    }
    setEditing(null);
    questions.reload();
    quiz.reload();
  };

  const del = async (question) => {
    if (busy) return;
    setActionError('');
    setBusy(true);
    try {
      await deleteQuestion(question.id);
    } catch (err) {
      setActionError(err.message);
    } finally {
      questions.reload();
      quiz.reload();
      setBusy(false);
    }
  };

  let body;
  if (editing) {
    const initial = editing === 'new' ? undefined : questions.data.find((x) => x.id === editing);
    body = <QuestionForm initial={initial} onSave={save} onCancel={() => setEditing(null)} />;
  } else if (questions.loading) body = <Loading label="Loading questions…" />;
  else if (!questions.data) body = <ErrorState message={questions.error} onRetry={questions.reload} />;
  else if (questions.data.length === 0) {
    body = <Empty title="No questions yet">{isStaff ? 'Add the first question.' : 'Check back soon.'}</Empty>;
  } else {
    body = (
      <ol className="plain-list">
        {questions.data.map((x) => (
          <li key={x.id} className="item">
            <div className="grow">
              <h3>{x.questionText}</h3>
              <ul>
                {x.choices.map((choice, i) => (
                  <li key={i}>
                    {choice}
                    {isStaff && choice === x.correctAnswer && (
                      <>
                        {' '}
                        <Icon name="check" size={18} />
                        <span className="sr-only"> (correct answer)</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {isStaff && (
              <div className="admin-role">
                <button type="button" className="btn small plain" disabled={busy} onClick={() => setEditing(x.id)}>
                  Edit<span className="sr-only"> {x.questionText}</span>
                </button>
                <Confirm label={<>Delete<span className="sr-only"> {x.questionText}</span></>} onYes={() => del(x)} />
              </div>
            )}
          </li>
        ))}
      </ol>
    );
  }

  return (
    <>
      {back}
      {quiz.error && <ErrorState message={quiz.error} onRetry={quiz.reload} />}
      <article className="card">
        <div className="page-head">
          <div>
            <h1>{q.title}</h1>
            <p>{plural(q.totalPoints, 'question')} · pass with {q.passingScore}</p>
          </div>
          {isStaff && !editing && (
            <button type="button" className="btn" onClick={() => setEditing('new')}>Add question</button>
          )}
        </div>
        {!isStaff && <p role="note">Taking quizzes is coming soon.</p>}
        {actionError && <p className="alert" role="alert">{actionError}</p>}
        {questions.data && questions.error && <ErrorState message={questions.error} onRetry={questions.reload} />}
        {body}
      </article>
    </>
  );
}
