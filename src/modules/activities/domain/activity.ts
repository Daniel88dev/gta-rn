import type { Id, Provenance, SpoilerLevel } from '../../../shared/domain';

export type ActivityKindId = Id<'ActivityKind'>;
export type ActivityId = Id<'Activity'>;

/** Side activities (races, stunts, hunting) versus crime opportunities (safes, stores, ATMs). */
export type ActivityGroup = 'activity' | 'crime';

export interface ActivityExpectedTotal {
  readonly total: number;
  readonly requiredFor100?: number;
  readonly note: string;
  readonly asOf: string;
}

/** A type of activity, such as "Stunt jumps" or "Safes". */
export interface ActivityKind {
  readonly id: ActivityKindId;
  readonly name: string;
  readonly group: ActivityGroup;
  readonly expected?: ActivityExpectedTotal;
}

/** One instance the player can do, such as a single stunt jump or race. */
export interface Activity {
  readonly id: ActivityId;
  readonly kindId: ActivityKindId;
  readonly name: string;
  readonly description?: string;
  /** Map location id (by id only). */
  readonly locationId?: string;
  readonly spoilerLevel: SpoilerLevel;
  readonly provenance: Provenance;
}
