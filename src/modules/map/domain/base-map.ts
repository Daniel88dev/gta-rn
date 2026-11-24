import type { Bounds } from '../../../shared/domain';

/**
 * What is drawn under the pins. Which imagery we may ship is still undecided (licensing),
 * so the base map is configuration chosen in the composition root, not something the UI hard-codes.
 */
export type BaseMapImagery =
  | { readonly type: 'none' }
  | {
      readonly type: 'tiles';
      /** URL template with {z}, {x} and {y}. Must point at assets we ship or host, never at a third party. */
      readonly urlTemplate: string;
      readonly tileSize: number;
      /** Game area covered by tile (0,0,0), in in-game metres. */
      readonly coverage: Bounds;
      readonly minZoom: number;
      readonly maxZoom: number;
    };

export interface BaseMap {
  readonly id: string;
  readonly name: string;
  readonly imagery: BaseMapImagery;
  /** Credit line to show on the map when this base map is used. */
  readonly attribution?: string;
}

/** Plain background with a grid. Always safe to ship. */
export const BLANK_BASE_MAP: BaseMap = { id: 'blank', name: 'Blank grid', imagery: { type: 'none' } };
