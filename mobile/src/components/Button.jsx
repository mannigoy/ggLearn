import { Pressable, StyleSheet, Text } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import useReduceMotion from './useReduceMotion';

const { colors } = tokens;
const VARIANTS = {
  sky: { bg: colors.sky, edge: colors.skyDark, fg: colors.white },
  sun: { bg: colors.sun, edge: colors.sunDark, fg: colors.text },
  mint: { bg: colors.mint, edge: colors.mintDark, fg: colors.white },
  coral: { bg: colors.coral, edge: colors.coralDark, fg: colors.white },
  plain: { bg: colors.white, edge: '#D8D3C8', fg: colors.text },
};

export default function Button({ label, onPress, busy, disabled, variant = 'sky', accessibilityLabel, small }) {
  const reduce = useReduceMotion();
  const v = VARIANTS[variant] || VARIANTS.sky;
  const off = !!(busy || disabled);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: off, busy: !!busy }}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: v.bg, borderBottomColor: v.edge },
        off && styles.off,
        pressed && !reduce && { transform: [{ translateY: 2 }, { scale: 0.97 }] },
      ]}
    >
      <Text style={[styles.text, { color: v.fg }]}>{busy ? `${label}…` : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: tokens.minTouch,
    minWidth: tokens.minTouch,
    paddingHorizontal: tokens.space(6),
    borderRadius: tokens.radii.pill,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: { paddingHorizontal: tokens.space(4) },
  off: { opacity: 0.6 },
  text: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body },
});
