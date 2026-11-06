import { Pressable, StyleSheet, Text } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';

export default function Chip({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={[styles.chip, selected && styles.on]}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: tokens.minTouch,
    minWidth: tokens.minTouch,
    paddingHorizontal: tokens.space(4),
    borderRadius: tokens.radii.pill,
    borderWidth: 2,
    borderColor: tokens.colors.sky,
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: tokens.colors.sky },
  text: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.text },
  textOn: { color: tokens.colors.white },
});
