import { asId } from '../../../shared/domain';
import type { GuideItemRecord, GuideKindRecord } from '../../../content/format';
import type { Activity, ActivityKind } from '../domain/activity';

export const hydrateActivityKind = (r: GuideKindRecord): ActivityKind => ({
  id: asId(r.key),
  name: r.label,
  group: r.group ?? 'activity',
  expected: r.totals,
});

export const hydrateActivity = (r: GuideItemRecord): Activity => ({
  id: asId(r.id),
  kindId: asId(r.kind),
  name: r.name,
  description: r.description,
  locationId: r.locationId,
  spoilerLevel: r.spoiler ?? 'none',
  provenance: { sourceId: asId(r.source), sourceRef: r.sourceRef, confidence: r.confidence ?? 'community' },
});
