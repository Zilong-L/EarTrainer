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

## Commit & PR Workflow
- Branch-first: create a feature branch for any non-trivial change (`git checkout -b feat/xyz`).
- Merge strategy: prefer merge commits to preserve branch history — use `git merge --no-ff feat/xyz` (or PR with "Create a merge commit"). Avoid squashing/rebasing for feature branches unless requested.
- Main branch: avoid committing directly to `main` except trivial docs/typos. Push updates via merging the feature branch.
- Commits: use Conventional Commits (e.g., `feat: ...`, `fix: ...`, `refactor: ...`).
- Quality gate: run `npm run lint` and `npm run format:check`; ensure `npm run build` succeeds locally.

## Agent Instructions
- After code changes: do not push immediately. First, summarize what changed (files, rationale, notable UX/behavior), then wait for the maintainer to verify.
- Only push/merge after explicit approval. If requested, include the exact `git` commands you plan to run.
- Merge policy: for branches, perform a merge commit (no fast-forward) so history shows branch work: `git checkout main && git merge --no-ff <branch>`.
- Avoid rewriting published history. If a merge commit is desired for an already fast-forwarded merge, ask before proposing a history rewrite.

## Security & Configuration Tips
- Avoid committing large binaries; place stable assets under `public/` or `src/assets/`.
- No runtime secrets; keep console/debugger out of production (esbuild drops them in build).
