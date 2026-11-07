import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { ErrorState, Loading } from '../../components/States';
import { useAuth } from '../../context/AuthContext.jsx';
import { TOPICS } from '../../lib/constants.js';
import { isStaff } from '../../lib/roles.js';
import { useAsync } from '../../lib/useAsync.js';
import { getCourse } from '../../services/courseApi.js';
import { listLessons } from '../../services/lessonApi.js';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import StudentCourseBody, { LessonList } from './StudentCourseBody';
import { useRefreshOn } from './useRefreshOn.js';

function CourseHeader({ course }) {
  return (
    <Card>
      <Text accessibilityRole="header" style={styles.title}>{course.title}</Text>
      <Text style={styles.meta}>{`Grade ${course.gradeLevel}`}</Text>
      <Text style={styles.meta}>{TOPICS[course.topic] || course.topic}</Text>
    </Card>
  );
}

// Temporary read-only view for the owning teacher and admins. Task 14 replaces it with StaffCourseBody.
function StaffPreview({ course, refreshKey }) {
  const { data, error, loading, reload } = useAsync(() => listLessons(course.id), [course.id]);
  useRefreshOn(refreshKey, reload);
  if (loading) return <Loading />;
  if (!data) return <ErrorState message={error} onRetry={reload} />;
  return <LessonList lessons={data} />;
}

export default function CourseScreen({ id }) {
  const { profile } = useAuth();
  const { data: course, error, loading, reloading, reload } = useAsync(() => getCourse(id), [id]);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => {
    reload();
    setRefreshKey((n) => n + 1);
  };

  let body;
  if (loading) body = <Loading />;
  else if (!course) body = <ErrorState message={error} onRetry={reload} />;
  else {
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        <CourseHeader course={course} />
        {isStaff(profile, course) ? (
          <StaffPreview course={course} refreshKey={refreshKey} />
        ) : (
          <StudentCourseBody course={course} refreshKey={refreshKey} />
        )}
      </>
    );
  }
  return (
    <Screen back={{ label: 'Back to courses', fallback: '/courses' }} refreshing={reloading} onRefresh={refresh}>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text },
  meta: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.muted },
});
