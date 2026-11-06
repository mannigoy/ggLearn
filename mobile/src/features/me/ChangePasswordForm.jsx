import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TextInputField from '../../components/TextInputField';
import { changePassword, mapAuthError } from '../../services/authService.js';
import { tokens } from '../../theme/tokens';
import { fonts } from '../../theme/fonts';

const EMPTY = { current: '', next: '', confirm: '' };

export default function ChangePasswordForm() {
  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    setDone(false);
  };

  const submit = async () => {
    if (busy) return;
    const errors = {};
    if (!f.current) errors.current = 'Enter your current password.';
    if (f.next.length < 6) errors.next = 'Use at least 6 characters.';
    else if (f.next === f.current) errors.next = 'Pick a password you haven’t used here.';
    if (f.confirm !== f.next) errors.confirm = 'Passwords don’t match.';
    setErrs(errors);
    if (Object.keys(errors).length) return;

    setBusy(true);
    try {
      await changePassword(f.current, f.next);
      setF(EMPTY);
      setDone(true);
    } catch (error) {
      // mapAuthError reports a wrong password under `password`; here that is the current one.
      const { password, email, ...rest } = mapAuthError(error);
      setErrs(password ? { current: password, ...rest } : { ...rest, ...(email ? { form: email } : {}) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <Text accessibilityRole="header" style={styles.title}>Change password</Text>
      {errs.form ? <Text accessibilityRole="alert" style={styles.error}>{errs.form}</Text> : null}
      {done ? <Text accessibilityRole="alert" style={styles.ok}>Password changed.</Text> : null}
      <TextInputField label="Current password" secureTextEntry autoCapitalize="none" value={f.current} onChangeText={(v) => set('current', v)} error={errs.current} />
      <TextInputField label="New password" secureTextEntry autoCapitalize="none" value={f.next} onChangeText={(v) => set('next', v)} error={errs.next} />
      <TextInputField label="Confirm new password" secureTextEntry autoCapitalize="none" value={f.confirm} onChangeText={(v) => set('confirm', v)} error={errs.confirm} />
      <Button label="Change password" variant="mint" busy={busy} onPress={submit} />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text, marginBottom: tokens.space(3) },
  error: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.coralDark, marginBottom: tokens.space(2) },
  ok: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.mintDark, marginBottom: tokens.space(2) },
});
