import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';

// Expo only inlines literal `process.env.EXPO_PUBLIC_*` reads, so each key is spelled out.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

if (!isFirebaseConfigured) {
  console.warn('[GG] Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* settings to mobile/.env.');
}

function createAuth() {
  const existing = getApps()[0];
  if (existing) return getAuth(existing);
  const app = initializeApp(config);
  return initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
}

export const auth = isFirebaseConfigured ? createAuth() : null;
