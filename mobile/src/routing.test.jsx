import { Text } from 'react-native';
import { act } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Slot, Stack } from 'expo-router';
import { useEffect } from 'react';
import RootLayout from '../app/_layout';
import Index from '../app/index';
import { apiFetch } from './lib/api.js';
import { onAuthChange } from './services/authService.js';
import { getMe } from './services/profileApi.js';

jest.mock('expo-splash-screen', () => ({ preventAutoHideAsync: jest.fn(), hideAsync: jest.fn() }));
jest.mock('@expo-google-fonts/fredoka', () => ({ useFonts: () => [true, null], Fredoka_600SemiBold: 'f' }));
jest.mock('@expo-google-fonts/nunito', () => ({ Nunito_400Regular: 'n', Nunito_700Bold: 'n' }));
jest.mock('./services/firebase.js', () => ({ auth: null, isFirebaseConfigured: false }));
jest.mock('./services/authService.js', () => ({
  login: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
  createAccount: jest.fn(),
  getIdToken: jest.fn().mockResolvedValue('token'),
  onAuthChange: jest.fn(),
}));
jest.mock('./services/profileApi.js', () => ({ getMe: jest.fn() }));
jest.mock('./services/network.js', () => ({ isOfflineNow: jest.fn().mockResolvedValue(false), useOnline: () => true }));

const PROFILE = { uid: 'u1', name: 'Ana', email: 'ana@example.com', role: 'student' };

// Stub screens: the layout under test is the real one, so its guards are what is exercised.
function CourseStub() {
  useEffect(() => {
    apiFetch('/courses/c1').catch(() => {});
  }, []);
  return <Text>course screen</Text>;
}

const routes = {
  _layout: RootLayout,
  index: Index,
  pending: () => <Text>pending screen</Text>,
  '(tabs)/_layout': () => <Slot />,
  '(auth)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(auth)/login': () => <Text>login screen</Text>,
  '(tabs)/courses/index': () => <Text>courses tab</Text>,
  'course/[id]': CourseStub,
  'lesson/[id]': () => <Text>lesson screen</Text>,
  'quiz/[id]': () => <Text>quiz screen</Text>,
};

let emit;
beforeEach(() => {
  jest.clearAllMocks();
  process.env.EXPO_PUBLIC_API_URL = 'http://api.test';
  onAuthChange.mockImplementation((cb) => {
    emit = cb;
    return () => {};
  });
  getMe.mockResolvedValue(PROFILE);
});
afterEach(() => {
  delete global.fetch;
});

describe('course/[id] route guard', () => {
  it('does not open for a signed-out user', async () => {
    await renderRouter(routes, { initialUrl: '/course/c1' });
    await act(async () => emit(null));
    expect(await screen.findByText('login screen')).toBeTruthy();
    expect(screen.queryByText('course screen')).toBeNull();
  });

  it('opens for a signed-in user, and a 401 on it returns to log in', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) });
    await renderRouter(routes, { initialUrl: '/course/c1' });
    await act(async () => emit({ uid: 'u1' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(await screen.findByText('login screen')).toBeTruthy();
    expect(screen.queryByText('course screen')).toBeNull();
  });
});

describe('lesson/[id] and quiz/[id] route guards', () => {
  it('does not open a lesson for a signed-out user', async () => {
    await renderRouter(routes, { initialUrl: '/lesson/l1' });
    await act(async () => emit(null));
    expect(await screen.findByText('login screen')).toBeTruthy();
    expect(screen.queryByText('lesson screen')).toBeNull();
  });

  it('does not open a quiz for a signed-out user', async () => {
    await renderRouter(routes, { initialUrl: '/quiz/q1' });
    await act(async () => emit(null));
    expect(await screen.findByText('login screen')).toBeTruthy();
    expect(screen.queryByText('quiz screen')).toBeNull();
  });
});
