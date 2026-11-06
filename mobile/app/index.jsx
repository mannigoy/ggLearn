import { Text, View } from 'react-native';
import { fonts } from '../src/theme/fonts';
import { tokens } from '../src/theme/tokens';

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text }}>
        GG Learn
      </Text>
    </View>
  );
}
