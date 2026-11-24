/** awesome-gta-6 data/missions.json (CC0). Names only. */
import type { MissionRecord } from '../content/format';

export const MISSIONS_SOURCE = 'awesome-gta-6';

export interface MissionsFile {
  readonly updated: string;
  readonly count_note?: string;
  readonly chapters: readonly {
    readonly chapter: number;
    readonly title: string;
    readonly missions: readonly {
      readonly number: number;
      readonly chapter_order: number;
      readonly name: string;
      readonly spoiler: boolean;
    }[];
  }[];
}

export const fromMissions = (file: MissionsFile): MissionRecord[] =>
  file.chapters.flatMap((c) =>
    c.missions.map((m) => ({
      id: `story-${String(m.number).padStart(3, '0')}`,
      title: m.spoiler ? `Mission ${m.number}` : m.name,
      kind: 'story' as const,
      chapter: { number: c.chapter, title: c.title },
      order: m.number,
      // Mission names give the plot away a little; the ones the source hides give it away a lot.
      spoiler: m.spoiler ? ('major' as const) : ('minor' as const),
      source: MISSIONS_SOURCE,
      sourceRef: String(m.number),
    })),
  );
