import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import Button from './Button';

export default function Confirm({ label, accessibilityLabel, onYes, message = 'Sure?', busy = false }) {
  const [on, setOn] = useState(false);
  if (!on) {
    return <Button small variant="plain" label={label} accessibilityLabel={accessibilityLabel} onPress={() => setOn(true)} />;
  }
  return (
    <View style={styles.row}>
      <Text style={styles.msg}>{message}</Text>
      <Button small variant="coral" label="Yes" busy={busy} accessibilityLabel={`Yes, ${accessibilityLabel || label}`} onPress={onYes} />
      <Button small variant="plain" label="No" accessibilityLabel={`No, keep ${accessibilityLabel || label}`} onPress={() => setOn(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: tokens.space(2) },
  msg: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.text },
});
