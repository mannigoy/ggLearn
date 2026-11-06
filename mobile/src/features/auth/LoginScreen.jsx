import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { validateUser } from '../../lib/validate.js';
import { mapAuthError } from '../../services/authService.js';
import Button from '../../components/Button';
import Mascot from '../../components/Mascot';
import Screen from '../../components/Screen';
import TextInputField from '../../components/TextInputField';
import { tokens } from '../../theme/tokens';
import { fonts } from '../../theme/fonts';

function checkLogin(email, password) {
  const errors = {};
  const emailError = validateUser({ email, password }, { isNew: true }).email;
  if (emailError) errors.email = emailError;
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export default function LoginScreen() {
  const { signIn, notice } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    const trimmed = email.trim();
    const found = checkLogin(trimmed, password);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await signIn(trimmed, password);
    } catch (err) {
      setErrors(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Log in">
      <View style={styles.head}>
        <Mascot size={96} />
        <Text style={styles.lead}>Open your science notebook.</Text>
      </View>
      {notice ? <Text accessibilityRole="alert" style={styles.notice}>{notice}</Text> : null}
      <TextInputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextInputField
        label="Password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="password"
      />
      {errors.form ? <Text accessibilityRole="alert" style={styles.formError}>{errors.form}</Text> : null}
      <Button label="Log in" busy={busy} onPress={submit} />
      <View style={styles.switch}>
        <Text style={styles.muted}>New here?</Text>
        <Button
          variant="plain"
          small
          label="Sign up"
          accessibilityLabel="Go to sign up"
          onPress={() => router.push('/signup')}
        />
      </View>
    </Screen>
  );
}

export const authStyles = StyleSheet.create({
  head: { alignItems: 'center', marginBottom: tokens.space(4), gap: tokens.space(2) },
  lead: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text, textAlign: 'center' },
  notice: {
    fontFamily: fonts.bodyBold,
    fontSize: tokens.type.body,
    color: tokens.colors.text,
    backgroundColor: '#FFF1C9',
    borderRadius: tokens.radii.card,
    padding: tokens.space(4),
    marginBottom: tokens.space(4),
  },
  formError: {
    fontFamily: fonts.bodyBold,
    fontSize: tokens.type.small,
    color: tokens.colors.coralDark,
    marginBottom: tokens.space(3),
  },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space(2),
    marginTop: tokens.space(5),
  },
  muted: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.muted },
});

const styles = authStyles;
