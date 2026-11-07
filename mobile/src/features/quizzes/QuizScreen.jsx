import Screen from '../../components/Screen';
import { ErrorState, Loading } from '../../components/States';
import { useAsync } from '../../lib/useAsync.js';
import { listQuestions } from '../../services/questionApi.js';
import { getQuiz } from '../../services/quizApi.js';
import QuizPreview from './QuizPreview';

const byOrder = (a, b) => (a.order || 0) - (b.order || 0);

// Until quizzes can be taken, everyone (staff included) sees the read-only preview.
export default function QuizScreen({ id }) {
  const { data, error, loading, reloading, reload } = useAsync(async () => {
    const [quiz, questions] = await Promise.all([getQuiz(id), listQuestions(id)]);
    return { quiz, questions: [...questions].sort(byOrder) };
  }, [id]);

  let body;
  if (loading) body = <Loading />;
  else if (!data) body = <ErrorState message={error} onRetry={reload} />;
  else {
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        <QuizPreview quiz={data.quiz} questions={data.questions} />
      </>
    );
  }
  const lessonId = data?.quiz?.lessonId;
  return (
    <Screen
      back={{ label: 'Back to lesson', fallback: lessonId ? '/lesson/' + lessonId : '/courses' }}
      refreshing={reloading} onRefresh={reload}>
      {body}
    </Screen>
  );
}
