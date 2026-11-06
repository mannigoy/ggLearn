import { routeFor } from './routeFor';

describe('routeFor', () => {
  it('sends a missing profile to the auth screens', () => {
    expect(routeFor(null)).toBe('auth');
  });

  it('sends a pending teacher to the pending screen', () => {
    expect(routeFor({ role: 'pending_teacher' })).toBe('pending');
  });

  it.each(['student', 'teacher', 'admin'])('sends %s to the tabs', (role) => {
    expect(routeFor({ role })).toBe('tabs');
  });
});
