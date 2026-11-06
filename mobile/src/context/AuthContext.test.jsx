import { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import * as authService from '../services/authService.js';
import { getMe } from '../services/profileApi.js';
import { isOfflineNow } from '../services/network.js';
import { ApiError, configureApi } from '../lib/api.js';
import { AuthProvider, useAuth } from './AuthContext';

jest.mock('../services/authService.js', () => ({
  login: jest.fn(),
  logout: jest.fn(),
  createAccount: jest.fn(),
  getIdToken: jest.fn(),
  onAuthChange: jest.fn(),
  mapAuthError: jest.fn(),
  changePassword: jest.fn(),
}));
jest.mock('../services/profileApi.js', () => ({ getMe: jest.fn(), registerMe: jest.fn(), renameMe: jest.fn() }));
jest.mock('../services/network.js', () => ({ isOfflineNow: jest.fn(), useOnline: () => true }));
jest.mock('../lib/api.js', () => {
  const actual = jest.requireActual('../lib/api.js');
  return { ...actual, configureApi: jest.fn() };
});

const USER = { uid: 'u1', email: 'ana@example.com' };
const PROFILE = { uid: 'u1', name: 'Ana', email: 'ana@example.com', role: 'student' };
const SIGN_UP = { name: 'Ana', email: USER.email, password: 'secret1', role: 'student' };

let emit;
let latest;

const capture = (value) => {
  latest = value;
};

function Probe() {
  const value = useAuth();
  useEffect(() => {
    capture(value);
  });
  return <Text>{value.loading ? 'loading' : 'ready'}</Text>;
}

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

async function mount() {
  await render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

// Firebase reports a change; act waits for the listener's async work to settle.
const fire = (user) =>
  act(async () => {
    emit(user);
  });

beforeEach(() => {
  jest.clearAllMocks();
  emit = undefined;
  authService.onAuthChange.mockImplementation((cb) => {
    emit = cb;
    return jest.fn();
  });
  authService.logout.mockImplementation(async () => emit?.(null));
  authService.login.mockResolvedValue(undefined);
});

describe('AuthProvider', () => {
  it('configures the API client once', async () => {
    await mount();
    expect(configureApi).toHaveBeenCalledTimes(1);
    const options = configureApi.mock.calls[0][0];
    expect(options.baseUrl).toBe(process.env.EXPO_PUBLIC_API_URL);
    expect(options.getToken).toBe(authService.getIdToken);
    expect(options.isOffline).toBe(isOfflineNow);
    expect(typeof options.onUnauthorized).toBe('function');
  });

  it('stays loading until the first auth state is known', async () => {
    await mount();
    expect(latest.loading).toBe(true);
    await fire(null);
    expect(latest.loading).toBe(false);
    expect(latest.user).toBeNull();
    expect(latest.profile).toBeNull();
  });

  it('reports no user when Firebase is not configured', async () => {
    authService.onAuthChange.mockImplementation((cb) => {
      cb(null);
      return () => {};
    });
    await mount();
    expect(latest.loading).toBe(false);
    expect(latest.user).toBeNull();
    expect(getMe).not.toHaveBeenCalled();
  });

  it('loads the profile with getMe on an auth change', async () => {
    getMe.mockResolvedValue(PROFILE);
    await mount();
    await fire(USER);
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(latest.user).toBe(USER);
    expect(latest.profile).toEqual(PROFILE);
    expect(latest.loading).toBe(false);
  });

  it('signs out with the no-profile notice on 404', async () => {
    getMe.mockRejectedValue(new ApiError(404, 'User not found'));
    await mount();
    await fire(USER);
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(latest.notice).toBe('Your account has no profile yet.');
    expect(latest.user).toBeNull();
    expect(latest.profile).toBeNull();
    expect(latest.loading).toBe(false);
  });

  it('signs out with the turned-off notice on 403', async () => {
    getMe.mockRejectedValue(new ApiError(403, 'Account disabled'));
    await mount();
    await fire(USER);
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(latest.notice).toBe('Your account is turned off. Ask your admin.');
    expect(latest.profile).toBeNull();
  });

  it('signs out with the error message when the profile cannot load', async () => {
    getMe.mockRejectedValue(new ApiError(0, 'Can’t reach the GG Learn server. Is the backend running?'));
    await mount();
    await fire(USER);
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(latest.notice).toBe('Can’t reach the GG Learn server. Is the backend running?');
  });

  it('skips getMe during sign up and uses the createAccount profile', async () => {
    const created = deferred();
    authService.createAccount.mockImplementation(() => {
      emit(USER); // Firebase fires before POST /me answers.
      return created.promise;
    });
    await mount();
    await fire(null);

    let pending;
    await act(async () => {
      pending = latest.signUp(SIGN_UP);
    });
    expect(getMe).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(latest.profile).toBeNull();

    await act(async () => {
      created.resolve(PROFILE);
      await pending;
    });
    expect(latest.profile).toEqual(PROFILE);
    expect(latest.user).toBe(USER);
    expect(getMe).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(authService.createAccount).toHaveBeenCalledWith(SIGN_UP);
  });

  it('leaves the user signed out when createAccount rejects, then loads profiles normally', async () => {
    const failure = Object.assign(new Error('taken'), { code: 'auth/email-already-in-use' });
    authService.createAccount.mockImplementation(async () => {
      emit(USER);
      throw failure;
    });
    await mount();
    await fire(null);

    let caught;
    await act(async () => {
      await latest.signUp(SIGN_UP).catch((e) => {
        caught = e;
      });
    });
    expect(caught).toBe(failure);
    expect(getMe).not.toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();
    expect(latest.user).toBeNull();
    expect(latest.profile).toBeNull();

    // The registering flag is cleared, so a later sign-in loads the profile.
    getMe.mockResolvedValue(PROFILE);
    await fire(USER);
    expect(getMe).toHaveBeenCalledTimes(1);
    expect(latest.profile).toEqual(PROFILE);
  });

  it('onUnauthorized signs out once with the log-in-again notice', async () => {
    getMe.mockResolvedValue(PROFILE);
    const done = deferred();
    await mount();
    await fire(USER);
    authService.logout.mockImplementation(() => done.promise.then(() => emit(null)));

    const { onUnauthorized } = configureApi.mock.calls[0][0];
    await act(async () => {
      onUnauthorized();
      onUnauthorized(); // A second 401 while the first sign-out is still running.
    });
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(latest.notice).toBe('Please log in again.');
    expect(latest.profile).toBeNull();

    await act(async () => {
      done.resolve();
      await done.promise;
    });
    expect(latest.user).toBeNull();

    // Already signed out: a stale 401 does nothing.
    await act(async () => {
      onUnauthorized();
    });
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('signIn clears the notice and calls login', async () => {
    getMe.mockRejectedValue(new ApiError(403, 'Account disabled'));
    await mount();
    await fire(USER);
    expect(latest.notice).not.toBe('');

    await act(async () => {
      await latest.signIn('ana@example.com', 'secret1');
    });
    expect(authService.login).toHaveBeenCalledWith('ana@example.com', 'secret1');
    expect(latest.notice).toBe('');
  });

  it('refreshProfile reloads the profile', async () => {
    getMe.mockResolvedValueOnce({ ...PROFILE, role: 'pending_teacher' });
    await mount();
    await fire(USER);
    expect(latest.profile.role).toBe('pending_teacher');

    getMe.mockResolvedValueOnce({ ...PROFILE, role: 'teacher' });
    await act(async () => {
      await latest.refreshProfile();
    });
    expect(latest.profile.role).toBe('teacher');
  });
});
