import type { Collectible, CollectibleId, CollectibleSet } from './collectible';
import type { CollectionProgress } from './collection-progress';

export interface CollectibleCatalog {
  sets(): Promise<readonly CollectibleSet[]>;
  findAll(): Promise<readonly Collectible[]>;
  findById(id: CollectibleId): Promise<Collectible | undefined>;
  findByLocation(locationId: string): Promise<readonly Collectible[]>;
}

export interface CollectionProgressStore {
  get(): Promise<CollectionProgress>;
  save(progress: CollectionProgress): Promise<void>;
}
