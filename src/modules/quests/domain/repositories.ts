import type { Quest, QuestId, QuestProgress } from './quest';

export interface QuestCatalog {
  findAll(): Promise<readonly Quest[]>;
  findById(id: QuestId): Promise<Quest | undefined>;
}

export interface QuestProgressStore {
  get(questId: QuestId): Promise<QuestProgress>;
  getAll(): Promise<readonly QuestProgress[]>;
  save(progress: QuestProgress): Promise<void>;
}
