import { asId } from '../../../shared/domain';
import type { MissionRecord } from '../../../content/format';
import type { Quest } from '../domain/quest';

export const hydrateQuest = (r: MissionRecord): Quest => ({
  id: asId(r.id),
  title: r.title,
  kind: r.kind,
  chapter: r.chapter,
  order: r.order,
  prerequisiteIds: [],
  steps: [],
  spoilerLevel: r.spoiler ?? 'none',
  provenance: { sourceId: asId(r.source), sourceRef: r.sourceRef, confidence: r.confidence ?? 'community' },
});
