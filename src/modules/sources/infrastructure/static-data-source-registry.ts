import type { DataSource, DataSourceRegistry } from '../domain/data-source';

export class StaticDataSourceRegistry implements DataSourceRegistry {
  private readonly sources: readonly DataSource[];

  constructor(sources: readonly DataSource[]) {
    this.sources = sources;
  }

  async findAll() {
    return this.sources;
  }
}
