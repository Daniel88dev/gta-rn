import type { Id, Provenance, SpoilerLevel } from '../../../shared/domain';

export type CollectibleSetId = Id<'CollectibleSet'>;
export type CollectibleId = Id<'Collectible'>;

/**
 * How many items a set is expected to have. Sources disagree and change as players find more,
 * so totals are data with a note and a date, never constants.
 */
export interface ExpectedTotal {
  readonly total: number;
  /** How many count towards 100% completion, if not all. */
  readonly requiredFor100?: number;
  readonly note: string;
  readonly asOf: string;
}

/** A family of collectibles, such as "Collectible cards" or "Hidden packages". */
export interface CollectibleSet {
  readonly id: CollectibleSetId;
  readonly name: string;
  readonly expected?: ExpectedTotal;
}

export interface Collectible {
  readonly id: CollectibleId;
  readonly setId: CollectibleSetId;
  readonly name: string;
  /** Sub-group inside the set, such as the card series. */
  readonly group?: string;
  readonly description?: string;
  /** Where to find it, as a map location id (by id only, no import from the map context). */
  readonly locationId?: string;
  readonly spoilerLevel: SpoilerLevel;
  readonly provenance: Provenance;
}
