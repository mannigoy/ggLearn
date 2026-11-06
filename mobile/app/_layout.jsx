import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Fredoka_600SemiBold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx';
import { routeFor } from '../src/context/routeFor.js';
import ProfileErrorScreen from '../src/features/auth/ProfileErrorScreen';
import { tokens } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync();

function RootStack({ fontsReady }) {
  const { user, profile, profileError, loading } = useAuth();
  const ready = fontsReady && !loading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;
  // Signed in but the profile can't load (offline, server down) and nothing is cached.
  if (user && !profile && profileError) return <ProfileErrorScreen />;
  const route = routeFor(profile);
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.colors.bg } }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={route === 'auth'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={route === 'pending'}>
        <Stack.Screen name="pending" />
      </Stack.Protected>
      <Stack.Protected guard={route === 'tabs'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Fredoka_600SemiBold, Nunito_400Regular, Nunito_700Bold });
  return (
    <AuthProvider>
      <RootStack fontsReady={Boolean(loaded || error)} />
    </AuthProvider>
  );
}
