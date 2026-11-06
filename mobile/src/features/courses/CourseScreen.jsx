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
function StaffPreview({ course }) {
  const { data, error, loading, reload } = useAsync(() => listLessons(course.id), [course.id]);
  if (loading) return <Loading />;
  if (!data) return <ErrorState message={error} onRetry={reload} />;
  return <LessonList lessons={data} />;
}

export default function CourseScreen({ id }) {
  const { profile } = useAuth();
  const { data: course, error, loading, reloading, reload } = useAsync(() => getCourse(id), [id]);

  let body;
  if (loading) body = <Loading />;
  else if (!course) body = <ErrorState message={error} onRetry={reload} />;
  else {
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        <CourseHeader course={course} />
        {isStaff(profile, course) ? <StaffPreview course={course} /> : <StudentCourseBody course={course} />}
      </>
    );
  }
  return (
    <Screen refreshing={reloading} onRefresh={reload}>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text },
  meta: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.muted },
});
