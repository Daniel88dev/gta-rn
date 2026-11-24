import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ActivitySection } from '@/modules/activities/ui/activity-section';
import { CollectionSection } from '@/modules/collectibles/ui/collection-section';
import { MissionSection } from '@/modules/quests/ui/mission-section';

/** Composes sections from several bounded contexts; owns no state of its own. */
export default function GuideScreen() {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">Story missions</ThemedText>
          <MissionSection />
          <ThemedText type="subtitle">Collectibles</ThemedText>
          <CollectionSection />
          <ThemedText type="subtitle">Activities</ThemedText>
          <ActivitySection group="activity" />
          <ThemedText type="subtitle">Crime</ThemedText>
          <ActivitySection group="crime" />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six * 2 },
});
