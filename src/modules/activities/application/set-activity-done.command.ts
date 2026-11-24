import type { Command, CommandHandler } from '../../../shared/cqrs';
import { ok } from '../../../shared/domain';
import type { ActivityId } from '../domain/activity';
import { markDone, markNotDone } from '../domain/activity-log';
import type { ActivityCatalog, ActivityLogStore } from '../domain/repositories';

export interface SetActivityDoneCommand extends Command<'activities/set-done'> {
  readonly activityId: ActivityId;
  readonly done: boolean;
}

export const setActivityDoneHandler =
  (catalog: ActivityCatalog, store: ActivityLogStore): CommandHandler<SetActivityDoneCommand> =>
  async ({ activityId, done }) => {
    const log = await store.get();
    if (!done) {
      await store.save(markNotDone(log, activityId));
      return ok(undefined);
    }
    const result = markDone(log, activityId, !!(await catalog.findById(activityId)));
    if (!result.ok) return result;
    await store.save(result.value);
    return ok(undefined);
  };
