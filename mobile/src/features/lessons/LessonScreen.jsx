import { router } from 'expo-router';
import Screen from '../../components/Screen';
import { ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext.jsx';
import { isStaff } from '../../lib/roles.js';
import { useAsync } from '../../lib/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import { listExperiments } from '../../services/experimentApi.js';
import { getLesson } from '../../services/lessonApi.js';
import { listQuizzes } from '../../services/quizApi.js';
import LessonView from './LessonView';

async function loadBundle(id) {
  const lesson = await getLesson(id);
  const [course, experiments, quizzes] = await Promise.all([
    getCourse(lesson.courseId),
    listExperiments(id),
    listQuizzes(id),
  ]);
  return { course, bundle: { lesson, courseTitle: course.title, experiments, quizzes } };
}

export default function LessonScreen({ id }) {
  const { profile } = useAuth();
  const { data, error, loading, reloading, reload } = useAsync(() => loadBundle(id), [id]);

  let body;
  if (loading) body = <Loading />;
  else if (!data) body = <ErrorState message={error} onRetry={reload} />;
  else {
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        <LessonView
          bundle={data.bundle}
          staff={isStaff(profile, data.course)}
          onOpenQuiz={(quizId) => router.push('/quiz/' + quizId)}
        />
      </>
    );
  }
  const course = data?.course;
  const back = {
    label: course ? `Back to course ${course.title}` : 'Back',
    fallback: course ? '/course/' + data.bundle.lesson.courseId : '/courses',
  };
  return (
    <Screen back={back} refreshing={reloading} onRefresh={reload}>
      {body}
    </Screen>
  );
}
