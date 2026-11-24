/**
 * Where a piece of content came from and how much we trust it.
 * Every location, quest, collectible and activity carries one, so licences can be credited
 * and pre-launch guesses can be found and cleaned up later.
 */
import type { Id } from './id';

/** Id of a DataSource in the sources context (referenced by id only). */
export type DataSourceId = Id<'DataSource'>;

/** Ordered from least to most trusted. */
export const CONFIDENCE_LEVELS = ['unconfirmed', 'community', 'confirmed-in-game', 'official'] as const;
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const confidenceRank = (c: Confidence): number => CONFIDENCE_LEVELS.indexOf(c);

export const isAtLeast = (actual: Confidence, minimum: Confidence): boolean =>
  confidenceRank(actual) >= confidenceRank(minimum);

export interface Provenance {
  readonly sourceId: DataSourceId;
  /** The record's id in the upstream source, so it can be matched on re-import. */
  readonly sourceRef?: string;
  readonly confidence: Confidence;
}
