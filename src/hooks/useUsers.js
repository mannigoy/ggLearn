import { useEffect, useState } from 'react';
import { watchUsers } from '../services/userService.js';

const describe = (error) => (error?.code === 'permission-denied'
  ? 'You don’t have permission to see users. Check that your profile role is "admin" and the Firestore rules are deployed.'
  : 'Couldn’t load users. Check your connection and refresh.');

/** Live list of all users while `enabled` (admins only). */
export default function useUsers(enabled) {
  const [state, setState] = useState({ users: null, error: '' });

  useEffect(() => {
    if (!enabled) return undefined;
    const stop = watchUsers(
      (users) => setState({ users, error: '' }),
      (error) => {
        console.error('[GG] watch users', error);
        setState((current) => ({ ...current, error: describe(error) }));
      }
    );
    return () => {
      stop();
      setState({ users: null, error: '' });
    };
  }, [enabled]);

  return state;
}
