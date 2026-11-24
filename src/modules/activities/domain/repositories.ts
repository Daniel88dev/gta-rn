import type { Activity, ActivityId, ActivityKind } from './activity';
import type { ActivityLog } from './activity-log';

export interface ActivityCatalog {
  kinds(): Promise<readonly ActivityKind[]>;
  findAll(): Promise<readonly Activity[]>;
  findById(id: ActivityId): Promise<Activity | undefined>;
  findByLocation(locationId: string): Promise<readonly Activity[]>;
}

export interface ActivityLogStore {
  get(): Promise<ActivityLog>;
  save(log: ActivityLog): Promise<void>;
}
