import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext.jsx';
import { ApiError } from '../../lib/api.js';
import { ROLES, ROLE_LABELS } from '../../lib/constants.js';
import { serverErrors } from '../../lib/formErrors.js';
import { validateUser } from '../../lib/validate.js';
import { mapAuthError } from '../../services/authService.js';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Mascot from '../../components/Mascot';
import Screen from '../../components/Screen';
import TextInputField from '../../components/TextInputField';
import { tokens } from '../../theme/tokens';
import { fonts } from '../../theme/fonts';
import { authStyles } from './LoginScreen';

const SIGN_UP_ROLES = [ROLES.STUDENT, ROLES.TEACHER];
const FIELD_KEYS = ['name', 'email', 'password', 'role'];

export default function SignupScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (busy) return;
    const input = { name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role };
    const found = validateUser(input, { isNew: true });
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await signUp(input);
    } catch (err) {
      setErrors(err instanceof ApiError ? serverErrors(err, FIELD_KEYS) : mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title="Sign up">
      <View style={authStyles.head}>
        <Mascot size={96} />
        <Text style={authStyles.lead}>Start your science notebook.</Text>
      </View>
      <TextInputField label="Name" value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" />
      <TextInputField
        label="Email"
        value={form.email}
        onChangeText={set('email')}
        error={errors.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextInputField
        label="Password"
        value={form.password}
        onChangeText={set('password')}
        error={errors.password}
        secureTextEntry
        autoComplete="new-password"
      />
      <Text style={styles.label}>I am a</Text>
      <View accessibilityRole="radiogroup" style={styles.roles}>
        {SIGN_UP_ROLES.map((role) => (
          <Chip key={role} label={ROLE_LABELS[role]} selected={form.role === role} onPress={() => set('role')(role)} />
        ))}
      </View>
      {form.role === ROLES.TEACHER ? (
        <Text style={styles.hint}>An admin checks teacher accounts before you get teacher tools.</Text>
      ) : null}
      {errors.role ? <Text accessibilityRole="alert" style={authStyles.formError}>{errors.role}</Text> : null}
      {errors.form ? <Text accessibilityRole="alert" style={authStyles.formError}>{errors.form}</Text> : null}
      <Button label="Sign up" busy={busy} onPress={submit} />
      <View style={authStyles.switch}>
        <Text style={authStyles.muted}>Have an account?</Text>
        <Button variant="plain" small label="Log in" accessibilityLabel="Go to log in" onPress={() => router.replace('/login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.text, marginBottom: tokens.space(2) },
  roles: { flexDirection: 'row', gap: tokens.space(3), marginBottom: tokens.space(3) },
  hint: { fontFamily: fonts.body, fontSize: tokens.type.small, color: tokens.colors.muted, marginBottom: tokens.space(3) },
});
