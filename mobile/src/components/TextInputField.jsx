import { StyleSheet, Text, TextInput, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';

export default function TextInputField({ label, value, onChangeText, error, multiline, secureTextEntry, ...rest }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        placeholderTextColor={tokens.colors.muted}
        style={[styles.input, multiline && styles.multi, error && styles.bad]}
        {...rest}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: tokens.space(3) },
  label: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.text, marginBottom: tokens.space(1) },
  input: {
    minHeight: tokens.minTouch,
    borderWidth: 2,
    borderColor: '#D8D3C8',
    borderRadius: tokens.radii.card / 2,
    paddingHorizontal: tokens.space(4),
    backgroundColor: tokens.colors.white,
    fontFamily: fonts.body,
    fontSize: tokens.type.body,
    color: tokens.colors.text,
  },
  multi: { minHeight: 110, textAlignVertical: 'top', paddingTop: tokens.space(3) },
  bad: { borderColor: tokens.colors.coralDark },
  error: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.coralDark, marginTop: tokens.space(1) },
});
