import { isStaff } from './roles.js';

const course = { teacherUid: 't1' };

describe('isStaff', () => {
  it('treats an admin as staff on any course', () => {
    expect(isStaff({ uid: 'a1', role: 'admin' }, course)).toBe(true);
  });
  it('treats the owner teacher as staff', () => {
    expect(isStaff({ uid: 't1', role: 'teacher' }, course)).toBe(true);
  });
  it('does not treat another teacher as staff', () => {
    expect(isStaff({ uid: 't2', role: 'teacher' }, course)).toBe(false);
  });
  it('does not treat a student as staff', () => {
    expect(isStaff({ uid: 's1', role: 'student' }, course)).toBe(false);
  });
});
