import { StyleSheet, Text } from 'react-native';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Screen from '../../components/Screen';
import { ROLES, ROLE_LABELS } from '../../lib/constants.js';
import { tokens } from '../../theme/tokens';
import { fonts } from '../../theme/fonts';
import ChangePasswordForm from './ChangePasswordForm';

export default function MeScreen() {
  const { profile, signOut } = useAuth();
  return (
    <Screen title="Me">
      <Card>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.role}>{ROLE_LABELS[profile?.role] || profile?.role}</Text>
        {profile?.email ? <Text style={styles.email}>{profile.email}</Text> : null}
        {profile?.role === ROLES.ADMIN ? <Text style={styles.note}>Manage users on the GG Learn website.</Text> : null}
      </Card>
      <ChangePasswordForm />
      <Button label="Log out" variant="coral" onPress={() => signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
  role: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.skyDark, marginTop: tokens.space(1) },
  email: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text, marginTop: tokens.space(1) },
  note: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text, marginTop: tokens.space(3) },
});
