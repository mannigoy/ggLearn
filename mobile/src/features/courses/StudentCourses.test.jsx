import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { listCourses } from '../../services/courseApi.js';
import { enroll, myEnrollments } from '../../services/enrollmentApi.js';
import StudentCourses from './StudentCourses';

const mockFocus = { cb: null };
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  useFocusEffect: (cb) => {
    require('react').useEffect(() => {
      mockFocus.cb = cb;
      return cb();
    }, [cb]);
  },
}));
jest.mock('../../services/courseApi.js', () => ({ listCourses: jest.fn() }));
jest.mock('../../services/enrollmentApi.js', () => ({ myEnrollments: jest.fn(), enroll: jest.fn() }));

const courses = [
  { id: 'c1', title: 'Weather', gradeLevel: '3', topic: 'earth', teacherName: 'Ms Rivera' },
  { id: 'c2', title: 'Plants', gradeLevel: 'K', topic: 'life', teacherName: 'Mr Lee' },
];

beforeEach(() => {
  jest.clearAllMocks();
  listCourses.mockResolvedValue(courses);
  myEnrollments.mockResolvedValue([{ courseId: 'c1' }]);
  enroll.mockResolvedValue({});
});

describe('StudentCourses', () => {
  it('shows headings, grade chips in order and card details', async () => {
    await render(<StudentCourses />);
    expect(await screen.findByText('My courses')).toBeTruthy();
    expect(screen.getByText('Browse')).toBeTruthy();
    const chips = screen.getAllByRole('button', { name: /^(K|[1-6]|All)$/ });
    expect(chips.map((c) => c.props.accessibilityLabel)).toEqual(['K', '1', '2', '3', '4', '5', '6', 'All']);
    expect(screen.getByText('Grade 3')).toBeTruthy();
    expect(screen.getByText('Earth Science')).toBeTruthy();
    expect(screen.getByText('Ms Rivera')).toBeTruthy();
  });

  it('enrolls once and reloads', async () => {
    let finish;
    enroll.mockReturnValue(new Promise((r) => { finish = r; }));
    await render(<StudentCourses />);
    const btn = await screen.findByLabelText('Enroll in Plants');
    fireEvent.press(btn);
    await waitFor(() => expect(screen.getByLabelText('Enroll in Plants').props.accessibilityState.busy).toBe(true));
    fireEvent.press(screen.getByLabelText('Enroll in Plants'));
    expect(enroll).toHaveBeenCalledTimes(1);
    expect(enroll).toHaveBeenCalledWith('c2');
    myEnrollments.mockResolvedValue([{ courseId: 'c1' }, { courseId: 'c2' }]);
    await act(async () => finish({}));
    await waitFor(() => expect(myEnrollments).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByLabelText('Enroll in Plants')).toBeNull());
  });

  it('keeps every Enroll disabled until the reload after enrolling finishes', async () => {
    listCourses.mockResolvedValue([...courses, { id: 'c3', title: 'Rocks', gradeLevel: 'K', topic: 'earth', teacherName: 'Mr Lee' }]);
    await render(<StudentCourses />);
    const plants = await screen.findByLabelText('Enroll in Plants');
    let finish;
    myEnrollments.mockReturnValue(new Promise((r) => { finish = r; }));
    await fireEvent.press(plants);
    await waitFor(() => expect(enroll).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(myEnrollments).toHaveBeenCalledTimes(2));
    expect(screen.getByLabelText('Enroll in Rocks').props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(screen.getByLabelText('Enroll in Rocks'));
    expect(enroll).toHaveBeenCalledTimes(1);
    await act(async () => finish([{ courseId: 'c1' }, { courseId: 'c2' }]));
    await waitFor(() => expect(screen.getByLabelText('Enroll in Rocks').props.accessibilityState.disabled).toBe(false));
  });

  it('shows an enroll error inline on that card', async () => {
    enroll.mockRejectedValue(new Error('Course is full'));
    await render(<StudentCourses />);
    await fireEvent.press(await screen.findByLabelText('Enroll in Plants'));
    expect(await screen.findByText('Course is full')).toBeTruthy();
  });

  it('opens the course when a card is pressed', async () => {
    await render(<StudentCourses />);
    await fireEvent.press(await screen.findByLabelText('Open course Weather'));
    expect(router.push).toHaveBeenCalledWith('/course/c1');
  });

  it('shows an empty state with no enrolled courses', async () => {
    myEnrollments.mockResolvedValue([]);
    await render(<StudentCourses />);
    expect(await screen.findByText('You haven’t joined a course yet.')).toBeTruthy();
  });

  it('shows an empty state when the grade filter matches nothing', async () => {
    await render(<StudentCourses />);
    await fireEvent.press(await screen.findByLabelText('5'));
    expect(screen.getByText('No courses for this grade.')).toBeTruthy();
  });

  it('reloads on a later focus but not the first, keeping content on screen', async () => {
    await render(<StudentCourses />);
    await screen.findByText('My courses');
    expect(listCourses).toHaveBeenCalledTimes(1);
    expect(myEnrollments).toHaveBeenCalledTimes(1);
    let finish;
    listCourses.mockReturnValue(new Promise((r) => { finish = r; }));
    await act(async () => { mockFocus.cb(); });
    await waitFor(() => expect(listCourses).toHaveBeenCalledTimes(2));
    expect(screen.getByText('My courses')).toBeTruthy();
    expect(screen.getByLabelText('Open course Weather')).toBeTruthy();
    await act(async () => finish(courses));
  });

  it('shows a load error with Try again', async () => {
    listCourses.mockRejectedValueOnce(new Error('Nope'));
    await render(<StudentCourses />);
    expect(await screen.findByText('Nope')).toBeTruthy();
    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('My courses')).toBeTruthy();
  });
});
