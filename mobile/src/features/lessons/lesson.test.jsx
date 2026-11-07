import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { getCourse } from '../../services/courseApi.js';
import { listExperiments } from '../../services/experimentApi.js';
import { getLesson } from '../../services/lessonApi.js';
import { listQuizzes } from '../../services/quizApi.js';
import LessonScreen from './LessonScreen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../../context/AuthContext.jsx', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/courseApi.js', () => ({ getCourse: jest.fn() }));
jest.mock('../../services/lessonApi.js', () => ({ getLesson: jest.fn() }));
jest.mock('../../services/experimentApi.js', () => ({ listExperiments: jest.fn() }));
jest.mock('../../services/quizApi.js', () => ({ listQuizzes: jest.fn() }));

const lesson = { id: 'l1', courseId: 'c1', title: 'Rain', topic: 'earth', content: 'First part\n\nSecond part', order: 1 };
const experiments = [
  { id: 'e1', title: 'Cup test', materials: ['A cup', 'Water'], steps: ['Fill the cup', 'Wait'], safetyNotes: 'Wear goggles' },
  { id: 'e2', title: 'Jar test', materials: ['A jar'], steps: ['Open the jar'], safetyNotes: '  ' },
];
const quizzes = [{ id: 'q1', title: 'Rain quiz', passingScore: 2, totalPoints: 3 }];

const checked = (label) => screen.getByLabelText(label).props.accessibilityState.checked;

beforeEach(() => {
  jest.clearAllMocks();
  useAuth.mockReturnValue({ profile: { uid: 'u1', role: 'student' } });
  getLesson.mockResolvedValue(lesson);
  getCourse.mockResolvedValue({ id: 'c1', title: 'Weather', teacherUid: 't1' });
  listExperiments.mockResolvedValue(experiments);
  listQuizzes.mockResolvedValue(quizzes);
});

describe('LessonScreen', () => {
  it('renders the lesson paragraphs and loads by lesson id', async () => {
    await render(<LessonScreen id="l1" />);
    expect(await screen.findByText('First part')).toBeTruthy();
    expect(screen.getByText('Second part')).toBeTruthy();
    expect(screen.getByText('Rain')).toBeTruthy();
    expect(listExperiments).toHaveBeenCalledWith('l1');
    expect(getCourse).toHaveBeenCalledWith('c1');
  });

  it('shows materials and steps, and toggles a step', async () => {
    await render(<LessonScreen id="l1" />);
    expect(await screen.findByText('A cup')).toBeTruthy();
    const step = screen.getByLabelText('Step 1: Fill the cup');
    expect(step.props.accessibilityRole).toBe('checkbox');
    expect(checked('Step 1: Fill the cup')).toBe(false);
    await fireEvent.press(step);
    expect(checked('Step 1: Fill the cup')).toBe(true);
    await fireEvent.press(screen.getByLabelText('Step 1: Fill the cup'));
    expect(checked('Step 1: Fill the cup')).toBe(false);
  });

  it('keeps ticks separate per experiment', async () => {
    await render(<LessonScreen id="l1" />);
    await fireEvent.press(await screen.findByLabelText('Step 1: Fill the cup'));
    expect(checked('Step 1: Fill the cup')).toBe(true);
    expect(checked('Step 1: Open the jar')).toBe(false);
    expect(checked('Step 2: Wait')).toBe(false);
  });

  it('shows Safety first only for a non-blank note', async () => {
    await render(<LessonScreen id="l1" />);
    expect(await screen.findByText('Wear goggles')).toBeTruthy();
    expect(screen.getAllByText('Safety first')).toHaveLength(1);
  });

  it('shows the quiz row and opens the quiz', async () => {
    await render(<LessonScreen id="l1" />);
    await fireEvent.press(await screen.findByText('3 questions · pass with 2'));
    expect(router.push).toHaveBeenCalledWith('/quiz/q1');
  });

  it('uses the singular for one question', async () => {
    listQuizzes.mockResolvedValue([{ id: 'q2', title: 'Tiny', passingScore: 1, totalPoints: 1 }]);
    await render(<LessonScreen id="l1" />);
    expect(await screen.findByText('1 question · pass with 1')).toBeTruthy();
  });

  it('shows an error with Try again when loading fails', async () => {
    getLesson.mockRejectedValueOnce(new Error('Nope'));
    await render(<LessonScreen id="l1" />);
    expect(await screen.findByText('Nope')).toBeTruthy();
    await fireEvent.press(screen.getByText('Try again'));
    expect(await screen.findByText('First part')).toBeTruthy();
  });
});
