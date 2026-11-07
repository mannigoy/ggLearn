import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import { Empty, ErrorState, Loading } from '../../components/States';
import { useAsync } from '../../lib/useAsync.js';
import { useReloadOnFocus } from '../../lib/useReloadOnFocus.js';
import { GRADES } from '../../lib/constants.js';
import { listCourses } from '../../services/courseApi.js';
import { enroll, myEnrollments } from '../../services/enrollmentApi.js';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import CourseCard from './CourseCard';
import { splitCourses } from './joinCourses.js';

const load = () => Promise.all([listCourses(), myEnrollments()]);

export default function StudentCourses() {
  const { data, error, loading, reloading, reload } = useAsync(load, []);
  useReloadOnFocus(reload);
  const [grade, setGrade] = useState('All');
  const [busyId, setBusyId] = useState(null);
  const [errors, setErrors] = useState({});

  const join = async (id) => {
    if (busyId) return;
    setBusyId(id);
    setErrors((e) => ({ ...e, [id]: null }));
    try {
      await enroll(id);
      reload();
    } catch (err) {
      setErrors((e) => ({ ...e, [id]: err?.message || 'Could not join. Please try again.' }));
    } finally {
      setBusyId(null);
    }
  };

  const open = (id) => router.push('/course/' + id);

  let body;
  if (loading) body = <Loading />;
  else if (!data) body = <ErrorState message={error} onRetry={reload} />;
  else {
    const { mine, others } = splitCourses(data[0], data[1], grade);
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        <Text accessibilityRole="header" style={styles.heading}>My courses</Text>
        {mine.length === 0 ? (
          <Empty title="You haven’t joined a course yet.">Pick one below to start.</Empty>
        ) : (
          mine.map((c) => <CourseCard key={c.id} course={c} onPress={() => open(c.id)} />)
        )}
        <Text accessibilityRole="header" style={styles.heading}>Browse</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Filter by grade" style={styles.chips}>
          {[...GRADES, 'All'].map((g) => (
            <Chip
              key={g}
              role="radio"
              label={g}
              accessibilityLabel={g === 'All' ? 'All grades' : `Grade ${g}`}
              selected={grade === g}
              onPress={() => setGrade(g)}
            />
          ))}
        </View>
        {others.length === 0 ? (
          <Empty title={grade === 'All' ? 'No more courses to join.' : 'No courses for this grade.'} />
        ) : (
          others.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onPress={() => open(c.id)}
              action={
                <>
                  <Button
                    small
                    label="Enroll"
                    accessibilityLabel={`Enroll in ${c.title}`}
                    busy={busyId === c.id}
                    disabled={!!busyId || reloading}
                    onPress={() => join(c.id)}
                  />
                  {errors[c.id] ? (
                    <Text accessibilityRole="alert" style={styles.err}>{errors[c.id]}</Text>
                  ) : null}
                </>
              }
            />
          ))
        )}
      </>
    );
  }

  return (
    <Screen title="Courses" refreshing={reloading} onRefresh={reload}>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text, marginVertical: tokens.space(3) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space(2), marginBottom: tokens.space(4) },
  err: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.coralDark },
});
