import { useEffect, useRef, useState } from 'react';
import { ALLOW_SELF_REGISTER } from '../constants/index.js';
import {
  loginUser,
  logoutUser,
  mapAuthError,
  registerUser,
  watchAuth
} from '../services/authService.js';

const PROFILE_TIMEOUT_MS = 8000;

export default function useStore() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const profileWaitRef = useRef(null);

  useEffect(() => {
    const unsubscribe = watchAuth((profile) => {
      setUser(profile);
      setAuthLoading(false);
      if (profile && profileWaitRef.current) {
        profileWaitRef.current.resolve(null);
        profileWaitRef.current = null;
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    // Wait for the profile before signing in, so a profile event that arrives
    // before loginUser resolves isn't missed.
    profileWaitRef.current?.resolve(null);
    let cancelWait;
    const profileReady = new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        if (profileWaitRef.current !== waiter) return;
        profileWaitRef.current = null;
        try {
          await logoutUser();
        } catch (logoutError) {
          console.error('[GG] failed to sign out after missing profile', logoutError);
        }
        resolve({ form: 'Your account has no profile yet. Please contact your admin.' });
      }, PROFILE_TIMEOUT_MS);
      const waiter = {
        resolve: (error) => {
          clearTimeout(timeout);
          resolve(error);
        }
      };
      profileWaitRef.current = waiter;
      cancelWait = () => {
        clearTimeout(timeout);
        if (profileWaitRef.current === waiter) profileWaitRef.current = null;
      };
    });

    try {
      await loginUser(email, password);
    } catch (error) {
      cancelWait();
      console.error('[GG] login', error);
      return mapAuthError(error);
    }
    return profileReady;
  };

  const register = async (form) => {
    const errors = {};
    const email = form.email.trim().toLowerCase();
    if (form.name.trim().length < 2) errors.name = 'Tell us your name.';
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Enter an email like name@example.com.';
    if (form.password.length < 6) errors.password = 'Use at least 6 characters.';
    if (Object.keys(errors).length) return errors;
    if (!ALLOW_SELF_REGISTER) return { form: 'Sign-up is closed. Ask your school admin for an account.' };

    try {
      await registerUser({
        name: form.name.trim(),
        email,
        password: form.password,
        role: form.role
      });
      return null;
    } catch (error) {
      console.error('[GG] register', error);
      return mapAuthError(error);
    }
  };

  const logout = async () => {
    await logoutUser();
  };

  return { user, authLoading, login, register, logout };
}
