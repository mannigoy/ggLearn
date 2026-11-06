import { StyleSheet, View } from 'react-native';
import { tokens } from '../theme/tokens';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.radii.card,
    padding: tokens.space(5),
    marginBottom: tokens.space(4),
    borderWidth: 2,
    borderColor: '#EFE8DA',
  },
});
