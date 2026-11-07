import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import { useTicks } from './useTicks.js';

export default function ExperimentCard({ experiment }) {
  const { id, title, materials = [], steps = [], safetyNotes } = experiment;
  const { ticked, toggle } = useTicks(id, steps.length);
  return (
    <Card>
      <View style={styles.head}>
        <Icon name="flask" color={tokens.colors.mint} size={36} />
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      </View>
      {safetyNotes && safetyNotes.trim() ? (
        <View style={styles.safety}>
          <Text style={styles.safetyHead}>Safety first</Text>
          <Text style={styles.body}>{safetyNotes.trim()}</Text>
        </View>
      ) : null}
      {materials.length > 0 ? (
        <>
          <Text style={styles.sub}>Materials</Text>
          {materials.map((m, i) => (
            <Text key={i} style={styles.body}>{m}</Text>
          ))}
        </>
      ) : null}
      <Text style={styles.sub}>Steps</Text>
      {steps.map((text, i) => {
        const checked = ticked.has(i);
        return (
          <Pressable
            key={i}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={`Step ${i + 1}: ${text}`}
            onPress={() => toggle(i)}
            style={styles.step}
          >
            <View style={[styles.box, checked && styles.boxOn]}>
              {checked ? <Icon name="check" color={tokens.colors.mint} size={28} /> : null}
            </View>
            <Text style={[styles.body, styles.stepText]}>{`${i + 1}. ${text}`}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: tokens.space(3), marginBottom: tokens.space(2) },
  title: { flex: 1, fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
  sub: { fontFamily: fonts.heading, fontSize: tokens.type.body, color: tokens.colors.text, marginTop: tokens.space(3) },
  body: { fontFamily: fonts.body, fontSize: tokens.type.body, color: tokens.colors.text },
  safety: { backgroundColor: '#FFF3D6', borderRadius: 16, padding: tokens.space(3), marginTop: tokens.space(2) },
  safetyHead: { fontFamily: fonts.bodyBold, fontSize: tokens.type.body, color: tokens.colors.text },
  step: { minHeight: tokens.minTouch, flexDirection: 'row', alignItems: 'center', gap: tokens.space(3) },
  stepText: { flex: 1 },
  box: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: tokens.colors.sky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { borderColor: tokens.colors.mint },
});
