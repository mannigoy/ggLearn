import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';

export default function Tabs({ tabs, value, onChange }) {
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {tabs.map((t) => {
        const selected = t.key === value;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(t.key)}
            style={[styles.tab, selected && styles.on]}
          >
            <Text style={[styles.text, selected && styles.textOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: tokens.space(2), marginBottom: tokens.space(4) },
  tab: {
    flex: 1,
    minHeight: tokens.minTouch,
    minWidth: tokens.minTouch,
    borderRadius: tokens.radii.pill,
    backgroundColor: tokens.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  on: { backgroundColor: tokens.colors.sun },
  text: { fontFamily: fonts.bodyBold, fontSize: tokens.type.small, color: tokens.colors.muted },
  textOn: { color: tokens.colors.text },
});
