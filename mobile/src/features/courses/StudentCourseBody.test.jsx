import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCourse } from '../../services/courseApi.js';
import { enroll, myEnrollments, unenroll } from '../../services/enrollmentApi.js';
import { listLessons } from '../../services/lessonApi.js';
import CourseScreen from './CourseScreen';
import StudentCourseBody from './StudentCourseBody';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() } }));
jest.mock('../../context/AuthContext.jsx', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/courseApi.js', () => ({ getCourse: jest.fn() }));
jest.mock('../../services/lessonApi.js', () => ({ listLessons: jest.fn() }));
jest.mock('../../services/enrollmentApi.js', () => ({
  myEnrollments: jest.fn(),
  enroll: jest.fn(),
  unenroll: jest.fn(),
}));

const course = { id: 'c1', title: 'Weather', gradeLevel: '3', topic: 'earth', teacherUid: 't1', teacherName: 'Ms Rivera' };
const lessons = [
  { id: 'l2', title: 'Clouds', topic: 'earth', order: 2 },
  { id: 'l1', title: 'Rain', topic: 'earth', order: 1 },
  { id: 'l3', title: 'Intro', topic: 'earth' },
];

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ profile: { uid: 'u1', role: 'student' } });
  getCourse.mockResolvedValue(course);
  myEnrollments.mockResolvedValue([{ courseId: 'c1' }]);
  listLessons.mockResolvedValue(lessons);
  enroll.mockResolvedValue({});
  unenroll.mockResolvedValue(null);
});

describe('StudentCourseBody', () => {
  it('lists lessons by order (missing order first) and opens one', async () => {
    await render(<StudentCourseBody course={course} />);
    const rows = await screen.findAllByLabelText(/^Open lesson /);
    expect(rows.map((r) => r.props.accessibilityLabel)).toEqual([
      'Open lesson Intro',
      'Open lesson Rain',
      'Open lesson Clouds',
    ]);
    await fireEvent.press(screen.getByLabelText('Open lesson Rain'));
    expect(router.push).toHaveBeenCalledWith('/lesson/l1');
  });

  it('asks before leaving, then unenrolls and shows the Enroll prompt', async () => {
    await render(<StudentCourseBody course={course} />);
    await fireEvent.press(await screen.findByLabelText('Leave course Weather'));
    expect(unenroll).not.toHaveBeenCalled();
    myEnrollments.mockResolvedValue([]);
    await fireEvent.press(screen.getByText('Yes'));
    await waitFor(() => expect(unenroll).toHaveBeenCalledWith('c1', 'u1'));
    expect(await screen.findByText('Enroll in this course')).toBeTruthy();
    expect(screen.queryByLabelText('Open lesson Rain')).toBeNull();
  });

  it('shows an inline error when leaving fails', async () => {
    unenroll.mockRejectedValue(new Error('Server said no'));
    await render(<StudentCourseBody course={course} />);
    await fireEvent.press(await screen.findByLabelText('Leave course Weather'));
    await fireEvent.press(screen.getByText('Yes'));
    expect(await screen.findByText('Server said no')).toBeTruthy();
  });

  it('does not load lessons until enrolled, then loads them after enrolling', async () => {
    myEnrollments.mockResolvedValue([]);
    await render(<StudentCourseBody course={course} />);
    const join = await screen.findByText('Enroll in this course');
    expect(listLessons).not.toHaveBeenCalled();
    myEnrollments.mockResolvedValue([{ courseId: 'c1' }]);
    await fireEvent.press(join);
    expect(enroll).toHaveBeenCalledWith('c1');
    expect(await screen.findByLabelText('Open lesson Rain')).toBeTruthy();
    expect(listLessons).toHaveBeenCalledWith('c1');
  });

  it('shows an inline error when enrolling fails', async () => {
    myEnrollments.mockResolvedValue([]);
    enroll.mockRejectedValue(new Error('Course is full'));
    await render(<StudentCourseBody course={course} />);
    await fireEvent.press(await screen.findByText('Enroll in this course'));
    expect(await screen.findByText('Course is full')).toBeTruthy();
  });

  it('shows a friendly empty state when the course has no lessons', async () => {
    listLessons.mockResolvedValue([]);
    await render(<StudentCourseBody course={course} />);
    expect(await screen.findByText('No lessons yet.')).toBeTruthy();
  });
});

describe('CourseScreen pull to refresh', () => {
  const pull = () => act(async () => screen.getByTestId('screen-scroll').props.refreshControl.props.onRefresh());

  it('reloads enrollment and lessons for a student while the old lessons stay visible', async () => {
    await render(<CourseScreen id="c1" />);
    await screen.findByLabelText('Open lesson Rain');
    let finish;
    listLessons.mockReturnValue(new Promise((r) => { finish = r; }));
    await pull();
    await waitFor(() => expect(listLessons).toHaveBeenCalledTimes(2));
    expect(myEnrollments).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Open lesson Rain')).toBeTruthy();
    await act(async () => finish([...lessons, { id: 'l4', title: 'Snow', order: 4 }]));
    expect(await screen.findByLabelText('Open lesson Snow')).toBeTruthy();
  });

  it('reloads the lessons for staff', async () => {
    useAuth.mockReturnValue({ profile: { uid: 't1', role: 'teacher' } });
    await render(<CourseScreen id="c1" />);
    await screen.findByLabelText('Open lesson Rain');
    await pull();
    await waitFor(() => expect(listLessons).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText('Open lesson Rain')).toBeTruthy();
  });
});

describe('CourseScreen', () => {
  it('shows the course header with title, grade and topic', async () => {
    await render(<CourseScreen id="c1" />);
    expect(await screen.findByText('Weather')).toBeTruthy();
    expect(screen.getByText('Grade 3')).toBeTruthy();
    expect(screen.getByText('Earth Science')).toBeTruthy();
  });

  it('has a Back to courses button that goes back, or to /courses when it cannot', async () => {
    router.canGoBack.mockReturnValue(true);
    await render(<CourseScreen id="c1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Back to courses' }));
    expect(router.back).toHaveBeenCalled();
    router.canGoBack.mockReturnValue(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Back to courses' }));
    expect(router.replace).toHaveBeenCalledWith('/courses');
  });

  it('shows a read-only lessons list to staff, with no Enroll or Leave', async () => {
    useAuth.mockReturnValue({ profile: { uid: 't1', role: 'teacher' } });
    await render(<CourseScreen id="c1" />);
    await fireEvent.press(await screen.findByLabelText('Open lesson Rain'));
    expect(router.push).toHaveBeenCalledWith('/lesson/l1');
    expect(screen.queryByText('Enroll in this course')).toBeNull();
    expect(screen.queryByLabelText('Leave course Weather')).toBeNull();
    expect(myEnrollments).not.toHaveBeenCalled();
  });

  it('shows a load error with Try again', async () => {
    getCourse.mockRejectedValueOnce(new Error('Nope'));
    await render(<CourseScreen id="c1" />);
    expect(await screen.findByText('Nope')).toBeTruthy();
    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('Weather')).toBeTruthy();
  });
});
