import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';

export default function Screen({ title, children, scroll = true, refreshing = false, onRefresh }) {
  const header = title ? <Text accessibilityRole="header" style={styles.title}>{title}</Text> : null;
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView
          testID="screen-scroll"
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={styles.body}>
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.colors.bg },
  body: { padding: tokens.space(5), flexGrow: 1 },
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text, marginBottom: tokens.space(4) },
});
