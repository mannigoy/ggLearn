import { StyleSheet, Text } from 'react-native';
import Card from '../../components/Card';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';

// Read-only. It never shows or marks correctAnswer, even if the server sent it.
export default function QuizPreview({ quiz, questions }) {
  return (
    <>
      <Card>
        <Text accessibilityRole="header" style={styles.title}>{quiz.title}</Text>
        <Text style={styles.note}>Taking quizzes is coming soon.</Text>
      </Card>
      {questions.map((q, i) => (
        <Card key={q.id}>
          <Text style={styles.question}>{`${i + 1}. ${q.questionText}`}</Text>
          {q.choices.map((c, j) => (
            <Text key={j} style={styles.choice}>{c}</Text>
          ))}
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text },
  note: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.muted, marginTop: tokens.space(2) },
  question: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.text, marginBottom: tokens.space(2) },
  choice: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text, paddingVertical: tokens.space(1) },
});
