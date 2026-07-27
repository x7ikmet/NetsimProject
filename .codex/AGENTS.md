# Repository Guidelines

## Project Structure & Module Organization

This is a Vite + React ERP frontend for viewing a stock variant product tree. Source code lives in `src/`. The main application flow is in `src/App.jsx`, with bootstrapping in `src/main.jsx`. API access is centralized in `src/api/stokApi.js`. Reusable UI and feature components are in `src/components/`, including shadcn-style primitives under `src/components/ui/`. Utility logic is in `src/utils/`, table column definitions are in `src/config/`, and static public assets are in `public/`. Built output is generated into `dist/` and should not be edited by hand.

## Build, Test, and Development Commands

Use pnpm for dependency management, matching `packageManager` in `package.json`.

- `pnpm dev`: start the Vite development server with hot reload.
- `pnpm build`: create a production build in `dist/`.
- `pnpm preview`: serve the production build locally for verification.
- `pnpm lint`: run ESLint across the repository.

The dev server proxies `/crud` API calls to `http://localhost:82` via `vite.config.js`.

## Coding Style & Naming Conventions

Write React components as named PascalCase functions, for example `LookupDialog` and `BomStudioTable`. Use camelCase for local variables, state setters, and helper functions. Keep API wrappers in `src/api/` and transformation/filtering logic in `src/utils/` rather than mixing it into components. Follow the existing style: two-space indentation, single quotes, semicolons omitted, and concise JSX. Prefer existing UI primitives from `src/components/ui/` before adding new component patterns.

## Testing Guidelines

No automated test framework is currently configured. Before submitting changes, run `pnpm lint` and `pnpm build`. For UI changes, manually verify the main workflow: select a stock card, select a variant, press `Bul`, expand/collapse product tree rows, and confirm loading/error messages behave correctly. If tests are added later, place them near the feature they cover using names like `BomStudioTable.test.jsx`.

## Commit & Pull Request Guidelines

Recent commits use short descriptive messages such as `before moving to urun agaci api` and `version 3`. Prefer clearer imperative messages going forward, for example `Add product tree fallback handling`. Pull requests should include a short summary, the commands run for verification, screenshots for visible UI changes, and notes about any API contract changes.

## Security & Configuration Tips

Do not hardcode credentials or private ERP URLs in source files. Use `VITE_API_ROOT` when the API root differs from the default `/crud`. Keep backend-specific assumptions documented near the API wrapper that uses them.
