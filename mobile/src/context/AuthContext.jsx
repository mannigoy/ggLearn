import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { configureApi } from '../lib/api.js';
import { createAccount, getIdToken, login, logout, onAuthChange } from '../services/authService.js';
import { getMe } from '../services/profileApi.js';
import { isOfflineNow } from '../services/network.js';
import { clearProfile, readProfile, writeProfile } from './profileCache.js';

const NO_PROFILE = 'Your account has no profile yet.';
const TURNED_OFF = 'Your account is turned off. Ask your admin.';
const LOG_IN_AGAIN = 'Please log in again.';
const GENERIC = 'Something went wrong. Please try again.';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const userRef = useRef(null);
  const profileRef = useRef(null);
  // True while signUp runs: createAccount returns the profile, so the listener must not fetch it.
  const registeringRef = useRef(false);
  // True while a sign-out runs, so a burst of 401s (or a 401 plus a failed getMe) signs out once.
  const signingOutRef = useRef(false);
  // Bumped whenever a profile load becomes stale; a load only lands if its id is still current.
  const loadIdRef = useRef(0);

  const showProfile = useCallback((next) => {
    profileRef.current = next;
    setProfile(next);
    setProfileError('');
  }, []);

  const clearSession = useCallback(() => {
    loadIdRef.current += 1;
    userRef.current = null;
    profileRef.current = null;
    setUser(null);
    setProfile(null);
    setProfileError('');
  }, []);

  const signOut = useCallback(
    async (message = '') => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      const uid = userRef.current?.uid ?? profileRef.current?.uid;
      setNotice(message);
      loadIdRef.current += 1;
      profileRef.current = null;
      setProfile(null);
      try {
        await clearProfile(uid);
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

  // Loads GET /me. Only 404 and 403 sign out here (401 signs out through onUnauthorized).
  // Any other failure keeps the user signed in: the cached profile is used when there is one,
  // otherwise `profileError` is set. On the first load for a user (`fresh`) the cache is always
  // consulted; a refresh keeps the profile already on screen. A refresh rethrows the error.
  const loadProfile = useCallback(
    async (uid, { fresh }) => {
      const id = ++loadIdRef.current;
      try {
        const me = await getMe();
        if (id !== loadIdRef.current) return;
        showProfile(me);
        await writeProfile(me);
      } catch (err) {
        if (id !== loadIdRef.current) return;
        if (err?.status === 404) return signOut(NO_PROFILE);
        if (err?.status === 403) return signOut(TURNED_OFF);
        if (err?.status === 401) return;
        if (fresh || !profileRef.current) {
          const saved = await readProfile(uid);
          if (id !== loadIdRef.current) return;
          if (saved) showProfile(saved);
          else setProfileError(err?.message || GENERIC);
        }
        if (!fresh) throw err;
      }
    },
    [showProfile, signOut],
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
      await loadProfile(next.uid, { fresh: true });
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
        showProfile(created);
        await writeProfile(created);
        return created;
      } catch (err) {
        // createAccount already removed the Firebase account; keep the app signed out.
        clearSession();
        throw err;
      } finally {
        registeringRef.current = false;
      }
    },
    [clearSession, showProfile],
  );

  const refreshProfile = useCallback(
    () => loadProfile(userRef.current?.uid, { fresh: false }),
    [loadProfile],
  );

  const value = useMemo(
    () => ({ user, profile, profileError, loading, notice, signIn, signUp, signOut, refreshProfile }),
    [user, profile, profileError, loading, notice, signIn, signUp, signOut, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider.');
  return value;
}
