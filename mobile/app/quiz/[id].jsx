import { useLocalSearchParams } from 'expo-router';
import QuizScreen from '../../src/features/quizzes/QuizScreen';

export default function QuizRoute() {
  const { id } = useLocalSearchParams();
  return <QuizScreen id={Array.isArray(id) ? id[0] : id} />;
}
