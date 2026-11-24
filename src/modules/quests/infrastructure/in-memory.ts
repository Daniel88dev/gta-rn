import { emptyProgress, type Quest, type QuestId, type QuestProgress } from '../domain/quest';
import type { QuestCatalog, QuestProgressStore } from '../domain/repositories';

export class InMemoryQuestCatalog implements QuestCatalog {
  private readonly quests: readonly Quest[];
  constructor(quests: readonly Quest[]) {
    this.quests = quests;
  }
  async findAll() {
    return this.quests;
  }
  async findById(id: QuestId) {
    return this.quests.find((q) => q.id === id);
  }
}

/** Swap for a Tauri-store / AsyncStorage / SQLite adapter later; the domain doesn't change. */
export class InMemoryQuestProgressStore implements QuestProgressStore {
  private readonly data = new Map<QuestId, QuestProgress>();
  async get(questId: QuestId) {
    return this.data.get(questId) ?? emptyProgress(questId);
  }
  async getAll() {
    return [...this.data.values()];
  }
  async save(progress: QuestProgress) {
    this.data.set(progress.questId, progress);
  }
}
