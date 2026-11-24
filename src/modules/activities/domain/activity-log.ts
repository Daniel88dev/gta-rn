import { err, ok, type Result } from '../../../shared/domain';
import type { ActivityId } from './activity';

/** Aggregate: which activities the player has done. One per player profile. */
export interface ActivityLog {
  readonly doneIds: readonly ActivityId[];
}

export const EMPTY_ACTIVITY_LOG: ActivityLog = { doneIds: [] };

export const markDone = (log: ActivityLog, id: ActivityId, exists: boolean): Result<ActivityLog> => {
  if (!exists) return err({ code: 'ACTIVITY_NOT_FOUND', message: `Activity ${id} does not exist` });
  return ok(log.doneIds.includes(id) ? log : { doneIds: [...log.doneIds, id] });
};

export const markNotDone = (log: ActivityLog, id: ActivityId): ActivityLog =>
  log.doneIds.includes(id) ? { doneIds: log.doneIds.filter((d) => d !== id) } : log;
