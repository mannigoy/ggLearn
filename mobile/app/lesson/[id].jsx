import { useLocalSearchParams } from 'expo-router';
import LessonScreen from '../../src/features/lessons/LessonScreen';

export default function LessonRoute() {
  const { id } = useLocalSearchParams();
  return <LessonScreen id={Array.isArray(id) ? id[0] : id} />;
}
