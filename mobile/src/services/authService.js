import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from 'firebase/auth';
import { auth } from './firebase.js';
import { registerMe } from './profileApi.js';

const requireFirebase = () => {
  if (!auth) {
    const error = new Error('Firebase is not configured.');
    error.code = 'app/not-configured';
    throw error;
  }
};

export async function login(email, password) {
  requireFirebase();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  if (auth) await signOut(auth);
}

/** Creates the Firebase user, then the server profile. Returns the profile from POST /api/me. */
export async function createAccount({ name, email, password, role }) {
  requireFirebase();
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  try {
    return await registerMe({ name, role });
  } catch (error) {
    // Don't leave a signed-in account with no profile behind.
    await user.delete().catch(() => signOut(auth));
    throw error;
  }
}

/** Firebase requires a recent sign-in to change a password, so confirm the current one first. */
export async function changePassword(currentPassword, newPassword) {
  requireFirebase();
  const account = auth.currentUser;
  if (!account) {
    const error = new Error('Not signed in.');
    error.code = 'auth/no-current-user';
    throw error;
  }
  await reauthenticateWithCredential(account, EmailAuthProvider.credential(account.email, currentPassword));
  await updatePassword(account, newPassword);
}

/** Resolves the current ID token, or null when nobody is signed in. */
export async function getIdToken() {
  const account = auth?.currentUser;
  return account ? account.getIdToken() : null;
}

/** Calls `cb` with the Firebase user (or null) on every change. Returns an unsubscribe function. */
export function onAuthChange(cb) {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
}

/** Maps Firebase errors onto the Auth form's field keys (name, email, password, form). */
export function mapAuthError(error) {
  switch (error?.code) {
    case 'auth/invalid-email':
      return { email: 'Enter an email like name@example.com.' };
    case 'auth/email-already-in-use':
      return { email: 'That email already has an account. Try logging in.' };
    case 'auth/weak-password':
      return { password: 'Use at least 6 characters.' };
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return { password: 'Email or password is incorrect.' };
    case 'auth/user-disabled':
      return { form: 'Your account is turned off. Ask your admin.' };
    case 'auth/too-many-requests':
      return { form: 'Too many attempts. Wait a moment and try again.' };
    case 'auth/network-request-failed':
      return { form: 'Can’t reach the server. Check your connection.' };
    case 'app/not-configured':
      return { form: 'Accounts aren’t set up yet. Add the Firebase settings to mobile/.env.' };
    case 'app/invalid-role':
      return { form: 'Pick student or teacher.' };
    default:
      return { form: 'Something went wrong. Please try again.' };
  }
}
