# GTA 6 Guide: Mobile

Mobile companion app for GTA 6 (iOS and Android): an interactive map plus a guide to quests and collectibles.

**Stack:** [Expo](https://docs.expo.dev/) SDK 58 (React Native 0.88) + TypeScript, with Expo Router for navigation.

## Getting started

```bash
npm install
npm start         # then press i / a, or scan the QR code with Expo Go
npm run web       # run in the browser
```

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run lint`      | ESLint (`eslint-config-expo` + Prettier)   |
| `npm run format`    | Prettier (write)                           |
| `npm run typecheck` | `tsc --noEmit`                             |
| `npm test`          | Vitest for the domain and application code |

## Architecture

Same bounded contexts and CQRS layer as the desktop app (`gta6-guide-desktop`).

```
src/
  app/                 Expo Router routes (screens only, kept thin)
  bootstrap/           composition root (wires adapters to buses) + React provider
  shared/
    domain/            Result, branded ids
    cqrs/              Command/Query types, CommandBus, QueryBus
  modules/
    map/               locations, coordinates, regions
    quests/            quest catalog, quest progress aggregate
    collectibles/      collectible sets and collection progress
      domain/          entities, invariants, repository ports (no React, no I/O)
      application/     *.command.ts / *.query.ts handlers
      infrastructure/  adapters (in-memory now; AsyncStorage / SQLite / JSON assets later)
      ui/              React Native components for this context
  components/, hooks/, constants/   generic UI building blocks and theme
```

Rules of thumb:

- Screens dispatch **commands** (`commands.dispatch(...)`) to change state and ask **queries** (`queries.ask(...)`) for read models. They never touch repositories.
- `domain/` imports nothing from React, React Native, Expo, or infrastructure.
- Contexts reference each other by id only (a quest step holds a `locationId`, not a `MapLocation`).
- `bootstrap/container.ts` is the only file that knows concrete adapters.

`shared/` and `modules/*/domain|application` are kept identical to the desktop app. If keeping them in sync by hand gets painful, the next step is extracting them into a shared package.

See `AGENTS.md` for notes aimed at AI coding agents working on this Expo project.
