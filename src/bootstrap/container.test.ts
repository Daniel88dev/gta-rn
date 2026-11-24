import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { asId } from '../shared/domain';
import type { GetLegendQuery } from '../modules/map/application/get-legend.query';
import type { GetMarkersQuery } from '../modules/map/application/get-markers.query';
import type { GetCollectiblesAtLocationQuery } from '../modules/collectibles/application/get-collectibles-at-location.query';
import type { GetCollectionStatsQuery } from '../modules/collectibles/application/get-collection-stats.query';
import type { GetCreditsQuery } from '../modules/sources/application/get-credits.query';
import { createContainer, type AppContent } from './container';

const read = (file: string) =>
  JSON.parse(readFileSync(join(import.meta.dirname, '..', 'content', file), 'utf8'));
const content: AppContent = { atlas: read('atlas.json'), guide: read('guide.json') };

describe('container with the bundled content', () => {
  const { queries, commands } = createContainer(content);

  it('serves markers, filtered by layer', async () => {
    const all = await queries.ask<GetMarkersQuery>({ type: 'map/get-markers' });
    expect(all.markers.length).toBeGreaterThan(8000);
    const cards = await queries.ask<GetMarkersQuery>({
      type: 'map/get-markers',
      filter: { kinds: [asId('card')] },
    });
    expect(cards.markers.length).toBeGreaterThan(400);
    expect(cards.markers.every((m) => m.kind === 'card')).toBe(true);
  });

  it('groups layers in the legend', async () => {
    const legend = await queries.ask<GetLegendQuery>({ type: 'map/get-legend' });
    expect(legend.map((g) => g.category)).toEqual(['collectible', 'activity', 'crime', 'place', 'other']);
  });

  it('tracks a collectible found from the map', async () => {
    const id = 'ogm:collectible-card-001';
    const [card] = await queries.ask<GetCollectiblesAtLocationQuery>({
      type: 'collectibles/get-at-location',
      locationId: id,
    });
    expect(card?.found).toBe(false);
    const r = await commands.dispatch({
      type: 'collectibles/set-found',
      collectibleId: card!.id,
      found: true,
    });
    expect(r.ok).toBe(true);
    const stats = await queries.ask<GetCollectionStatsQuery>({ type: 'collectibles/get-stats' });
    expect(stats.find((s) => s.setId === 'card')?.found).toBe(1);
  });

  it('exposes the required credit lines', async () => {
    const credits = await queries.ask<GetCreditsQuery>({ type: 'sources/get-credits' });
    const lines = credits.sources.map((s) => s.credit).join('\n');
    expect(lines).toContain('gtadb.org and all contributors');
    expect(lines).toContain('Open GTA 6 Map (fbritoferreira), CC BY 4.0');
    expect(credits.disclaimer).toMatch(/Not affiliated/);
  });
});
