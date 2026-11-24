import type { Query, QueryHandler } from '../../../shared/cqrs';
import { isVisibleAt, type SpoilerLevel } from '../../../shared/domain';
import { isQuestComplete, type Chapter, type QuestId, type QuestKind } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

/** Read model shaped for the list screen, not a domain object. */
export interface QuestListItem {
  readonly id: QuestId;
  /** Replaced with a placeholder when the title is above the allowed spoiler level. */
  readonly title: string;
  readonly hidden: boolean;
  readonly kind: QuestKind;
  readonly chapter?: Chapter;
  readonly order?: number;
  readonly stepsDone: number;
  readonly stepsTotal: number;
  readonly completed: boolean;
}

export interface GetQuestListQuery extends Query<'quests/get-list', readonly QuestListItem[]> {
  readonly kind?: QuestKind;
  /** Highest spoiler level the player wants to see. Defaults to "none". */
  readonly maxSpoiler?: SpoilerLevel;
}

const hiddenTitle = (order?: number) =>
  order ? `Mission ${order} (hidden: spoiler)` : 'Hidden mission (spoiler)';

export const getQuestListHandler =
  (catalog: QuestCatalog, store: QuestProgressStore): QueryHandler<GetQuestListQuery> =>
  async ({ kind, maxSpoiler = 'none' }) => {
    const quests = (await catalog.findAll()).filter((q) => !kind || q.kind === kind);
    const progress = new Map((await store.getAll()).map((p) => [p.questId, p]));
    return quests
      .map((quest) => {
        const p = progress.get(quest.id) ?? { questId: quest.id, completedStepIds: [], completed: false };
        const hidden = !isVisibleAt(quest.spoilerLevel, maxSpoiler);
        return {
          id: quest.id,
          title: hidden ? hiddenTitle(quest.order) : quest.title,
          hidden,
          kind: quest.kind,
          chapter: quest.chapter,
          order: quest.order,
          stepsDone: p.completedStepIds.length,
          stepsTotal: quest.steps.length,
          completed: isQuestComplete(quest, p),
        };
      })
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  };
