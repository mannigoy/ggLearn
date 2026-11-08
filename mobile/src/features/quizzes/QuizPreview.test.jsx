import { render, screen } from '@testing-library/react-native';
import { getQuiz } from '../../services/quizApi.js';
import { listQuestions } from '../../services/questionApi.js';
import QuizPreview from './QuizPreview';
import QuizScreen from './QuizScreen';

jest.mock('../../services/quizApi.js', () => ({ getQuiz: jest.fn() }));
jest.mock('../../services/questionApi.js', () => ({ listQuestions: jest.fn() }));

const quiz = { id: 'q1', title: 'Rain quiz', passingScore: 2, totalPoints: 2 };
const questions = [
  { id: 'a', questionText: 'What falls?', choices: ['Rain', 'Rocks'], correctAnswer: 'Rain', order: 1 },
  { id: 'b', questionText: 'Where from?', choices: ['Clouds', 'Floor'], correctAnswer: 'Clouds', order: 2 },
];

describe('QuizPreview', () => {
  it('shows questions and choices, nothing selectable', async () => {
    await render(<QuizPreview quiz={quiz} questions={questions} />);
    expect(screen.getByText('1. What falls?')).toBeTruthy();
    expect(screen.getByText('Rocks')).toBeTruthy();
    expect(screen.getByText('Taking quizzes is coming soon.')).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('never marks or shows the correct answer, even when the server sent it', async () => {
    await render(<QuizPreview quiz={quiz} questions={questions} />);
    expect(screen.queryByText(/correct/i)).toBeNull();
    expect(screen.queryByLabelText(/correct/i)).toBeNull();
    // Each choice text appears exactly once: no extra answer line.
    expect(screen.getAllByText('Rain')).toHaveLength(1);
    expect(screen.getAllByText('Clouds')).toHaveLength(1);
    // Correct and wrong choices look the same to assistive tech.
    expect(screen.getByText('Rain').props.accessibilityState).toEqual(screen.getByText('Rocks').props.accessibilityState);
  });
});

describe('QuizScreen', () => {
  it('loads the quiz and its questions, in order', async () => {
    getQuiz.mockResolvedValue(quiz);
    listQuestions.mockResolvedValue([questions[1], questions[0]]);
    await render(<QuizScreen id="q1" />);
    expect(await screen.findByText('Rain quiz')).toBeTruthy();
    expect(getQuiz).toHaveBeenCalledWith('q1');
    expect(listQuestions).toHaveBeenCalledWith('q1');
    const shown = screen.getAllByText(/^\d+\. /).map((n) => n.props.children);
    expect(shown).toEqual(['1. What falls?', '2. Where from?']);
  });
});
