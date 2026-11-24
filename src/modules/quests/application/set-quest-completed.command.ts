import type { Command, CommandHandler } from '../../../shared/cqrs';
import { err, ok } from '../../../shared/domain';
import { completeQuest, reopenQuest, type QuestId } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

/** Tick or untick a whole mission. */
export interface SetQuestCompletedCommand extends Command<'quests/set-completed'> {
  readonly questId: QuestId;
  readonly completed: boolean;
}

export const setQuestCompletedHandler =
  (catalog: QuestCatalog, store: QuestProgressStore): CommandHandler<SetQuestCompletedCommand> =>
  async ({ questId, completed }) => {
    const quest = await catalog.findById(questId);
    if (!quest) return err({ code: 'QUEST_NOT_FOUND', message: `Quest ${questId} not found` });
    const progress = await store.get(questId);
    await store.save(completed ? completeQuest(quest, progress) : reopenQuest(progress));
    return ok(undefined);
  };
