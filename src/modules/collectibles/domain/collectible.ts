import type { Id } from '../../../shared/domain';

export type CollectibleId = Id<'Collectible'>;

export interface Collectible {
  readonly id: CollectibleId;
  readonly setName: string;
  readonly name: string;
  readonly locationId: string;
}

export interface CollectionProgress {
  readonly collectedIds: ReadonlySet<CollectibleId>;
}
