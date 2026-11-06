import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { configureApi } from '../lib/api.js';
import { createAccount, getIdToken, login, logout, onAuthChange } from '../services/authService.js';
import { getMe } from '../services/profileApi.js';
import { isOfflineNow } from '../services/network.js';

const NO_PROFILE = 'Your account has no profile yet.';
const TURNED_OFF = 'Your account is turned off. Ask your admin.';
const LOG_IN_AGAIN = 'Please log in again.';
const GENERIC = 'Something went wrong. Please try again.';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const userRef = useRef(null);
  // True while signUp runs: createAccount returns the profile, so the listener must not fetch it.
  const registeringRef = useRef(false);
  // True while a sign-out runs, so a burst of 401s (or a 401 plus a failed getMe) signs out once.
  const signingOutRef = useRef(false);
  // Bumped whenever a profile load becomes stale; a load only lands if its id is still current.
  const loadIdRef = useRef(0);

  const clearSession = useCallback(() => {
    loadIdRef.current += 1;
    userRef.current = null;
    setUser(null);
    setProfile(null);
  }, []);

  const signOut = useCallback(
    async (message = '') => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      setNotice(message);
      loadIdRef.current += 1;
      setProfile(null);
      try {
        await logout();
      } catch {
        // Still clear the local session below.
      } finally {
        signingOutRef.current = false;
        clearSession();
        setLoading(false);
      }
    },
    [clearSession],
  );

  // Loads GET /me. A 404 or 403 signs out with its notice. Other errors sign out with their
  // message when `signOutOnError` is set (first load), or are thrown back to the caller.
  const loadProfile = useCallback(
    async ({ signOutOnError }) => {
      const id = ++loadIdRef.current;
      try {
        const me = await getMe();
        if (id === loadIdRef.current) setProfile(me);
      } catch (err) {
        if (id !== loadIdRef.current) return;
        if (err?.status === 404) return signOut(NO_PROFILE);
        if (err?.status === 403) return signOut(TURNED_OFF);
        if (signOutOnError) return signOut(err?.message || GENERIC);
        throw err;
      }
    },
    [signOut],
  );

  useEffect(() => {
    configureApi({
      baseUrl: process.env.EXPO_PUBLIC_API_URL,
      getToken: getIdToken,
      onUnauthorized: () => {
        // Nobody signed in (a stale request) or a sign-up in progress (createAccount rolls back).
        if (!userRef.current || registeringRef.current) return;
        signOut(LOG_IN_AGAIN);
      },
      isOffline: isOfflineNow,
    });
  }, [signOut]);

  useEffect(() => {
    return onAuthChange(async (next) => {
      if (!next) {
        clearSession();
        setLoading(false);
        return;
      }
      userRef.current = next;
      setUser(next);
      if (registeringRef.current) {
        // Firebase reports the new account before POST /me answers. signUp sets the profile.
        loadIdRef.current += 1;
        return;
      }
      await loadProfile({ signOutOnError: true });
      setLoading(false);
    });
  }, [clearSession, loadProfile]);

  const signIn = useCallback(async (email, password) => {
    setNotice('');
    await login(email, password);
  }, []);

  const signUp = useCallback(
    async (form) => {
      registeringRef.current = true;
      setNotice('');
      try {
        const created = await createAccount(form);
        loadIdRef.current += 1;
        setProfile(created);
        return created;
      } catch (err) {
        // createAccount already removed the Firebase account; keep the app signed out.
        clearSession();
        throw err;
      } finally {
        registeringRef.current = false;
      }
    },
    [clearSession],
  );

  const refreshProfile = useCallback(() => loadProfile({ signOutOnError: false }), [loadProfile]);

  const value = useMemo(
    () => ({ user, profile, loading, notice, signIn, signUp, signOut, refreshProfile }),
    [user, profile, loading, notice, signIn, signUp, signOut, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
