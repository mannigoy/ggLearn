import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase.js';

/** Admin only: live list of every profile, newest first. Returns an unsubscribe function. */
export function watchUsers(onUsers, onError) {
  if (!firestore) {
    onUsers([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(firestore, 'users'), orderBy('createdAt', 'desc')),
    (snap) => onUsers(snap.docs.map((d) => ({ uid: d.id, ...d.data() }))),
    onError
  );
}

/** Admin only: change another user's role. Firestore rules block changing your own. */
export function setUserRole(uid, role, adminUid) {
  return updateDoc(doc(firestore, 'users', uid), {
    role,
    roleUpdatedAt: serverTimestamp(),
    roleUpdatedBy: adminUid
  });
}
