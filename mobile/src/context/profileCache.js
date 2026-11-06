import AsyncStorage from '@react-native-async-storage/async-storage';

// The last profile seen for each account, so a signed-in user can open the app offline.
const keyFor = (uid) => `gglearn:profile:${uid}`;

/** The cached profile for `uid`, or null. Missing, corrupt or mismatched data counts as none. */
export async function readProfile(uid) {
  if (!uid) return null;
  try {
    const raw = await AsyncStorage.getItem(keyFor(uid));
    if (!raw) return null;
    const profile = JSON.parse(raw);
    if (!profile || typeof profile !== 'object' || typeof profile.role !== 'string') return null;
    if (profile.uid && profile.uid !== uid) return null;
    return profile;
  } catch {
    return null;
  }
}

export async function writeProfile(profile) {
  if (!profile?.uid) return;
  try {
    await AsyncStorage.setItem(keyFor(profile.uid), JSON.stringify(profile));
  } catch {
    // A missed cache write only costs offline start-up.
  }
}

export async function clearProfile(uid) {
  if (!uid) return;
  try {
    await AsyncStorage.removeItem(keyFor(uid));
  } catch {
    // Nothing else to do.
  }
}
