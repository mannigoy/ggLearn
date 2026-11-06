import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { changePassword } from '../../services/authService.js';
import MeScreen from './MeScreen';

jest.mock('../../context/AuthContext.jsx', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/firebase.js', () => ({ auth: null, isFirebaseConfigured: false }));
jest.mock('../../services/authService.js', () => {
  const actual = jest.requireActual('../../services/authService.js');
  return { ...actual, changePassword: jest.fn() };
});

let auth;
const setProfile = (role) => {
  auth = { profile: { uid: 'u1', name: 'Ana Cruz', email: 'ana@example.com', role }, signOut: jest.fn() };
  useAuth.mockImplementation(() => auth);
};

beforeEach(() => {
  jest.clearAllMocks();
  changePassword.mockResolvedValue(undefined);
  setProfile('student');
});

const type = (label, value) => fireEvent.changeText(screen.getByLabelText(label), value);
const fill = async (current, next, confirm = next) => {
  await type('Current password', current);
  await type('New password', next);
  await type('Confirm new password', confirm);
};

describe('MeScreen', () => {
  it('shows the name and the role label', async () => {
    await render(<MeScreen />);
    expect(screen.getByText('Ana Cruz')).toBeTruthy();
    expect(screen.getByText('Student')).toBeTruthy();
  });

  it('shows the admin note to admins', async () => {
    setProfile('admin');
    await render(<MeScreen />);
    expect(screen.getByText('Manage users on the GG Learn website.')).toBeTruthy();
  });

  it('hides the admin note from students', async () => {
    await render(<MeScreen />);
    expect(screen.queryByText('Manage users on the GG Learn website.')).toBeNull();
  });

  it('requires at least 6 characters for the new password', async () => {
    await render(<MeScreen />);
    await fill('oldpass', 'abc');
    await fireEvent.press(screen.getByLabelText('Change password'));
    expect(screen.getByText('Use at least 6 characters.')).toBeTruthy();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('changes the password and confirms', async () => {
    await render(<MeScreen />);
    await fill('oldpass', 'newpass1');
    await fireEvent.press(screen.getByLabelText('Change password'));
    await waitFor(() => expect(screen.getByText('Password changed.')).toBeTruthy());
    expect(changePassword).toHaveBeenCalledWith('oldpass', 'newpass1');
  });

  it('maps a wrong current password to the current-password field', async () => {
    changePassword.mockRejectedValue({ code: 'auth/invalid-credential' });
    await render(<MeScreen />);
    await fill('wrong', 'newpass1');
    await fireEvent.press(screen.getByLabelText('Change password'));
    await waitFor(() => expect(screen.getByText('Email or password is incorrect.')).toBeTruthy());
    expect(screen.queryByText('Password changed.')).toBeNull();
  });

  it('logs out', async () => {
    await render(<MeScreen />);
    await fireEvent.press(screen.getByLabelText('Log out'));
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
