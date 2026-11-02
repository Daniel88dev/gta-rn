import type { Query, QueryHandler } from '../../../shared/cqrs';
import { isQuestComplete, type QuestId } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

/** Read model shaped for the list screen, not a domain object. */
export interface QuestListItem {
  readonly id: QuestId;
  readonly title: string;
  readonly stepsDone: number;
  readonly stepsTotal: number;
  readonly completed: boolean;
}

export type GetQuestListQuery = Query<'quests/get-list', readonly QuestListItem[]>;

export const getQuestListHandler =
  (catalog: QuestCatalog, store: QuestProgressStore): QueryHandler<GetQuestListQuery> =>
  async () => {
    const quests = await catalog.findAll();
    return Promise.all(
      quests.map(async (quest) => {
        const progress = await store.get(quest.id);
        return {
          id: quest.id,
          title: quest.title,
          stepsDone: progress.completedStepIds.length,
          stepsTotal: quest.steps.length,
          completed: isQuestComplete(quest, progress),
        };
      }),
    );
  };
