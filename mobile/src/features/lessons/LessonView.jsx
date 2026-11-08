import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { TOPICS } from '../../lib/constants.js';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import ExperimentCard from './ExperimentCard';
import { toParagraphs } from './paragraphs.js';

export const quizSummary = ({ totalPoints, passingScore }) =>
  `${totalPoints} ${totalPoints === 1 ? 'question' : 'questions'} · pass with ${passingScore}`;

// `staff` is accepted for the staff controls added later; the student view ignores it.
export default function LessonView({ bundle, onOpenQuiz, footer }) {
  const { lesson, courseTitle, experiments = [], quizzes = [] } = bundle;
  return (
    <>
      <Card>
        <Text style={styles.meta}>{courseTitle}</Text>
        <Text accessibilityRole="header" style={styles.title}>{lesson.title}</Text>
        <Text style={styles.meta}>{TOPICS[lesson.topic] || lesson.topic}</Text>
        {toParagraphs(lesson.content).map((p, i) => (
          <Text key={i} style={styles.para}>{p}</Text>
        ))}
      </Card>
      {experiments.map((e) => (
        <ExperimentCard key={e.id} experiment={e} />
      ))}
      {quizzes.map((q) => (
        <Card key={q.id}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open quiz ${q.title}`}
            onPress={() => onOpenQuiz(q.id)}
            style={styles.quiz}
          >
            <Icon name="quiz" color={tokens.colors.sun} size={36} />
            <View style={styles.quizText}>
              <Text style={styles.quizTitle}>{q.title}</Text>
              <Text style={styles.meta}>{quizSummary(q)}</Text>
            </View>
          </Pressable>
        </Card>
      ))}
      {footer}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text },
  meta: { fontFamily: fonts.body, fontSize: tokens.type.small, color: tokens.colors.muted },
  para: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text, marginTop: tokens.space(3), lineHeight: 28 },
  quiz: { minHeight: tokens.minTouch, flexDirection: 'row', alignItems: 'center', gap: tokens.space(3) },
  quizText: { flex: 1 },
  quizTitle: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
});
