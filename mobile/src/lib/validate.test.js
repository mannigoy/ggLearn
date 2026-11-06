import {
  validateCourse,
  validateExperiment,
  validateLesson,
  validateQuestion,
  validateQuiz,
  validateUser
} from './validate.js';

describe('validateCourse', () => {
  it('accepts a valid course', () => {
    expect(validateCourse({ title: 'Plants', gradeLevel: '3', topic: 'life' })).toEqual({});
  });
  it('rejects a blank title, missing grade and topic', () => {
    expect(validateCourse({ title: '   ', gradeLevel: '', topic: '' })).toEqual({
      title: 'Use 2 to 120 characters.',
      gradeLevel: 'Pick a grade.',
      topic: 'Pick a topic.'
    });
  });
  it('rejects a title over 120 characters', () => {
    expect(validateCourse({ title: 'a'.repeat(121), gradeLevel: 'K', topic: 'earth' }).title).toBe(
      'Use 2 to 120 characters.'
    );
  });
});

describe('validateLesson', () => {
  it('accepts a valid lesson', () => {
    expect(validateLesson({ title: 'Roots', topic: 'life', content: 'Roots drink water.' })).toEqual({});
  });
  it('rejects empty and oversized content', () => {
    expect(validateLesson({ title: 'Roots', topic: 'life', content: '  ' }).content).toBe('Add the lesson content.');
    expect(validateLesson({ title: 'Roots', topic: 'life', content: 'x'.repeat(20001) }).content).toBe(
      'Keep it under 20,000 characters.'
    );
  });
});

describe('validateExperiment', () => {
  const ok = { title: 'Bean jar', materials: ['jar'], steps: ['fill'], safetyNotes: '' };
  it('accepts a valid experiment', () => {
    expect(validateExperiment(ok)).toEqual({});
  });
  it('rejects 31 materials', () => {
    const materials = Array.from({ length: 31 }, (_, i) => `m${i}`);
    expect(validateExperiment({ ...ok, materials }).materials).toBe('Add 1 to 30 materials.');
  });
  it('rejects no steps and over-long items', () => {
    expect(validateExperiment({ ...ok, steps: [] }).steps).toBe('Add 1 to 30 steps.');
    expect(validateExperiment({ ...ok, steps: ['x'.repeat(301)] }).steps).toBe(
      'Keep each item under 300 characters.'
    );
  });
});

describe('validateQuiz', () => {
  it('accepts a passing score within the total', () => {
    expect(validateQuiz({ title: 'Quiz', passingScore: 3 }, 5)).toEqual({});
  });
  it('rejects a score above the total or negative', () => {
    expect(validateQuiz({ title: 'Quiz', passingScore: 6 }, 5).passingScore).toBe('Use a number from 0 to 5.');
    expect(validateQuiz({ title: 'Quiz', passingScore: -1 }, 5).passingScore).toBe('Use a number from 0 to 5.');
  });
  it('does not cap the score when there are no points yet', () => {
    expect(validateQuiz({ title: 'Quiz', passingScore: 10 }, 0)).toEqual({});
  });
});

describe('validateQuestion', () => {
  const ok = { questionText: 'What do roots do?', choices: ['Drink', 'Fly'], correctAnswer: 'Drink' };
  it('accepts a valid question', () => {
    expect(validateQuestion(ok)).toEqual({});
  });
  it('rejects duplicate choices case-insensitively', () => {
    expect(validateQuestion({ ...ok, choices: ['Drink', 'drink'] }).choices).toBe('Choices must be different.');
  });
  it('rejects too few choices and empty choices', () => {
    expect(validateQuestion({ ...ok, choices: ['Drink'] }).choices).toBe('Add 2 to 6 choices.');
    expect(validateQuestion({ ...ok, choices: ['Drink', '  '] }).choices).toBe('Choices can’t be empty.');
  });
  it('requires the correct answer to be one of the choices', () => {
    expect(validateQuestion({ ...ok, correctAnswer: '' }).correctAnswer).toBe('Pick the correct answer.');
    expect(validateQuestion({ ...ok, correctAnswer: 'Swim' }).correctAnswer).toBe('Pick the correct answer.');
  });
});

describe('validateUser', () => {
  const ok = { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret1', role: 'teacher' };
  it('accepts a valid new user', () => {
    expect(validateUser(ok, { isNew: true })).toEqual({});
  });
  it('rejects bad fields for a new user', () => {
    const errors = validateUser({ name: 'A', email: 'nope', password: '123', role: '' }, { isNew: true });
    expect(Object.keys(errors).sort()).toEqual(['email', 'name', 'password', 'role']);
  });
  it('does not require email or password when editing', () => {
    expect(validateUser({ name: 'Ada Lovelace' }, { isNew: false })).toEqual({});
  });
});
