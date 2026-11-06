import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button';
import Mascot from '../../components/Mascot';
import Screen from '../../components/Screen';
import { ErrorState } from '../../components/States';
import { tokens } from '../../theme/tokens';

/** Signed in, but the profile couldn't load and none is cached. Stays signed in; offers a retry. */
export default function ProfileErrorScreen() {
  const { profileError, refreshProfile, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const retry = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await refreshProfile();
    } catch {
      // refreshProfile has already put the new message in profileError.
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Can’t load your account">
      <View style={styles.head}>
        <Mascot size={96} mood="think" />
      </View>
      <ErrorState message={profileError} onRetry={busy ? undefined : retry} />
      <View style={styles.actions}>
        <Button variant="plain" label="Log out" onPress={() => signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginBottom: tokens.space(4) },
  actions: { marginTop: tokens.space(6) },
});
