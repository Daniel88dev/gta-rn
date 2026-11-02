/** Branded string ids: a QuestId can't be passed where a LocationId is expected. */
export type Id<Brand extends string> = string & { readonly __brand: Brand };

export const asId = <Brand extends string>(value: string): Id<Brand> => value as Id<Brand>;
