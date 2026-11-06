import { StyleSheet, View } from 'react-native';
import Mascot from '../../components/Mascot';
import Screen from '../../components/Screen';

/** Stand-in for a tab that a later task fills in. */
export default function Placeholder({ title }) {
  return (
    <Screen title={title}>
      <View style={styles.center}>
        <Mascot size={120} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ center: { alignItems: 'center', marginTop: 24 } });
