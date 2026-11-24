# Content pipeline

Anti-corruption layer between upstream datasets and the app's own content format (`src/content/format.ts`).
It runs at build time on a developer machine, never in the app: the app never fetches third-party data at runtime.

```bash
npm run content:import -- <path to research/data>
```

| Upstream                   | File                                              | Becomes                                      |
| -------------------------- | ------------------------------------------------- | -------------------------------------------- |
| gtadb.org (CC BY 4.0)      | `gtadb-landmarks-gta6.normalized.json`            | map places (tags mapped to layers)           |
| Open GTA 6 Map (CC BY 4.0) | `open-gta6-map/categories.json`, `locations.json` | map layers, collectibles, activities, places |
| awesome-gta-6 (CC0)        | `awesome-gta6-missions.json`                      | story missions                               |

Rules:

- Every record keeps its upstream id in `sourceRef` and its `source`, so re-imports and credits work.
- Open GTA 6 Map `screenshot` fields are dropped (in-game captures are Rockstar's copyright). gtadb photos are never imported.
- Credit lines live in `src/content/data-sources.ts` and are shown on the credits screen. Update them when a source changes.
- Upstream formats stay in this folder. Everything else in the app sees only `src/content/*.json`.
