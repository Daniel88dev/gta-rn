import type { Collectible, CollectibleId, CollectibleSet } from '../domain/collectible';
import { EMPTY_COLLECTION, type CollectionProgress } from '../domain/collection-progress';
import type { CollectibleCatalog, CollectionProgressStore } from '../domain/repositories';

export class InMemoryCollectibleCatalog implements CollectibleCatalog {
  private readonly setList: readonly CollectibleSet[];
  private readonly items: readonly Collectible[];
  private readonly byLocation = new Map<string, Collectible[]>();

  constructor(sets: readonly CollectibleSet[], items: readonly Collectible[]) {
    this.setList = sets;
    this.items = items;
    for (const c of items) {
      if (!c.locationId) continue;
      const list = this.byLocation.get(c.locationId) ?? [];
      list.push(c);
      this.byLocation.set(c.locationId, list);
    }
  }

  async sets() {
    return this.setList;
  }
  async findAll() {
    return this.items;
  }
  async findById(id: CollectibleId) {
    return this.items.find((c) => c.id === id);
  }
  async findByLocation(locationId: string) {
    return this.byLocation.get(locationId) ?? [];
  }
}

/** Swap for a persistent adapter later; the domain doesn't change. */
export class InMemoryCollectionProgressStore implements CollectionProgressStore {
  private progress: CollectionProgress = EMPTY_COLLECTION;
  async get() {
    return this.progress;
  }
  async save(progress: CollectionProgress) {
    this.progress = progress;
  }
}
