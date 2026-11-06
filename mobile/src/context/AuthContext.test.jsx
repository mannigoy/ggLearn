import { useEffect } from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const CACHE_KEY = 'gglearn:profile:u1';
const OFFLINE = 'You’re offline. Check your internet and try again.';
const cached = async () => {
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  return raw ? JSON.parse(raw) : null;
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
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

  it('caches the profile after getMe', async () => {
    getMe.mockResolvedValue(PROFILE);
    await mount();
    await fire(USER);
    expect(await cached()).toEqual(PROFILE);
  });

  it('uses the cached profile when getMe fails offline, and stays signed in', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(PROFILE));
    getMe.mockRejectedValue(new ApiError(0, OFFLINE));
    await mount();
    await fire(USER);
    expect(authService.logout).not.toHaveBeenCalled();
    expect(latest.user).toBe(USER);
    expect(latest.profile).toEqual(PROFILE);
    expect(latest.profileError).toBe('');
    expect(latest.notice).toBe('');
    expect(latest.loading).toBe(false);
  });

  it('keeps the user signed in with profileError when getMe fails and nothing is cached', async () => {
    getMe.mockRejectedValue(new ApiError(503, 'Something went wrong. Please try again.'));
    await mount();
    await fire(USER);
    expect(authService.logout).not.toHaveBeenCalled();
    expect(latest.user).toBe(USER);
    expect(latest.profile).toBeNull();
    expect(latest.profileError).toBe('Something went wrong. Please try again.');
    expect(latest.loading).toBe(false);
  });

  it('treats corrupt cache JSON as no cache', async () => {
    await AsyncStorage.setItem(CACHE_KEY, '{not json');
    getMe.mockRejectedValue(new ApiError(0, OFFLINE));
    await mount();
    await fire(USER);
    expect(authService.logout).not.toHaveBeenCalled();
    expect(latest.profile).toBeNull();
    expect(latest.profileError).toBe(OFFLINE);
  });

  it('refreshProfile success clears profileError and caches the profile', async () => {
    getMe.mockRejectedValueOnce(new ApiError(0, OFFLINE));
    await mount();
    await fire(USER);
    expect(latest.profileError).toBe(OFFLINE);

    getMe.mockResolvedValueOnce(PROFILE);
    await act(async () => {
      await latest.refreshProfile();
    });
    expect(latest.profileError).toBe('');
    expect(latest.profile).toEqual(PROFILE);
    expect(await cached()).toEqual(PROFILE);
  });

  it('refreshProfile failure updates profileError and rethrows', async () => {
    getMe.mockRejectedValueOnce(new ApiError(0, OFFLINE));
    await mount();
    await fire(USER);

    const failure = new ApiError(500, 'Server broke.');
    getMe.mockRejectedValueOnce(failure);
    let caught;
    await act(async () => {
      await latest.refreshProfile().catch((e) => {
        caught = e;
      });
    });
    expect(caught).toBe(failure);
    expect(latest.profileError).toBe('Server broke.');
    expect(authService.logout).not.toHaveBeenCalled();
  });

  it('signOut clears the cached profile', async () => {
    getMe.mockResolvedValue(PROFILE);
    await mount();
    await fire(USER);
    expect(await cached()).toEqual(PROFILE);

    await act(async () => {
      await latest.signOut();
    });
    expect(await cached()).toBeNull();
    expect(latest.user).toBeNull();
    expect(latest.profile).toBeNull();
  });

  it('a 404 still signs out even when a profile is cached', async () => {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(PROFILE));
    getMe.mockRejectedValue(new ApiError(404, 'User not found'));
    await mount();
    await fire(USER);
    expect(authService.logout).toHaveBeenCalledTimes(1);
    expect(latest.notice).toBe('Your account has no profile yet.');
    expect(latest.profile).toBeNull();
    expect(await cached()).toBeNull();
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
    expect(await cached()).toEqual(PROFILE);
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

  describe('stale profile loads', () => {
    it('drops a getMe result that lands after signOut started', async () => {
      const me = deferred();
      getMe.mockReturnValue(me.promise);
      await mount();
      await fire(USER);
      expect(getMe).toHaveBeenCalledTimes(1);

      await act(async () => {
        await latest.signOut();
      });
      await act(async () => {
        me.resolve(PROFILE);
        await me.promise;
      });
      expect(latest.profile).toBeNull();
      expect(latest.user).toBeNull();
      expect(await cached()).toBeNull();
    });

    it('ignores a 403 that lands after the user signed out', async () => {
      const me = deferred();
      getMe.mockReturnValue(me.promise);
      await mount();
      await fire(USER);
      await fire(null);

      await act(async () => {
        me.reject(new ApiError(403, 'Account disabled'));
        await me.promise.catch(() => {});
      });
      expect(latest.notice).toBe('');
      expect(authService.logout).not.toHaveBeenCalled();
      expect(latest.user).toBeNull();
    });

    it('keeps user B when user A’s getMe answers late', async () => {
      const first = deferred();
      const USER_B = { uid: 'u2', email: 'ben@example.com' };
      const PROFILE_B = { uid: 'u2', name: 'Ben', email: USER_B.email, role: 'teacher' };
      getMe.mockReturnValueOnce(first.promise).mockResolvedValueOnce(PROFILE_B);
      await mount();
      await fire(USER);
      await fire(USER_B);
      expect(latest.profile).toEqual(PROFILE_B);

      await act(async () => {
        first.resolve(PROFILE);
        await first.promise;
      });
      expect(latest.user).toBe(USER_B);
      expect(latest.profile).toEqual(PROFILE_B);
      expect(await cached()).toBeNull();
    });

    it('drops a cached profile read that finishes after signOut started', async () => {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(PROFILE));
      getMe.mockRejectedValue(new ApiError(0, OFFLINE));
      const read = deferred();
      const realGetItem = AsyncStorage.getItem;
      const spy = jest.spyOn(AsyncStorage, 'getItem').mockImplementationOnce(() => read.promise);
      await mount();
      await fire(USER);

      await act(async () => {
        await latest.signOut();
      });
      await act(async () => {
        read.resolve(JSON.stringify(PROFILE));
        await read.promise;
      });
      spy.mockRestore();
      expect(AsyncStorage.getItem).toBe(realGetItem);
      expect(latest.profile).toBeNull();
      expect(latest.profileError).toBe('');
    });

    it('signs out once when getMe itself gets a 401', async () => {
      getMe.mockImplementation(async () => {
        configureApi.mock.calls[0][0].onUnauthorized(); // what apiFetch does before throwing
        throw new ApiError(401, 'Unauthorized');
      });
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(PROFILE));
      await mount();
      await fire(USER);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(latest.notice).toBe('Please log in again.');
      expect(latest.user).toBeNull();
      expect(latest.profile).toBeNull();
      expect(latest.profileError).toBe('');
      expect(await cached()).toBeNull();
    });
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
