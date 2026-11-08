import { act, render, screen, waitFor } from '@testing-library/react-native';
import { myBadges } from '../../services/badgeApi.js';
import { listCourses } from '../../services/courseApi.js';
import MyBadges from './MyBadges';

const mockFocus = { cb: null };
jest.mock('expo-router', () => ({
  useFocusEffect: (cb) => {
    require('react').useEffect(() => {
      mockFocus.cb = cb;
      return cb();
    }, [cb]);
  },
}));
jest.mock('../../services/badgeApi.js', () => ({ myBadges: jest.fn() }));
jest.mock('../../services/courseApi.js', () => ({ listCourses: jest.fn() }));

const DATE = '2026-11-03T10:00:00Z';

beforeEach(() => {
  jest.clearAllMocks();
  listCourses.mockResolvedValue([{ id: 'c1', title: 'Plants' }]);
});

describe('MyBadges', () => {
  it('shows the empty state with one mascot', async () => {
    myBadges.mockResolvedValue([]);
    await render(<MyBadges />);
    expect(await screen.findByText('No badges yet. Finish a course to earn one.')).toBeTruthy();
    expect(screen.getAllByTestId('mascot')).toHaveLength(1);
  });

  it('shows title, course, formatted date and a combined label', async () => {
    myBadges.mockResolvedValue([{ id: 'b1', courseId: 'c1', title: 'Plant Expert', dateEarned: DATE }]);
    await render(<MyBadges />);
    const date = new Date(DATE).toLocaleDateString();
    expect(await screen.findByText('Plant Expert')).toBeTruthy();
    expect(screen.getByText('Plants')).toBeTruthy();
    expect(screen.getByText(date)).toBeTruthy();
    expect(screen.getByLabelText(`Badge Plant Expert, Plants, ${date}`)).toBeTruthy();
    expect(screen.queryByTestId('mascot')).toBeNull();
  });

  it('shows no date when dateEarned is null or invalid', async () => {
    myBadges.mockResolvedValue([
      { id: 'b1', courseId: 'c1', title: 'A', dateEarned: null },
      { id: 'b2', courseId: 'gone', title: 'B', dateEarned: 'nonsense' },
    ]);
    await render(<MyBadges />);
    expect(await screen.findByLabelText('Badge A, Plants')).toBeTruthy();
    expect(screen.getByLabelText('Badge B, Course removed')).toBeTruthy();
    expect(screen.queryByText(/Invalid Date/)).toBeNull();
  });

  it('reloads on a later focus but not the first, keeping badges on screen', async () => {
    myBadges.mockResolvedValue([{ id: 'b1', courseId: 'c1', title: 'Plant Expert', dateEarned: DATE }]);
    await render(<MyBadges />);
    await screen.findByText('Plant Expert');
    expect(myBadges).toHaveBeenCalledTimes(1);
    expect(listCourses).toHaveBeenCalledTimes(1);
    let finish;
    myBadges.mockReturnValue(new Promise((r) => { finish = r; }));
    await act(async () => { mockFocus.cb(); });
    await waitFor(() => expect(myBadges).toHaveBeenCalledTimes(2));
    expect(screen.getByText('Plant Expert')).toBeTruthy();
    await act(async () => finish([]));
    expect(await screen.findByText('No badges yet. Finish a course to earn one.')).toBeTruthy();
  });

  it('shows an error with Try again when loading fails', async () => {
    myBadges.mockRejectedValue(new Error('Boom'));
    await render(<MyBadges />);
    expect(await screen.findByText('Boom')).toBeTruthy();
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
