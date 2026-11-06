import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Mascot from '../../components/Mascot';
import Screen from '../../components/Screen';
import { tokens } from '../../theme/tokens';
import { fonts } from '../../theme/fonts';

export default function PendingScreen() {
  const { profile, refreshProfile, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      await refreshProfile();
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Screen title="Almost there" refreshing={refreshing} onRefresh={refresh}>
      <View style={styles.head}>
        <Mascot size={110} mood="think" />
      </View>
      <Card>
        <Text style={styles.name}>Hi, {profile?.name}!</Text>
        <Text style={styles.body}>
          Your teacher account is waiting for an admin to approve it. Pull down to check again.
        </Text>
      </Card>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button variant="plain" label="Log out" onPress={() => signOut()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', marginBottom: tokens.space(4) },
  name: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text, marginBottom: tokens.space(2) },
  body: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text },
  error: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.coralDark, marginTop: tokens.space(3) },
  actions: { marginTop: tokens.space(6) },
});
