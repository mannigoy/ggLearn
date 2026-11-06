import NetInfo from '@react-native-community/netinfo';
import { isOfflineNow } from './network.js';

describe('isOfflineNow', () => {
  afterEach(() => {
    NetInfo.fetch.mockReset();
    NetInfo.fetch.mockResolvedValue({ type: 'cellular', isConnected: true, isInternetReachable: true });
  });

  it('is false when NetInfo reports a connection', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ type: 'wifi', isConnected: true });
    await expect(isOfflineNow()).resolves.toBe(false);
  });

  it('is true when NetInfo reports no connection', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ type: 'none', isConnected: false });
    await expect(isOfflineNow()).resolves.toBe(true);
  });

  it('counts an unknown connection (null) as online', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ type: 'unknown', isConnected: null });
    await expect(isOfflineNow()).resolves.toBe(false);
  });

  it('counts a NetInfo failure as online', async () => {
    NetInfo.fetch.mockRejectedValueOnce(new Error('NetInfo unavailable'));
    await expect(isOfflineNow()).resolves.toBe(false);
  });
});
