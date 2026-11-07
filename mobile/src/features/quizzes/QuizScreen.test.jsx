import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { listQuestions } from '../../services/questionApi.js';
import { getQuiz } from '../../services/quizApi.js';
import QuizScreen from './QuizScreen';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), replace: jest.fn(), canGoBack: jest.fn() } }));
jest.mock('../../services/questionApi.js', () => ({ listQuestions: jest.fn() }));
jest.mock('../../services/quizApi.js', () => ({ getQuiz: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  getQuiz.mockResolvedValue({ id: 'q1', lessonId: 'l1', title: 'Rain quiz', passingScore: 2, totalPoints: 3 });
  listQuestions.mockResolvedValue([]);
});

describe('QuizScreen back button', () => {
  it('goes back to the lesson when possible', async () => {
    router.canGoBack.mockReturnValue(true);
    await render(<QuizScreen id="q1" />);
    await fireEvent.press(await screen.findByRole('button', { name: 'Back to lesson' }));
    expect(router.back).toHaveBeenCalled();
  });

  it('falls back to the lesson route once the quiz has loaded', async () => {
    router.canGoBack.mockReturnValue(false);
    await render(<QuizScreen id="q1" />);
    await screen.findByText('Rain quiz');
    await fireEvent.press(screen.getByRole('button', { name: 'Back to lesson' }));
    expect(router.replace).toHaveBeenCalledWith('/lesson/l1');
  });
});
