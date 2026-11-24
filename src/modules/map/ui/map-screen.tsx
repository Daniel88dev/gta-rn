import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';

import { useQuery } from '@/bootstrap/use-query';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { boundsOf } from '@/shared/domain';

import type { GetLegendQuery } from '../application/get-legend.query';
import type { GetMarkersQuery } from '../application/get-markers.query';
import type { GetRegionLabelsQuery } from '../application/get-region-labels.query';
import type { LocationId } from '../domain/location';
import type { LocationCategory } from '../domain/location-kind';
import { LocationCard } from './location-card';
import { MapCanvas } from './map-canvas';

/** Mobile starts with fewer pins than desktop: SVG redraws every pin when the zoom changes. */
const DEFAULT_CATEGORIES: readonly LocationCategory[] = ['collectible'];

export function MapScreen() {
  const { data: legend } = useQuery<GetLegendQuery>({ type: 'map/get-legend' });
  const { data: everything } = useQuery<GetMarkersQuery>({ type: 'map/get-markers' });
  const { data: regionLabels } = useQuery<GetRegionLabelsQuery>({
    type: 'map/get-region-labels',
    minLocations: 100,
  });
  const [categories, setCategories] = useState<readonly LocationCategory[]>(DEFAULT_CATEGORIES);
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<LocationId | undefined>();

  const { data: visible } = useQuery<GetMarkersQuery>({
    type: 'map/get-markers',
    filter: { categories, text: text || undefined, onlyOpen: true },
  });

  const colours = useMemo(
    () => new Map(legend?.flatMap((g) => g.kinds.map((k) => [k.key as string, k.colour] as const))),
    [legend],
  );
  const worldBounds = useMemo(() => (everything ? boundsOf(everything.markers) : null), [everything]);

  const toggle = (c: LocationCategory) =>
    setCategories((current) => (current.includes(c) ? current.filter((x) => x !== c) : [...current, c]));

  return (
    <View style={styles.container}>
      {worldBounds && visible && (
        <MapCanvas
          worldBounds={worldBounds}
          markers={visible.markers}
          colours={colours}
          regionLabels={regionLabels ?? []}
          selectedId={selected}
          onSelect={setSelected}
        />
      )}
      <SafeAreaView edges={['top']} style={styles.overlay} pointerEvents="box-none">
        <TextInput
          style={styles.search}
          placeholder="Search places, cards, races…"
          placeholderTextColor="#8a90a6"
          value={text}
          onChangeText={setText}
          clearButtonMode="while-editing"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {legend?.map((g) => {
            const on = categories.includes(g.category);
            return (
              <Pressable
                key={g.category}
                onPress={() => toggle(g.category)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <ThemedText type="smallBold" style={styles.chipText}>
                  {g.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.meta}>
          <ThemedText type="small" style={styles.metaText}>
            {visible ? `${visible.markers.length.toLocaleString()} pins` : 'Loading…'}
          </ThemedText>
          <Link href="/credits" style={styles.metaLink}>
            Data: Open GTA 6 Map, gtadb.org (CC BY 4.0)
          </Link>
        </View>
      </SafeAreaView>
      {selected && <LocationCard key={selected} id={selected} onClose={() => setSelected(undefined)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1622' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
    // The web tab bar floats over the top of the screen.
    paddingTop: Platform.OS === 'web' ? 72 : 0,
  },
  search: {
    marginTop: Spacing.two,
    backgroundColor: '#171922ee',
    color: '#ecedf2',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chips: { gap: Spacing.two },
  chip: {
    paddingVertical: Spacing.one + 2,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
    backgroundColor: '#171922dd',
    borderWidth: 1,
    borderColor: '#2b2f40',
  },
  chipOn: { backgroundColor: '#ff4f9a', borderColor: '#ff4f9a' },
  chipText: { color: '#ffffff' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { color: '#c9cddb', fontSize: 12 },
  metaLink: { color: '#8ab4ff', fontSize: 12 },
});
