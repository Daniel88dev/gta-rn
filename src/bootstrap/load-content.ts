/**
 * Mobile: content ships inside the app bundle (no network, no third-party fetch).
 * `require` keeps TypeScript from inferring a type for the 2 MB atlas file.
 */
import type { AtlasContent, GuideContent } from '../content/format';
import type { AppContent } from './container';

export const loadContent = (): AppContent => ({
  atlas: require('../content/atlas.json') as AtlasContent,
  guide: require('../content/guide.json') as GuideContent,
});
