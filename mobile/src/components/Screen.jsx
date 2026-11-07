import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { fonts } from '../theme/fonts';
import Icon from './Icon';

function goBack(fallback) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback ?? '/courses');
}

export default function Screen({ title, children, scroll = true, refreshing = false, onRefresh, back }) {
  const header = title ? <Text accessibilityRole="header" style={styles.title}>{title}</Text> : null;
  return (
    <SafeAreaView style={styles.safe}>
      {back ? (
        <View style={styles.backRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={back.label}
            onPress={() => goBack(back.fallback)}
            style={styles.back}
          >
            <Icon name="back" size={40} />
          </Pressable>
        </View>
      ) : null}
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
  backRow: { paddingHorizontal: tokens.space(5), paddingTop: tokens.space(2), alignItems: 'flex-start' },
  back: { minWidth: tokens.minTouch, minHeight: tokens.minTouch, alignItems: 'center', justifyContent: 'center' },
  body: { padding: tokens.space(5), flexGrow: 1 },
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h1, color: tokens.colors.text, marginBottom: tokens.space(4) },
});
