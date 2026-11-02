import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useContainer } from '@/bootstrap/container-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import type { GetQuestListQuery, QuestListItem } from '../application/get-quest-list.query';

export function QuestList() {
  const { queries } = useContainer();
  const [quests, setQuests] = useState<readonly QuestListItem[]>([]);

  useEffect(() => {
    queries.ask<GetQuestListQuery>({ type: 'quests/get-list' }).then(setQuests);
  }, [queries]);

  return (
    <FlatList
      data={quests}
      keyExtractor={(q) => q.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ThemedView type="backgroundElement" style={styles.row}>
          <ThemedText>{item.title}</ThemedText>
          <ThemedText type="small">
            {item.stepsDone}/{item.stepsTotal}
          </ThemedText>
        </ThemedView>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.two, padding: Spacing.four },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
});
