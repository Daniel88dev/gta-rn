import type { Activity, ActivityId, ActivityKind } from '../domain/activity';
import { EMPTY_ACTIVITY_LOG, type ActivityLog } from '../domain/activity-log';
import type { ActivityCatalog, ActivityLogStore } from '../domain/repositories';

export class InMemoryActivityCatalog implements ActivityCatalog {
  private readonly kindList: readonly ActivityKind[];
  private readonly items: readonly Activity[];
  private readonly byLocation = new Map<string, Activity[]>();

  constructor(kinds: readonly ActivityKind[], items: readonly Activity[]) {
    this.kindList = kinds;
    this.items = items;
    for (const a of items) {
      if (!a.locationId) continue;
      const list = this.byLocation.get(a.locationId) ?? [];
      list.push(a);
      this.byLocation.set(a.locationId, list);
    }
  }

  async kinds() {
    return this.kindList;
  }
  async findAll() {
    return this.items;
  }
  async findById(id: ActivityId) {
    return this.items.find((a) => a.id === id);
  }
  async findByLocation(locationId: string) {
    return this.byLocation.get(locationId) ?? [];
  }
}

export class InMemoryActivityLogStore implements ActivityLogStore {
  private log: ActivityLog = EMPTY_ACTIVITY_LOG;
  async get() {
    return this.log;
  }
  async save(log: ActivityLog) {
    this.log = log;
  }
}
