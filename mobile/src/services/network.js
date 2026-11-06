import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

/** True unless NetInfo reports the phone is not connected. Unknown (null) counts as online. */
export function useOnline() {
  const { isConnected } = useNetInfo();
  return isConnected !== false;
}

/** True only when NetInfo reports no connection. Unknown or a NetInfo failure counts as online. */
export async function isOfflineNow() {
  try {
    const state = await NetInfo.fetch();
    return state?.isConnected === false;
  } catch {
    return false;
  }
}
