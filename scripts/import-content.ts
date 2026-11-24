/**
 * Regenerates src/content/atlas.json and src/content/guide.json from the research datasets.
 * Usage: npm run content:import -- <path to research/data>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildContent } from '../src/content-pipeline/build';

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: npm run content:import -- <path to research/data>');
  process.exit(1);
}

const read = (file: string) => JSON.parse(readFileSync(join(dir, file), 'utf8'));
const out = (file: string) => join(import.meta.dirname, '..', 'src', 'content', file);

const { atlas, guide, report } = buildContent({
  gtadb: read('gtadb-landmarks-gta6.normalized.json'),
  ogmCategories: read('open-gta6-map/categories.json'),
  ogmLocations: read('open-gta6-map/locations.json'),
  missions: read('awesome-gta6-missions.json'),
  generatedAt: new Date().toISOString().slice(0, 10),
});

/** One record per line: compact, but a re-import still gives a readable diff. */
const serialise = (content: object) =>
  '{\n' +
  Object.entries(content)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${JSON.stringify(key)}: [\n${value.map((v) => '  ' + JSON.stringify(v)).join(',\n')}\n]`
        : `${JSON.stringify(key)}: ${JSON.stringify(value)}`,
    )
    .join(',\n') +
  '\n}\n';

writeFileSync(out('atlas.json'), serialise(atlas));
writeFileSync(out('guide.json'), serialise(guide));
console.table(report);
