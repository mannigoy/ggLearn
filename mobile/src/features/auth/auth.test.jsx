import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateUser } from '../../lib/validate.js';
import LoginScreen from './LoginScreen';
import SignupScreen from './SignupScreen';
import PendingScreen from './PendingScreen';

jest.mock('../../context/AuthContext.jsx', () => ({ useAuth: jest.fn() }));
jest.mock('../../services/firebase.js', () => ({ auth: null, isFirebaseConfigured: false }));
jest.mock('../../lib/validate.js', () => {
  const actual = jest.requireActual('../../lib/validate.js');
  return { ...actual, validateUser: jest.fn(actual.validateUser) };
});
const mockRouter = { push: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => ({ useRouter: () => mockRouter }));

let auth;

beforeEach(() => {
  jest.clearAllMocks();
  auth = {
    user: null,
    profile: null,
    loading: false,
    notice: '',
    signIn: jest.fn().mockResolvedValue(undefined),
    signUp: jest.fn().mockResolvedValue({}),
    signOut: jest.fn().mockResolvedValue(undefined),
    refreshProfile: jest.fn().mockResolvedValue(undefined),
  };
  useAuth.mockImplementation(() => auth);
});

const type = (label, value) => fireEvent.changeText(screen.getByLabelText(label), value);

describe('LoginScreen', () => {
  it('checks the fields without calling signIn', async () => {
    await render(<LoginScreen />);
    await type('Email', 'not-an-email');
    await fireEvent.press(screen.getByLabelText('Log in'));
    expect(screen.getByText('Enter an email like name@example.com.')).toBeTruthy();
    expect(screen.getByText('Enter your password.')).toBeTruthy();
    expect(auth.signIn).not.toHaveBeenCalled();
  });

  it('signs in with a trimmed email', async () => {
    await render(<LoginScreen />);
    await type('Email', ' ana@example.com ');
    await type('Password', 'secret1');
    await fireEvent.press(screen.getByLabelText('Log in'));
    expect(auth.signIn).toHaveBeenCalledWith('ana@example.com', 'secret1');
  });

  it('shows the turned-off message when signIn rejects with auth/user-disabled', async () => {
    auth.signIn.mockRejectedValue(Object.assign(new Error('disabled'), { code: 'auth/user-disabled' }));
    await render(<LoginScreen />);
    await type('Email', 'ana@example.com');
    await type('Password', 'secret1');
    await fireEvent.press(screen.getByLabelText('Log in'));
    expect(screen.getByText('Your account is turned off. Ask your admin.')).toBeTruthy();
  });

  it('puts wrong-password errors on the password field', async () => {
    auth.signIn.mockRejectedValue(Object.assign(new Error('bad'), { code: 'auth/invalid-credential' }));
    await render(<LoginScreen />);
    await type('Email', 'ana@example.com');
    await type('Password', 'wrong1');
    await fireEvent.press(screen.getByLabelText('Log in'));
    expect(screen.getByText('Email or password is incorrect.')).toBeTruthy();
  });

  it('shows the notice above the form', async () => {
    auth.notice = 'Please log in again.';
    await render(<LoginScreen />);
    expect(screen.getByText('Please log in again.')).toBeTruthy();
  });

  it('goes to sign up', async () => {
    await render(<LoginScreen />);
    await fireEvent.press(screen.getByLabelText('Go to sign up'));
    expect(mockRouter.push).toHaveBeenCalledWith('/signup');
  });
});

describe('SignupScreen', () => {
  const fill = async () => {
    await type('Name', 'Ana');
    await type('Email', 'ana@example.com');
    await type('Password', 'secret1');
  };

  it('requires picking Student or Teacher', async () => {
    await render(<SignupScreen />);
    await fill();
    await fireEvent.press(screen.getByLabelText('Sign up'));
    expect(validateUser).toHaveBeenCalledWith(
      { name: 'Ana', email: 'ana@example.com', password: 'secret1', role: '' },
      { isNew: true },
    );
    expect(screen.getByText('Pick a role.')).toBeTruthy();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it('signs up with the picked role', async () => {
    await render(<SignupScreen />);
    await fill();
    await fireEvent.press(screen.getByLabelText('Teacher'));
    await fireEvent.press(screen.getByLabelText('Sign up'));
    expect(validateUser).toHaveBeenCalledWith(
      { name: 'Ana', email: 'ana@example.com', password: 'secret1', role: 'teacher' },
      { isNew: true },
    );
    expect(auth.signUp).toHaveBeenCalledWith({
      name: 'Ana', email: 'ana@example.com', password: 'secret1', role: 'teacher',
    });
  });

  it('shows the mapped error when signUp rejects', async () => {
    auth.signUp.mockRejectedValue(Object.assign(new Error('taken'), { code: 'auth/email-already-in-use' }));
    await render(<SignupScreen />);
    await fill();
    await fireEvent.press(screen.getByLabelText('Student'));
    await fireEvent.press(screen.getByLabelText('Sign up'));
    expect(screen.getByText('That email already has an account. Try logging in.')).toBeTruthy();
  });
});

describe('PendingScreen', () => {
  const findScrollView = (node) => {
    let current = node;
    while (current && current.type !== 'RCTScrollView') current = current.parent;
    return current;
  };

  it('shows the name and calls refreshProfile on pull-to-refresh', async () => {
    auth.profile = { uid: 'u1', name: 'Ana', email: 'ana@example.com', role: 'pending_teacher' };
    const user = userEvent.setup();
    await render(<PendingScreen />);
    expect(screen.getByText(/Ana/)).toBeTruthy();
    await user.pullToRefresh(findScrollView(screen.getByText(/Ana/)));
    expect(auth.refreshProfile).toHaveBeenCalledTimes(1);
  });

  it('logs out', async () => {
    auth.profile = { uid: 'u1', name: 'Ana', email: 'ana@example.com', role: 'pending_teacher' };
    await render(<PendingScreen />);
    await fireEvent.press(screen.getByLabelText('Log out'));
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});
