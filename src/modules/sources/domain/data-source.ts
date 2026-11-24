import type { DataSourceId } from '../../../shared/domain';

export interface Licence {
  readonly name: string;
  readonly url: string;
}

/**
 * A dataset the app ships content from. Licences like CC BY require the credit line to be shown in the app,
 * so it lives in the domain rather than in a README.
 */
export interface DataSource {
  readonly id: DataSourceId;
  readonly name: string;
  readonly homepage: string;
  readonly licence: Licence;
  /** Exact credit line the licence requires us to show. */
  readonly credit: string;
  /** What we changed compared with upstream (CC BY asks for this). */
  readonly changes?: string;
  /** Upstream version we imported, such as a commit hash or date. */
  readonly version?: string;
}

/** Shown next to the credits: the app is a fan project and must say so. */
export const APP_DISCLAIMER =
  'Unofficial fan-made companion app. Not affiliated with, endorsed or sponsored by Rockstar Games or Take-Two Interactive. ' +
  '"Grand Theft Auto", "GTA", "Leonida" and in-game place names are trademarks of their respective owners.';

export interface DataSourceRegistry {
  findAll(): Promise<readonly DataSource[]>;
}
