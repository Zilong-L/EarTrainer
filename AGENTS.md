# Repository Guidelines

## Project Structure & Module Organization
- `src/`: App code.
  - `components/`: Reusable React components (PascalCase `.tsx`).
  - `pages/`: Route-level features (e.g., `ChordTrainer`, `EarTrainers`). Co-locate feature stores/components.
  - `stores/`: Global Zustand stores (e.g., `soundSettingsStore.ts`).
  - `utils/`: Shared helpers (`Tone/`, `ChordTrainer/`, `common/`).
  - `styles`: Global CSS (Tailwind-first; CSS for overrides).
  - `assets/`: Fonts/images processed by Vite.
- `public/`: Static files and i18n (`public/locales/`).
- `dist/`: Build output (generated).
- `scripts/`: Utility scripts (e.g., `scripts/update-html.sh`).

## Build, Test, and Development Commands
- `npm run dev`: Start Vite dev server (with `--host`).
- `npm run build`: Production build. Runs `postbuild` to tweak `dist/index.html`.
- `npm run preview`: Preview the built app locally.
- `npm run lint` | `npm run lint:fix`: Check/fix ESLint issues.
- `npm run format` | `npm run format:check`: Prettier write/check.
Notes: Use Node 22 (see `README.md`). After build, `scripts/update-html.sh` updates favicon/title.

## Coding Style & Naming Conventions
- Language: TypeScript preferred for new code; React 18.
- Lint/format: ESLint v9 (flat config) + Prettier. 2 spaces, single quotes, semicolons, LF.
- Components/hooks: `PascalCase` for components, `useX` for hooks. Feature-only pieces live under that feature in `src/pages/...`.
- Stores: Zustand stores in `src/stores` or feature stores under feature dirs; file names like `somethingStore.ts`.
- Imports: Use aliases from `vite.config.ts` (e.g., `@components`, `@utils`, `@stores`, `@EarTrainers`, `@ChordTrainer`).
- Styling: Prefer Tailwind utility classes; place global styles in `src/styles`.

## Testing Guidelines
- No automated tests currently. Do manual QA:
  - `npm run dev` and verify `/ear-trainer` and `/chord-trainer` flows, audio playback, and i18n loading.
  - `npm run preview` to test production build behavior.
- If adding tests, prefer Vitest + React Testing Library; name files `*.test.ts(x)` next to source.

## Commit & Pull Request Guidelines
- Commits: Follow Conventional Commits (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
- PRs: Small, focused changes. Include description, linked issues, screenshots/GIFs for UI changes, and notes on i18n or audio impacts.
- Quality gate: Run `npm run lint` and `npm run format:check`; ensure build passes.

## Security & Configuration Tips
- Avoid committing large binaries; place stable assets under `public/` or `src/assets/`.
- No runtime secrets; keep console/debugger out of production (esbuild drops them in build).
