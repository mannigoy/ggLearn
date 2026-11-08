import { useLocalSearchParams } from 'expo-router';
import CourseScreen from '../../src/features/courses/CourseScreen';

export default function CourseRoute() {
  const { id } = useLocalSearchParams();
  return <CourseScreen id={Array.isArray(id) ? id[0] : id} />;
}
