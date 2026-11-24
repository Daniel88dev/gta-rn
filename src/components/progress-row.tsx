import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

/** One line of a completion table: "Collectible cards   12 / 447 mapped (480 expected)". */
export function ProgressRow({
  name,
  done,
  known,
  expected,
}: {
  name: string;
  done: number;
  known: number;
  expected?: number;
}) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" style={styles.name}>
        {name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {done} / {known} mapped{expected !== undefined ? ` (${expected} expected)` : ''}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.one,
  },
  name: { flex: 1 },
});
