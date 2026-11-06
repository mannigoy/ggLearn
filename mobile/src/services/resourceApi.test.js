import { apiFetch } from '../lib/api.js';
import * as course from './courseApi.js';
import * as lesson from './lessonApi.js';
import * as experiment from './experimentApi.js';
import * as quiz from './quizApi.js';
import * as question from './questionApi.js';
import * as enrollment from './enrollmentApi.js';
import * as badge from './badgeApi.js';
import * as profile from './profileApi.js';
import { listTeachers } from './teacherApi.js';

jest.mock('../lib/api.js', () => ({ apiFetch: jest.fn() }));

const body = { a: 1 };

beforeEach(() => {
  apiFetch.mockReset();
  apiFetch.mockResolvedValue('ok');
});

describe.each([
  ['listCourses()', () => course.listCourses(), ['/courses']],
  ['listCourses({mine})', () => course.listCourses({ mine: true }), ['/courses?mine=true']],
  ['getCourse', () => course.getCourse('a/b'), ['/courses/a%2Fb']],
  ['createCourse', () => course.createCourse(body), ['/courses', { method: 'POST', body }]],
  ['updateCourse', () => course.updateCourse('c1', body), ['/courses/c1', { method: 'PUT', body }]],
  ['deleteCourse', () => course.deleteCourse('c1'), ['/courses/c1', { method: 'DELETE' }]],

  ['listLessons', () => lesson.listLessons('c1'), ['/courses/c1/lessons']],
  ['getLesson', () => lesson.getLesson('l1'), ['/lessons/l1']],
  ['createLesson', () => lesson.createLesson('c1', body), ['/courses/c1/lessons', { method: 'POST', body }]],
  ['updateLesson', () => lesson.updateLesson('l1', body), ['/lessons/l1', { method: 'PUT', body }]],
  ['deleteLesson', () => lesson.deleteLesson('l1'), ['/lessons/l1', { method: 'DELETE' }]],

  ['listExperiments', () => experiment.listExperiments('l1'), ['/lessons/l1/experiments']],
  ['createExperiment', () => experiment.createExperiment('l1', body), ['/lessons/l1/experiments', { method: 'POST', body }]],
  ['updateExperiment', () => experiment.updateExperiment('e1', body), ['/experiments/e1', { method: 'PUT', body }]],
  ['deleteExperiment', () => experiment.deleteExperiment('e1'), ['/experiments/e1', { method: 'DELETE' }]],

  ['listQuizzes', () => quiz.listQuizzes('l1'), ['/lessons/l1/quizzes']],
  ['getQuiz', () => quiz.getQuiz('q1'), ['/quizzes/q1']],
  ['createQuiz', () => quiz.createQuiz('l1', body), ['/lessons/l1/quizzes', { method: 'POST', body }]],
  ['updateQuiz', () => quiz.updateQuiz('q1', body), ['/quizzes/q1', { method: 'PUT', body }]],
  ['deleteQuiz', () => quiz.deleteQuiz('q1'), ['/quizzes/q1', { method: 'DELETE' }]],

  ['listQuestions', () => question.listQuestions('q1'), ['/quizzes/q1/questions']],
  ['createQuestion', () => question.createQuestion('q1', body), ['/quizzes/q1/questions', { method: 'POST', body }]],
  ['updateQuestion', () => question.updateQuestion('x1', body), ['/questions/x1', { method: 'PUT', body }]],
  ['deleteQuestion', () => question.deleteQuestion('x1'), ['/questions/x1', { method: 'DELETE' }]],

  ['listRoster', () => enrollment.listRoster('c1'), ['/courses/c1/enrollments']],
  ['enroll self', () => enrollment.enroll('c1'), ['/courses/c1/enrollments', { method: 'POST', body: undefined }]],
  [
    'enroll student',
    () => enrollment.enroll('c1', 's1'),
    ['/courses/c1/enrollments', { method: 'POST', body: { studentUid: 's1' } }]
  ],
  ['unenroll', () => enrollment.unenroll('c1', 's/1'), ['/courses/c1/enrollments/s%2F1', { method: 'DELETE' }]],
  ['myEnrollments', () => enrollment.myEnrollments(), ['/me/enrollments']],
  ['listStudents', () => enrollment.listStudents(), ['/students']],

  ['listCourseBadges', () => badge.listCourseBadges('c 1'), ['/badges?courseId=c%201']],
  ['myBadges', () => badge.myBadges(), ['/me/badges']],
  ['awardBadge', () => badge.awardBadge(body), ['/badges', { method: 'POST', body }]],
  ['renameBadge', () => badge.renameBadge('b1', body), ['/badges/b1', { method: 'PUT', body }]],
  ['revokeBadge', () => badge.revokeBadge('b1'), ['/badges/b1', { method: 'DELETE' }]],

  ['getMe', () => profile.getMe(), ['/me']],
  ['registerMe', () => profile.registerMe(body), ['/me', { method: 'POST', body }]],
  ['renameMe', () => profile.renameMe(body), ['/me', { method: 'PUT', body }]]
])('%s', (_name, call, expected) => {
  it('calls apiFetch with the exact path and options', async () => {
    await expect(call()).resolves.toBe('ok');
    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch.mock.calls[0]).toEqual(expected);
  });
});

it('enroll without a student sends no body', async () => {
  await enrollment.enroll('c1');
  expect(apiFetch.mock.calls[0][1].body).toBeUndefined();
});

describe('listTeachers', () => {
  it('reads /users and keeps only teachers', async () => {
    apiFetch.mockResolvedValue([
      { uid: 'a', role: 'teacher' },
      { uid: 'b', role: 'student' },
      { uid: 'c', role: 'admin' },
      { uid: 'd', role: 'teacher' }
    ]);
    const result = await listTeachers();
    expect(apiFetch).toHaveBeenCalledWith('/users');
    expect(result.map((u) => u.uid)).toEqual(['a', 'd']);
  });
});
