// Pure form validators. Each returns {} when valid, or { field: message }.

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const badLength = (value, min, max) => value.length < min || value.length > max;
const TITLE_MESSAGE = 'Use 2 to 120 characters.';
const GRADES = ['K', '1', '2', '3', '4', '5', '6'];
const TOPICS = ['life', 'earth', 'physical'];

function checkList(items, name) {
  const list = Array.isArray(items) ? items.map(text) : [];
  if (list.length < 1 || list.length > 30) return `Add 1 to 30 ${name}.`;
  if (list.some((item) => item.length === 0)) return `Fill in or remove empty ${name}.`;
  if (list.some((item) => item.length > 300)) return 'Keep each item under 300 characters.';
  return null;
}

export function validateCourse({ title, gradeLevel, topic }) {
  const errors = {};
  if (badLength(text(title), 2, 120)) errors.title = TITLE_MESSAGE;
  if (!GRADES.includes(gradeLevel)) errors.gradeLevel = 'Pick a grade.';
  if (!TOPICS.includes(topic)) errors.topic = 'Pick a topic.';
  return errors;
}

export function validateLesson({ title, topic, content }) {
  const errors = {};
  if (badLength(text(title), 2, 120)) errors.title = TITLE_MESSAGE;
  if (!TOPICS.includes(topic)) errors.topic = 'Pick a topic.';
  const body = text(content);
  if (body.length === 0) errors.content = 'Add the lesson content.';
  else if (body.length > 20000) errors.content = 'Keep it under 20,000 characters.';
  return errors;
}

export function validateExperiment({ title, materials, steps, safetyNotes }) {
  const errors = {};
  if (badLength(text(title), 2, 120)) errors.title = TITLE_MESSAGE;
  const materialsError = checkList(materials, 'materials');
  if (materialsError) errors.materials = materialsError;
  const stepsError = checkList(steps, 'steps');
  if (stepsError) errors.steps = stepsError;
  if (text(safetyNotes).length > 1000) errors.safetyNotes = 'Keep it under 1,000 characters.';
  return errors;
}

export function validateQuiz({ title, passingScore }, totalPoints) {
  const errors = {};
  if (badLength(text(title), 2, 120)) errors.title = TITLE_MESSAGE;
  const score = Number(passingScore);
  const max = totalPoints > 0 ? totalPoints : Infinity;
  if (passingScore === '' || passingScore == null || !Number.isInteger(score) || score < 0 || score > max) {
    errors.passingScore = totalPoints > 0 ? `Use a number from 0 to ${totalPoints}.` : 'Use a whole number, 0 or more.';
  }
  return errors;
}

export function validateQuestion({ questionText, choices, correctAnswer }) {
  const errors = {};
  if (badLength(text(questionText), 2, 500)) errors.questionText = 'Use 2 to 500 characters.';
  const list = Array.isArray(choices) ? choices.map(text) : [];
  if (list.length < 2 || list.length > 6) {
    errors.choices = 'Add 2 to 6 choices.';
  } else if (list.some((choice) => choice.length === 0)) {
    errors.choices = 'Choices can’t be empty.';
  } else if (list.some((choice) => choice.length > 200)) {
    errors.choices = 'Use up to 200 characters.';
  } else if (new Set(list.map((choice) => choice.toLowerCase())).size !== list.length) {
    errors.choices = 'Choices must be different.';
  }
  if (!list.includes(text(correctAnswer))) errors.correctAnswer = 'Pick the correct answer.';
  return errors;
}

export function validateUser({ name, email, password, role }, { isNew } = {}) {
  const errors = {};
  if (badLength(text(name), 2, 80)) errors.name = 'Use 2 to 80 characters.';
  if (isNew) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(email))) errors.email = 'Enter an email like name@example.com.';
    if (typeof password !== 'string' || password.length < 6) errors.password = 'Use at least 6 characters.';
    if (!text(role)) errors.role = 'Pick a role.';
  }
  return errors;
}
