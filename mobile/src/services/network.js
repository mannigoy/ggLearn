import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

/** True unless NetInfo reports the phone is not connected. Unknown (null) counts as online. */
export function useOnline() {
  const { isConnected } = useNetInfo();
  return isConnected !== false;
}

export async function isOfflineNow() {
  const state = await NetInfo.fetch();
  return state.isConnected === false;
}
