/**
 * Expected totals per collectible set and activity kind. Facts (counts) checked across public guides;
 * no guide text is copied. Sources disagree, so each total carries a note and a date.
 */
import type { TotalRecord } from '../content/format';

const AS_OF = '2026-11-24';
const NOTE = 'Consensus of public guides (Vice Cheats, GTA Zone, Game Checklists, KeenGamer, PowerPyx)';

const t = (total: number, requiredFor100?: number, note = NOTE): TotalRecord => ({
  total,
  requiredFor100,
  note,
  asOf: AS_OF,
});

export const EXPECTED_TOTALS: Readonly<Record<string, TotalRecord>> = {
  card: t(480, undefined, `${NOTE}. 18 sets; 15 complete sets count towards 100%`),
  flamingo: t(125, 100),
  waink: t(100, 100, `${NOTE}. Guides list about 96 to 100+`),
  underwater: t(33, 33),
  kenton: t(7, 5, `${NOTE}. One source says 8`),
  magazine: t(34, 30, `${NOTE}. Includes 7 book swaps; the map lists editions separately`),
  meditation: t(18, 15, `${NOTE}. 18 meditations at 10 spots`),
  playlist: t(2, 2),
  bret: t(15, 15),
  streetart: t(112, undefined, `${NOTE}. Not needed for 100%`),
  mural: t(5, undefined, `${NOTE}. Not needed for 100%`),
  stunt: t(130, undefined, `${NOTE}. Stunts of all types: 397, of which 300 count towards 100%`),
  bridge: t(202),
  knife: t(40),
  basejump: t(25),
};
