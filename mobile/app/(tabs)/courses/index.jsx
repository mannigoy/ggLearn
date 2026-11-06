import Placeholder from '../../../src/features/me/Placeholder';
import StudentCourses from '../../../src/features/courses/StudentCourses';
import { useAuth } from '../../../src/context/AuthContext';
import { ROLES } from '../../../src/lib/constants';

export default function CoursesTab() {
  const { profile } = useAuth();
  if (profile?.role === ROLES.STUDENT) return <StudentCourses />;
  return <Placeholder title="Courses" />;
}
