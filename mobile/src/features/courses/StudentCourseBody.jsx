import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Confirm from '../../components/Confirm';
import { Empty, ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext.jsx';
import { useRefreshOn } from './useRefreshOn.js';
import { useAsync } from '../../lib/useAsync.js';
import { enroll, myEnrollments, unenroll } from '../../services/enrollmentApi.js';
import { listLessons } from '../../services/lessonApi.js';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';

const byOrder = (a, b) => (a.order || 0) - (b.order || 0);

/** Lessons in order. Each row opens the lesson. */
export function LessonList({ lessons }) {
  if (lessons.length === 0) return <Empty title="No lessons yet.">Check back soon.</Empty>;
  return [...lessons].sort(byOrder).map((lesson) => (
    <Card key={lesson.id}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open lesson ${lesson.title}`}
        onPress={() => router.push('/lesson/' + lesson.id)}
        style={styles.row}
      >
        <Text style={styles.lesson}>{lesson.title}</Text>
      </Pressable>
    </Card>
  ));
}

export default function StudentCourseBody({ course, refreshKey = 0 }) {
  const { profile } = useAuth();
  const { data, error, loading, reload } = useAsync(async () => {
    const mine = await myEnrollments();
    const enrolled = mine.some((e) => e.courseId === course.id);
    return { enrolled, lessons: enrolled ? await listLessons(course.id) : null };
  }, [course.id]);
  useRefreshOn(refreshKey, reload);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  const run = async (action, fallback) => {
    if (busy) return;
    setBusy(true);
    setActionError('');
    try {
      await action();
      reload();
    } catch (err) {
      setActionError(err?.message || fallback);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loading />;
  if (!data) return <ErrorState message={error} onRetry={reload} />;

  const problem = actionError ? (
    <Text accessibilityRole="alert" style={styles.err}>{actionError}</Text>
  ) : null;

  return (
    <>
      {error ? <ErrorState message={error} onRetry={reload} /> : null}
      {data.enrolled ? (
        <>
          <LessonList lessons={data.lessons} />
          <View style={styles.action}>
            <Confirm
              label="Leave course"
              accessibilityLabel={`Leave course ${course.title}`}
              onYes={() => run(() => unenroll(course.id, profile.uid), 'Could not leave. Please try again.')}
            />
            {problem}
          </View>
        </>
      ) : (
        <View style={styles.action}>
          <Button
            label="Enroll in this course"
            busy={busy}
            onPress={() => run(() => enroll(course.id), 'Could not join. Please try again.')}
          />
          {problem}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: tokens.minTouch, justifyContent: 'center' },
  lesson: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
  action: { marginTop: tokens.space(4), gap: tokens.space(2), alignItems: 'flex-start' },
  err: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.coralDark },
});
