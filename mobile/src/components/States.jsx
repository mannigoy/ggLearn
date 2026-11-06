import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import Button from './Button';

export function Loading({ label = 'Loading…' }) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} style={styles.center}>
      <ActivityIndicator color={tokens.colors.sky} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <View accessibilityRole="alert" style={styles.error}>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? <Button small variant="coral" label="Try again" onPress={onRetry} /> : null}
    </View>
  );
}

export function Empty({ title, children }) {
  return (
    <View style={styles.center}>
      <Text style={styles.title}>{title}</Text>
      {children ? <Text style={styles.muted}>{children}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', padding: tokens.space(6), gap: tokens.space(2) },
  muted: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.muted, textAlign: 'center' },
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text, textAlign: 'center' },
  error: {
    backgroundColor: '#FFE9E6',
    borderRadius: tokens.radii.card,
    padding: tokens.space(4),
    gap: tokens.space(3),
    alignItems: 'flex-start',
  },
  errorText: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.coralDark },
});
