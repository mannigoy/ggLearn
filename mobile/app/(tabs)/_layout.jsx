import { Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext.jsx';
import { ROLES } from '../../src/lib/constants.js';
import Icon from '../../src/components/Icon';
import { tokens } from '../../src/theme/tokens';
import { fonts } from '../../src/theme/fonts';

function tabIcon(name) {
  function TabIcon({ focused }) {
    return <Icon name={name} size={28} color={focused ? tokens.colors.sky : tokens.colors.muted} />;
  }
  return TabIcon;
}
const ICONS = { book: tabIcon('book'), badge: tabIcon('badge'), user: tabIcon('user') };

export default function TabsLayout() {
  const { profile } = useAuth();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.colors.skyDark,
        tabBarInactiveTintColor: tokens.colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 14 },
        tabBarStyle: { backgroundColor: tokens.colors.bg, minHeight: 64 },
      }}
    >
      <Tabs.Screen name="courses" options={{ title: 'Courses', tabBarIcon: ICONS.book }} />
      <Tabs.Screen
        name="badges"
        options={{ title: 'Badges', tabBarIcon: ICONS.badge, href: profile?.role === ROLES.STUDENT ? undefined : null }}
      />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: ICONS.user }} />
    </Tabs>
  );
}
