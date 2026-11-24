import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { padBounds, type Bounds } from '../../../shared/domain';
import type { MapMarker } from '../application/get-markers.query';
import type { RegionLabel } from '../application/get-region-labels.query';
import type { LocationId } from '../domain/location';
import { fitWorld, nearest, screenToWorld, zoomAround, type Size } from './viewport';

interface Props {
  /** Area the whole dataset covers; fixed for the life of the map. */
  readonly worldBounds: Bounds;
  readonly markers: readonly MapMarker[];
  readonly colours: ReadonlyMap<string, string>;
  readonly regionLabels: readonly RegionLabel[];
  readonly selectedId?: LocationId;
  readonly onSelect: (id: LocationId | undefined) => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 40;
const PIN_RADIUS_PX = 4;
const TAP_REACH_PX = 18;
const GRID_STEP = 1000;

/**
 * Pan, pinch and tap map drawn with react-native-svg. The blank grid is the only base map on mobile for now;
 * tile imagery can be added behind the same BaseMap setting when one is licensed.
 */
export function MapCanvas({ worldBounds, markers, colours, regionLabels, selectedId, onSelect }: Props) {
  const [size, setSize] = useState<Size | null>(null);
  const [zoom, setZoom] = useState(1);
  const world = useMemo(() => padBounds(worldBounds, 0.03), [worldBounds]);

  const scale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const start = useSharedValue({ scale: 1, tx: 0, ty: 0 });
  const focalStart = useSharedValue({ x: 0, y: 0 });
  const viewSize = useSharedValue<Size>({ width: 1, height: 1 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
    viewSize.value = { width, height };
  };

  const handleTap = useCallback(
    (x: number, y: number, s: number, ttx: number, tty: number) => {
      if (!size) return;
      const at = screenToWorld({ x, y }, { scale: s, tx: ttx, ty: tty }, world, size);
      const reach = TAP_REACH_PX / (fitWorld(world, size).base * s);
      onSelect(nearest(markers, at, reach)?.id);
    },
    [size, world, markers, onSelect],
  );

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      start.value = { scale: scale.value, tx: tx.value, ty: ty.value };
    })
    .onUpdate((e) => {
      tx.value = start.value.tx + e.translationX;
      ty.value = start.value.ty + e.translationY;
    });

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      start.value = { scale: scale.value, tx: tx.value, ty: ty.value };
      focalStart.value = { x: e.focalX, y: e.focalY };
    })
    .onUpdate((e) => {
      const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, start.value.scale * e.scale));
      const t = zoomAround(start.value, focalStart.value, { x: e.focalX, y: e.focalY }, s, viewSize.value);
      scale.value = t.scale;
      tx.value = t.tx;
      ty.value = t.ty;
    })
    .onEnd(() => {
      scheduleOnRN(setZoom, scale.value);
    });

  const tap = Gesture.Tap()
    .maxDistance(10)
    .onEnd((e) => {
      scheduleOnRN(handleTap, e.x, e.y, scale.value, tx.value, ty.value);
    });

  const gesture = Gesture.Race(tap, Gesture.Simultaneous(pan, pinch));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: scale.value }],
  }));

  const fit = size ? fitWorld(world, size) : null;
  // Sizes in world units so pins and labels stay the same size on screen at the current zoom.
  const px = fit ? 1 / (fit.base * zoom) : 1;
  const selected = markers.find((m) => m.id === selectedId);

  const gridLines = useMemo(() => {
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let x = Math.ceil(world.minX / GRID_STEP) * GRID_STEP; x <= world.maxX; x += GRID_STEP) {
      lines.push({ key: `x${x}`, x1: x, y1: -world.maxY, x2: x, y2: -world.minY });
    }
    for (let y = Math.ceil(world.minY / GRID_STEP) * GRID_STEP; y <= world.maxY; y += GRID_STEP) {
      lines.push({ key: `y${y}`, x1: world.minX, y1: -y, x2: world.maxX, y2: -y });
    }
    return lines;
  }, [world]);

  return (
    <GestureDetector gesture={gesture}>
      <View style={styles.host} onLayout={onLayout} collapsable={false}>
        {size && (
          <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
            <Svg
              width={size.width}
              height={size.height}
              viewBox={`${world.minX} ${-world.maxY} ${world.maxX - world.minX} ${world.maxY - world.minY}`}
            >
              <G>
                {gridLines.map(({ key, ...l }) => (
                  <Line key={key} {...l} stroke="#1a2a3b" strokeWidth={px} />
                ))}
              </G>
              <G>
                {markers.map((m) => (
                  <Circle
                    key={m.id}
                    cx={m.x}
                    cy={-m.y}
                    r={PIN_RADIUS_PX * px}
                    fill={colours.get(m.kind) ?? '#cccccc'}
                    fillOpacity={m.confidence === 'unconfirmed' ? 0.45 : 0.95}
                    stroke="#0b0b0f"
                    strokeWidth={px}
                  />
                ))}
              </G>
              {selected && (
                <Circle
                  cx={selected.x}
                  cy={-selected.y}
                  r={9 * px}
                  stroke="#ffffff"
                  strokeWidth={2 * px}
                  fill="none"
                />
              )}
              <G>
                {regionLabels.map((r) => (
                  <SvgText
                    key={r.id}
                    x={r.anchor.x}
                    y={-r.anchor.y}
                    fontSize={11 * px}
                    fontWeight="700"
                    fontFamily="sans-serif"
                    fill="#e6e9f5"
                    stroke="#000000"
                    strokeWidth={0.4 * px}
                    textAnchor="middle"
                  >
                    {r.name.toUpperCase()}
                  </SvgText>
                ))}
              </G>
            </Svg>
          </Animated.View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1, overflow: 'hidden', backgroundColor: '#0a1622' },
});
