import { asId } from '../../../shared/domain';
import type { GuideItemRecord, GuideKindRecord } from '../../../content/format';
import type { Collectible, CollectibleSet } from '../domain/collectible';

export const hydrateCollectibleSet = (r: GuideKindRecord): CollectibleSet => ({
  id: asId(r.key),
  name: r.label,
  expected: r.totals,
});

export const hydrateCollectible = (r: GuideItemRecord): Collectible => ({
  id: asId(r.id),
  setId: asId(r.kind),
  name: r.name,
  group: r.group,
  description: r.description,
  locationId: r.locationId,
  spoilerLevel: r.spoiler ?? 'none',
  provenance: { sourceId: asId(r.source), sourceRef: r.sourceRef, confidence: r.confidence ?? 'community' },
});
