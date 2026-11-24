import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { useContainer } from '@/bootstrap/container-context';
import { useQuery } from '@/bootstrap/use-query';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

import type { GetQuestListQuery, QuestListItem } from '../application/get-quest-list.query';
import type { SetQuestCompletedCommand } from '../application/set-quest-completed.command';

export function MissionSection() {
  const { commands } = useContainer();
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [openChapter, setOpenChapter] = useState<number | null>(1);
  const { data, refresh } = useQuery<GetQuestListQuery>({
    type: 'quests/get-list',
    kind: 'story',
    maxSpoiler: showSpoilers ? 'major' : 'minor',
  });

  const chapters = new Map<number, { title: string; missions: QuestListItem[] }>();
  for (const q of data ?? []) {
    const n = q.chapter?.number ?? 0;
    const entry = chapters.get(n) ?? { title: q.chapter?.title ?? 'Other', missions: [] };
    entry.missions.push(q);
    chapters.set(n, entry);
  }

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <ThemedText type="small" themeColor="textSecondary">
          {data?.filter((q) => q.completed).length ?? 0} of {data?.length ?? 0} done
        </ThemedText>
        <View style={styles.row}>
          <ThemedText type="small" themeColor="textSecondary">
            Show hidden names
          </ThemedText>
          <Switch value={showSpoilers} onValueChange={setShowSpoilers} />
        </View>
      </View>
      {[...chapters].map(([n, chapter]) => (
        <View key={n}>
          <Pressable onPress={() => setOpenChapter(openChapter === n ? null : n)} style={styles.chapter}>
            <ThemedText type="smallBold">
              {openChapter === n ? '▾' : '▸'} Chapter {n}: {chapter.title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {chapter.missions.filter((m) => m.completed).length}/{chapter.missions.length}
            </ThemedText>
          </Pressable>
          {openChapter === n &&
            chapter.missions.map((m) => (
              <Pressable
                key={m.id}
                style={styles.mission}
                onPress={async () => {
                  await commands.dispatch<SetQuestCompletedCommand>({
                    type: 'quests/set-completed',
                    questId: m.id,
                    completed: !m.completed,
                  });
                  refresh();
                }}
              >
                <ThemedText>{m.completed ? '☑' : '☐'}</ThemedText>
                <ThemedText type="small" themeColor={m.hidden ? 'textSecondary' : 'text'} style={styles.flex}>
                  {m.order}. {m.title}
                </ThemedText>
              </Pressable>
            ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  chapter: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.two },
  mission: {
    flexDirection: 'row',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingLeft: Spacing.three,
  },
  flex: { flex: 1 },
});
