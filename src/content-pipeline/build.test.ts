import { describe, expect, it } from 'vitest';
import { buildContent } from './build';
import { gtadbKind } from './gtadb';
import { ogmToGame } from './open-gta6-map';

const landmark = (over: Partial<Parameters<typeof buildContent>[0]['gtadb']['landmarks'][number]> = {}) => ({
  id: 'L1',
  inGameAddress: 'Vice Regal, Washington Beach, Vice Beach',
  name: 'Vice Regal',
  nameConfirmed: true,
  area: 'Vice Beach',
  district: 'Washington Beach',
  inGameXY: [1409.4, 2803.2] as const,
  realWorldAddress: 'Real hotel',
  realWorldLatLng: [25.9, -80.1] as const,
  tags: ['hotel', 'enterable'],
  ...over,
});

const input = () => ({
  generatedAt: '2026-11-24',
  gtadb: {
    meta: { count: 2 },
    landmarks: [
      landmark(),
      landmark({ id: 'L2', name: null, area: 'Vice CIty', tags: ['#gas', 'unconfirmed'] }),
    ],
  },
  ogmCategories: {
    kinds: [
      { key: 'card', name: 'Collectible cards', colour: '#ffd166', group: 'Collectibles' as const },
      { key: 'stunt', name: 'Stunts', colour: '#000000', group: 'Activities' as const },
      { key: 'hotel', name: 'Hotels', colour: '#111111', group: 'Places' as const },
      { key: 'flamingo', name: 'Cocaine flamingos', colour: '#ff6fae', group: 'Collectibles' as const },
    ],
  },
  ogmLocations: [
    // Same hotel as gtadb L1, 556/424.4 map units = 1408/2803.2 metres.
    {
      id: 'hotel-1',
      kind: 'hotel',
      x: 556,
      y: 424.4,
      name: 'Vice Regal',
      type: 'Hotel',
      description: '',
      screenshot: 's.jpg',
    },
    {
      id: 'card-1',
      kind: 'card',
      x: 556.1,
      y: 424.5,
      name: 'Card A',
      type: 'Nine1nine card',
      description: 'Behind the bar',
      area: 'Vice Beach',
    },
    { id: 'stunt-1', kind: 'stunt', x: 100, y: 100, name: 'Far jump', type: 'Stunt jump', description: '' },
  ],
  missions: {
    updated: '2026-11-20',
    chapters: [
      {
        chapter: 1,
        title: 'Chapter one',
        missions: [
          { number: 1, chapter_order: 1, name: 'Prologue', spoiler: false },
          { number: 2, chapter_order: 2, name: '[Spoiler]', spoiler: true },
        ],
      },
    ],
  },
});

describe('content pipeline', () => {
  it('converts Open GTA 6 Map units to in-game metres', () => {
    expect(ogmToGame(556, 424.4)).toEqual({ x: 1408, y: 2803.2 });
  });

  it('maps gtadb tags to shared layers', () => {
    expect(gtadbKind(['#safehouse', 'residential'])).toBe('safehouse');
    expect(gtadbKind(['#gas'])).toBe('shop');
    expect(gtadbKind(['residential'])).toBe('building');
  });

  it('merges duplicate places and keeps gtadb details', () => {
    const { atlas, report } = buildContent(input());
    expect(report.gtadbMergedIntoOgm).toBe(1);
    const hotel = atlas.locations.find((l) => l.id === 'ogm:hotel-1');
    expect(hotel).toMatchObject({
      district: 'vice-beach/washington-beach',
      enterable: true,
      region: 'vice-beach',
    });
    expect(atlas.locations.some((l) => l.id === 'gtadb:L1')).toBe(false);
    expect(JSON.stringify(atlas)).not.toContain('s.jpg');
  });

  it('normalises region typos and infers missing regions from nearby landmarks', () => {
    const { atlas } = buildContent(input());
    expect(atlas.locations.find((l) => l.id === 'gtadb:L2')).toMatchObject({
      region: 'vice-city',
      confidence: 'unconfirmed',
    });
    expect(atlas.locations.find((l) => l.id === 'ogm:hotel-1')?.region).toBe('vice-beach');
    expect(atlas.locations.find((l) => l.id === 'ogm:stunt-1')?.region).toBeUndefined();
  });

  it('creates guide items, empty sets with expected totals, and missions', () => {
    const { guide } = buildContent(input());
    expect(guide.collectibles).toEqual([
      expect.objectContaining({
        id: 'ogm:card-1',
        kind: 'card',
        group: 'Nine1nine',
        locationId: 'ogm:card-1',
      }),
    ]);
    expect(guide.activities.map((a) => a.id)).toEqual(['ogm:stunt-1']);
    expect(guide.collectibleSets.find((s) => s.key === 'flamingo')?.totals?.total).toBe(125);
    expect(guide.missions.map((m) => [m.title, m.spoiler])).toEqual([
      ['Prologue', 'minor'],
      ['Mission 2', 'major'],
    ]);
  });
});
