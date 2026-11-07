import { StyleSheet, Text, View } from 'react-native';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Icon from '../../components/Icon';
import Mascot from '../../components/Mascot';
import { ErrorState, Loading } from '../../components/States';
import { useAsync } from '../../lib/useAsync.js';
import { useReloadOnFocus } from '../../lib/useReloadOnFocus.js';
import { myBadges } from '../../services/badgeApi.js';
import { listCourses } from '../../services/courseApi.js';
import { fonts } from '../../theme/fonts';
import { tokens } from '../../theme/tokens';
import { formatEarned, withCourseNames } from './joinBadges.js';

const load = () => Promise.all([myBadges(), listCourses()]);

export default function MyBadges() {
  const { data, error, loading, reloading, reload } = useAsync(load, []);
  useReloadOnFocus(reload);

  let body;
  if (loading) body = <Loading />;
  else if (!data) body = <ErrorState message={error} onRetry={reload} />;
  else {
    const badges = withCourseNames(data[0], data[1]);
    body = (
      <>
        {error ? <ErrorState message={error} onRetry={reload} /> : null}
        {badges.length === 0 ? (
          <View style={styles.empty}>
            <Mascot size={120} mood="think" />
            <Text style={styles.emptyText}>No badges yet. Finish a course to earn one.</Text>
          </View>
        ) : (
          badges.map((b) => {
            const date = formatEarned(b.dateEarned);
            return (
              <Card key={b.id}>
                <View
                  accessible
                  accessibilityLabel={['Badge ' + b.title, b.courseTitle, date].filter(Boolean).join(', ')}
                  style={styles.row}
                >
                  <Icon name="badge" color={tokens.colors.sun} size={48} />
                  <View style={styles.text}>
                    <Text style={styles.title}>{b.title}</Text>
                    <Text style={styles.meta}>{b.courseTitle}</Text>
                    {date ? <Text style={styles.meta}>{date}</Text> : null}
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </>
    );
  }

  return (
    <Screen title="Badges" refreshing={reloading} onRefresh={reload}>
      {body}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space(4), minHeight: tokens.minTouch },
  text: { flex: 1, gap: tokens.space(1) },
  title: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text },
  meta: { fontFamily: fonts.body, fontSize: tokens.type.small, color: tokens.colors.muted },
  empty: { alignItems: 'center', gap: tokens.space(3), padding: tokens.space(6) },
  emptyText: { fontFamily: fonts.heading, fontSize: tokens.type.h2, color: tokens.colors.text, textAlign: 'center' },
});
