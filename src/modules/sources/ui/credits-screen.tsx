import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useQuery } from '@/bootstrap/use-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import type { GetCreditsQuery } from '../application/get-credits.query';

/** Required by the CC BY licences of the bundled data. Do not remove or shorten the credit lines. */
export function CreditsScreen() {
  const { data } = useQuery<GetCreditsQuery>({ type: 'sources/get-credits' });
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Credits</ThemedText>
          {data && <ThemedText type="small">{data.disclaimer}</ThemedText>}
          {data?.sources.map((s) => (
            <ThemedView key={s.id} type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{s.name}</ThemedText>
              <ThemedText type="small">{s.credit}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Licence:{' '}
                <ThemedText type="small" style={styles.link} onPress={() => Linking.openURL(s.licence.url)}>
                  {s.licence.name}
                </ThemedText>
                {s.version ? ` · ${s.version}` : ''}
              </ThemedText>
              <ThemedText type="small" style={styles.link} onPress={() => Linking.openURL(s.homepage)}>
                {s.homepage}
              </ThemedText>
              {!!s.changes && (
                <ThemedText type="small" themeColor="textSecondary">
                  {s.changes}
                </ThemedText>
              )}
            </ThemedView>
          ))}
          <ThemedText type="small" themeColor="textSecondary">
            Map positions are community-sourced and may be wrong. No game screenshots, artwork or official map
            imagery are included.
          </ThemedText>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  link: { color: '#3c87f7' },
});
