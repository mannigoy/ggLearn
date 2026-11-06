import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import { TOPICS } from '../../lib/constants.js';

export default function CourseCard({ course, onPress, action }) {
  return (
    <Card>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open course ${course.title}`}
        onPress={onPress}
        style={styles.press}
      >
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.meta}>{`Grade ${course.gradeLevel}`}</Text>
        <Text style={styles.meta}>{TOPICS[course.topic] || course.topic}</Text>
        {course.teacherName ? <Text style={styles.meta}>{course.teacherName}</Text> : null}
      </Pressable>
      {action ? <View style={styles.action}>{action}</View> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  press: { minHeight: tokens.minTouch, gap: tokens.space(1) },
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
  meta: { fontFamily: fonts.body, fontSize: tokens.type.small, color: tokens.colors.muted },
  action: { marginTop: tokens.space(3), gap: tokens.space(2), alignItems: 'flex-start' },
});
