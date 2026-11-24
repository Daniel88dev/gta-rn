import { Pressable, StyleSheet, View } from 'react-native';

import { useContainer } from '@/bootstrap/container-context';
import { useQuery } from '@/bootstrap/use-query';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

import type { GetActivitiesAtLocationQuery } from '../../activities/application/get-activities-at-location.query';
import type { SetActivityDoneCommand } from '../../activities/application/set-activity-done.command';
import type { GetCollectiblesAtLocationQuery } from '../../collectibles/application/get-collectibles-at-location.query';
import type { SetCollectibleFoundCommand } from '../../collectibles/application/set-collectible-found.command';
import type { GetLocationDetailsQuery } from '../application/get-location-details.query';
import type { LocationId } from '../domain/location';

/** Bottom card for the selected pin, with a found/done toggle for guide items there. */
export function LocationCard({ id, onClose }: { readonly id: LocationId; readonly onClose: () => void }) {
  const { commands } = useContainer();
  const { data: details } = useQuery<GetLocationDetailsQuery>({ type: 'map/get-location-details', id });
  const collectibles = useQuery<GetCollectiblesAtLocationQuery>({
    type: 'collectibles/get-at-location',
    locationId: id,
  });
  const activities = useQuery<GetActivitiesAtLocationQuery>({
    type: 'activities/get-at-location',
    locationId: id,
  });
  if (!details) return null;

  const where = [details.districtName, details.regionName].filter(Boolean).join(', ');

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
          {details.kindLabel.toUpperCase()}
        </ThemedText>
        <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close">
          <ThemedText themeColor="textSecondary">✕</ThemedText>
        </Pressable>
      </View>
      <ThemedText type="smallBold" style={styles.title}>
        {details.label}
      </ThemedText>
      {!!where && (
        <ThemedText type="small" themeColor="textSecondary">
          {where}
        </ThemedText>
      )}
      {!!details.description && <ThemedText type="small">{details.description}</ThemedText>}
      {details.status !== 'open' && (
        <ThemedText type="small" themeColor="textSecondary">
          Status: {details.status.replace('-', ' ')}
        </ThemedText>
      )}
      {!!details.realWorld && (
        <ThemedText type="small" themeColor="textSecondary">
          Real-world inspiration: {details.realWorld.address}
        </ThemedText>
      )}

      {collectibles.data?.map((c) => (
        <Toggle
          key={c.id}
          label={c.found ? 'Found ✓' : 'Mark as found'}
          on={c.found}
          onPress={async () => {
            await commands.dispatch<SetCollectibleFoundCommand>({
              type: 'collectibles/set-found',
              collectibleId: c.id,
              found: !c.found,
            });
            collectibles.refresh();
          }}
        />
      ))}
      {activities.data?.map((a) => (
        <Toggle
          key={a.id}
          label={a.done ? 'Done ✓' : 'Mark as done'}
          on={a.done}
          onPress={async () => {
            await commands.dispatch<SetActivityDoneCommand>({
              type: 'activities/set-done',
              activityId: a.id,
              done: !a.done,
            });
            activities.refresh();
          }}
        />
      ))}
    </ThemedView>
  );
}

function Toggle({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.toggle, on && styles.toggleOn, pressed && styles.pressed]}
    >
      <ThemedText type="smallBold" style={on ? styles.toggleOnText : undefined}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 12, letterSpacing: 0.6 },
  title: { fontSize: 18, lineHeight: 24 },
  toggle: {
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ff4f9a',
  },
  toggleOn: { backgroundColor: '#ff4f9a' },
  toggleOnText: { color: '#ffffff' },
  pressed: { opacity: 0.7 },
});
