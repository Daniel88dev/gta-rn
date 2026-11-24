/**
 * The app's own content format: what `npm run content:import` writes and what the
 * infrastructure adapters read at start-up. Upstream formats never leak past the import pipeline.
 * Bump SCHEMA_VERSION when a breaking change is made.
 */
import type { Confidence, SpoilerLevel } from '../shared/domain';

export const SCHEMA_VERSION = 1;

export interface LocationRecord {
  readonly id: string;
  readonly name?: string | null;
  readonly nameConfirmed?: boolean;
  readonly kind: string;
  /** In-game metres. */
  readonly x?: number;
  readonly y?: number;
  readonly region?: string;
  readonly district?: string;
  readonly address?: string;
  readonly description?: string;
  readonly status?: 'open' | 'closed' | 'demolished' | 'under-construction';
  readonly enterable?: boolean;
  readonly tags?: readonly string[];
  readonly realWorld?: { readonly address: string; readonly lat?: number; readonly lng?: number };
  readonly source: string;
  readonly sourceRef?: string;
  readonly confidence?: Confidence;
}

export interface KindRecord {
  readonly key: string;
  readonly label: string;
  readonly category: 'collectible' | 'activity' | 'crime' | 'place' | 'other';
  readonly colour: string;
}

export interface AtlasContent {
  readonly schemaVersion: number;
  readonly generatedAt: string;
  readonly regions: readonly { readonly id: string; readonly name: string }[];
  readonly districts: readonly { readonly id: string; readonly regionId: string; readonly name: string }[];
  readonly kinds: readonly KindRecord[];
  readonly locations: readonly LocationRecord[];
}

/** Expected count of something, with where the number came from, because sources disagree. */
export interface TotalRecord {
  readonly total: number;
  readonly requiredFor100?: number;
  readonly note: string;
  readonly asOf: string;
}

export interface GuideItemRecord {
  readonly id: string;
  /** Collectible set key or activity kind key. */
  readonly kind: string;
  readonly name: string;
  /** Sub-group inside the kind, such as the card series. */
  readonly group?: string;
  readonly description?: string;
  readonly locationId?: string;
  readonly spoiler?: SpoilerLevel;
  readonly source: string;
  readonly sourceRef?: string;
  readonly confidence?: Confidence;
}

export interface GuideKindRecord {
  readonly key: string;
  readonly label: string;
  /** For activities: "activity" or "crime". */
  readonly group?: 'activity' | 'crime';
  readonly totals?: TotalRecord;
}

export interface MissionRecord {
  readonly id: string;
  readonly title: string;
  readonly kind: 'story' | 'side' | 'stranger' | 'other';
  readonly chapter?: { readonly number: number; readonly title: string };
  /** Position in the overall story order. */
  readonly order?: number;
  readonly spoiler?: SpoilerLevel;
  readonly source: string;
  readonly sourceRef?: string;
  readonly confidence?: Confidence;
}

export interface GuideContent {
  readonly schemaVersion: number;
  readonly generatedAt: string;
  readonly collectibleSets: readonly GuideKindRecord[];
  readonly collectibles: readonly GuideItemRecord[];
  readonly activityKinds: readonly GuideKindRecord[];
  readonly activities: readonly GuideItemRecord[];
  readonly missions: readonly MissionRecord[];
  readonly missionNote?: string;
}
