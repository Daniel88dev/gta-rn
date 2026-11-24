# GTA 6 Guide: Mobile

Mobile companion app for GTA 6 (iOS and Android): an interactive map plus a guide to quests and collectibles.

**Stack:** [Expo](https://docs.expo.dev/) SDK 58 (React Native 0.88) + TypeScript, with Expo Router for navigation.

## Getting started

```bash
npm install
npm start         # then press i / a, or scan the QR code with Expo Go
npm run web       # run in the browser
```

| Script                            | What it does                                     |
| --------------------------------- | ------------------------------------------------ |
| `npm run lint`                    | ESLint (`eslint-config-expo` + Prettier)         |
| `npm run format`                  | Prettier (write)                                 |
| `npm run typecheck`               | `tsc --noEmit`                                   |
| `npm test`                        | Vitest for the domain and application code       |
| `npm run content:import -- <dir>` | Rebuild `src/content` from the research datasets |

## Architecture

Same bounded contexts and CQRS layer as the desktop app (`gta6-guide-desktop`).

```
src/
  app/                 Expo Router routes (screens only, kept thin)
  bootstrap/           composition root (container.ts), content loader, React provider, useQuery
  shared/
    domain/            shared kernel: Result, branded ids, GameCoordinate, Provenance/Confidence, SpoilerLevel
    cqrs/              Command/Query types, CommandBus, QueryBus
  modules/
    map/               atlas: locations (pins), layer kinds, regions/districts, base map choice
    quests/            missions: chapters, prerequisites, steps, quest progress aggregate
    collectibles/      collectible sets with expected totals, collection progress aggregate
    activities/        activities and crime spots, activity log aggregate
    sources/           data sources, licences and credit lines (credits screen)
      domain/          entities, invariants, repository ports (no React, no I/O)
      application/     *.command.ts / *.query.ts handlers
      infrastructure/  adapters: in-memory repositories + hydration from src/content
      ui/              React Native components for this context
  content/             the app's own content format (format.ts), data-sources.ts, generated atlas.json + guide.json
  content-pipeline/    import ACL: upstream datasets -> src/content (build time only, see its README)
```

Rules of thumb:

- Screens dispatch **commands** (`commands.dispatch(...)`) to change state and ask **queries** (`queries.ask(...)`) for read models. They never touch repositories.
- `domain/` imports nothing from React, React Native, Expo, or infrastructure.
- Contexts reference each other by id only (a collectible holds a `locationId`, not a `MapLocation`).
- `bootstrap/container.ts` is the only file that knows concrete adapters.

`shared/`, `content/`, `content-pipeline/`, `bootstrap/container.ts` and `modules/*/{domain,application,infrastructure}` are kept identical to the desktop app. If keeping them in sync by hand gets painful, the next step is extracting them into a shared package.

## Content

Map pins, collectibles, activities and missions come from openly licensed community datasets
(Open GTA 6 Map and gtadb.org under CC BY 4.0, the awesome-gta-6 mission list under CC0).
They are converted at build time by `src/content-pipeline` into `src/content/atlas.json` and `src/content/guide.json`,
which are bundled with require(). The app never fetches third-party data at runtime.

```bash
npm run content:import -- <path to the project's research/data folder>
```

- CC BY requires the credit lines in `src/content/data-sources.ts` to be shown in the app. The Credits screen does that. Don't remove it.
- Don't add Rockstar media (screenshots, artwork, the official printable map) or anything traced from it.
- The base map is configuration (`createContainer(content, { baseMap })`). It is a blank grid until a licensed base map is chosen.
- Progress (found, done, completed) is in memory for now. Persisting it means swapping the `*ProgressStore` / `*LogStore` adapters in the composition root.

See `AGENTS.md` for notes aimed at AI coding agents working on this Expo project.
