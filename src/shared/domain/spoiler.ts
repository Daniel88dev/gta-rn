/** How much a piece of guide content gives away. The user picks the highest level they want to see. */
export const SPOILER_LEVELS = ['none', 'minor', 'major'] as const;
export type SpoilerLevel = (typeof SPOILER_LEVELS)[number];

export const isVisibleAt = (content: SpoilerLevel, allowed: SpoilerLevel): boolean =>
  SPOILER_LEVELS.indexOf(content) <= SPOILER_LEVELS.indexOf(allowed);
