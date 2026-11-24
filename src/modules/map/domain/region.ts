import type { Id } from '../../../shared/domain';

export type RegionId = Id<'Region'>;
export type DistrictId = Id<'District'>;

/** A named area of Leonida, such as Vice City, Port Gellhorn or Key Lento. */
export interface Region {
  readonly id: RegionId;
  readonly name: string;
}

/** A neighbourhood inside a region, such as Little Cuba in Vice City. */
export interface District {
  readonly id: DistrictId;
  readonly regionId: RegionId;
  readonly name: string;
}
