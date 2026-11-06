import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { registerMe } from './profileApi.js';
import { createAccount, getIdToken, login, logout, mapAuthError, onAuthChange } from './authService.js';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  updatePassword: jest.fn(),
  EmailAuthProvider: { credential: jest.fn() }
}));
const mockFirebase = { auth: null };
jest.mock('./firebase.js', () => ({
  __esModule: true,
  get auth() {
    return mockFirebase.auth;
  },
  isFirebaseConfigured: true
}));
jest.mock('./profileApi.js', () => ({ registerMe: jest.fn() }));

const input = { name: 'Ana', email: 'a@b.co', password: 'secret1', role: 'student' };

beforeEach(() => {
  jest.clearAllMocks();
  mockFirebase.auth = { currentUser: null };
});

describe('mapAuthError', () => {
  it.each([
    ['auth/invalid-email', { email: 'Enter an email like name@example.com.' }],
    ['auth/email-already-in-use', { email: 'That email already has an account. Try logging in.' }],
    ['auth/weak-password', { password: 'Use at least 6 characters.' }],
    ['auth/invalid-credential', { password: 'Email or password is incorrect.' }],
    ['auth/wrong-password', { password: 'Email or password is incorrect.' }],
    ['auth/user-not-found', { password: 'Email or password is incorrect.' }],
    ['auth/user-disabled', { form: 'Your account is turned off. Ask your admin.' }],
    ['auth/too-many-requests', { form: 'Too many attempts. Wait a moment and try again.' }],
    ['auth/network-request-failed', { form: 'Can’t reach the server. Check your connection.' }],
    ['app/not-configured', { form: 'Accounts aren’t set up yet. Add the Firebase settings to mobile/.env.' }],
    ['app/invalid-role', { form: 'Pick student or teacher.' }],
    ['other', { form: 'Something went wrong. Please try again.' }]
  ])('%s', (code, expected) => {
    expect(mapAuthError({ code })).toEqual(expected);
  });

  it('handles a missing error', () => {
    expect(mapAuthError(undefined)).toEqual({ form: 'Something went wrong. Please try again.' });
  });
});

describe('createAccount', () => {
  it('creates the user, registers the profile and returns it', async () => {
    const user = { delete: jest.fn() };
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    registerMe.mockResolvedValue({ uid: 'u1', name: 'Ana', role: 'student' });
    await expect(createAccount(input)).resolves.toEqual({ uid: 'u1', name: 'Ana', role: 'student' });
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'a@b.co', 'secret1');
    expect(registerMe).toHaveBeenCalledWith({ name: 'Ana', role: 'student' });
    expect(user.delete).not.toHaveBeenCalled();
  });

  it('deletes the Firebase user and rethrows when registerMe fails', async () => {
    const user = { delete: jest.fn().mockResolvedValue() };
    const failure = new Error('boom');
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    registerMe.mockRejectedValue(failure);
    await expect(createAccount(input)).rejects.toBe(failure);
    expect(user.delete).toHaveBeenCalledTimes(1);
    expect(signOut).not.toHaveBeenCalled();
  });

  it('signs out when deleting the user also fails', async () => {
    const user = { delete: jest.fn().mockRejectedValue(new Error('no')) };
    const failure = new Error('boom');
    createUserWithEmailAndPassword.mockResolvedValue({ user });
    registerMe.mockRejectedValue(failure);
    signOut.mockResolvedValue();
    await expect(createAccount(input)).rejects.toBe(failure);
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('login / logout', () => {
  it('login signs in with Firebase', async () => {
    signInWithEmailAndPassword.mockResolvedValue({});
    await login('a@b.co', 'pw');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'a@b.co', 'pw');
  });

  it('logout signs out', async () => {
    signOut.mockResolvedValue();
    await logout();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});

describe('getIdToken / onAuthChange', () => {
  it('resolves null when nobody is signed in', async () => {
    await expect(getIdToken()).resolves.toBeNull();
  });

  it('resolves the current user token', async () => {
    mockFirebase.auth = { currentUser: { getIdToken: jest.fn().mockResolvedValue('tok') } };
    await expect(getIdToken()).resolves.toBe('tok');
  });

  it('onAuthChange returns the unsubscribe from Firebase', () => {
    const unsub = jest.fn();
    onAuthStateChanged.mockReturnValue(unsub);
    const cb = jest.fn();
    expect(onAuthChange(cb)).toBe(unsub);
    expect(onAuthStateChanged).toHaveBeenCalledWith(expect.anything(), cb);
  });
});

describe('when Firebase is not configured', () => {
  beforeEach(() => {
    mockFirebase.auth = null;
  });

  it('login throws app/not-configured', async () => {
    await expect(login('a@b.co', 'pw')).rejects.toMatchObject({ code: 'app/not-configured' });
  });

  it('createAccount throws app/not-configured', async () => {
    await expect(createAccount(input)).rejects.toMatchObject({ code: 'app/not-configured' });
  });

  it('getIdToken is null and onAuthChange reports no user', async () => {
    await expect(getIdToken()).resolves.toBeNull();
    const cb = jest.fn();
    const unsub = onAuthChange(cb);
    expect(cb).toHaveBeenCalledWith(null);
    expect(typeof unsub).toBe('function');
  });
});
