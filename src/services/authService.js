import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { ROLES } from '../constants/index.js';
import { auth, firestore } from './firebase.js';

// What each sign-up choice is stored as. Teachers wait for an admin to approve them.
const SELF_REGISTER_ROLES = {
  [ROLES.STUDENT]: ROLES.STUDENT,
  [ROLES.TEACHER]: ROLES.PENDING_TEACHER
};

const requireFirebase = () => {
  if (!auth || !firestore) {
    const error = new Error('Firebase is not configured.');
    error.code = 'app/not-configured';
    throw error;
  }
};

/**
 * Calls `onProfile` with the signed-in user's profile ({ uid, email, name, role })
 * or null. The profile lives in Firestore at users/{uid}; a signed-in user without
 * a profile document is reported as null.
 */
export function watchAuth(onProfile) {
  if (!auth) {
    onProfile(null);
    return () => {};
  }

  let stopProfile = () => {};
  const stopAuth = onAuthStateChanged(auth, (account) => {
    stopProfile();
    stopProfile = () => {};
    if (!account) {
      onProfile(null);
      return;
    }
    stopProfile = onSnapshot(
      doc(firestore, 'users', account.uid),
      (snap) => onProfile(snap.exists() ? { uid: account.uid, email: account.email, ...snap.data() } : null),
      (error) => {
        console.error('[GG] profile listener', error);
        onProfile(null);
      }
    );
  });

  return () => {
    stopProfile();
    stopAuth();
  };
}

export async function loginUser(email, password) {
  requireFirebase();
  await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
  if (auth) await signOut(auth);
}

export async function registerUser({ name, email, password, role }) {
  requireFirebase();
  const storedRole = SELF_REGISTER_ROLES[role];
  if (!storedRole) {
    const error = new Error(`Role "${role}" cannot self-register.`);
    error.code = 'app/invalid-role';
    throw error;
  }

  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  try {
    await updateProfile(user, { displayName: name });
    await setDoc(doc(firestore, 'users', user.uid), {
      name,
      email,
      role: storedRole,
      createdAt: serverTimestamp()
    });
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
      return { form: 'Accounts aren’t set up yet. Add the Firebase settings to .env.local.' };
    case 'app/invalid-role':
      return { form: 'Pick student or teacher.' };
    default:
      return { form: 'Something went wrong. Please try again.' };
  }
}
