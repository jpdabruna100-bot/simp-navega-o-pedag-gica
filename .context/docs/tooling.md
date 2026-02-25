# Tooling & Productivity — SIMP

This guide outlines the tools and scripts used in the SIMP project.

## Required Tooling

- **Node.js:** Version compatible with the project (see `package.json` engines or team standard).
- **npm:** Package manager (use `npm install`, `npm run <script>`).
- **Git:** Version control.

## Scripts (package.json)

- **Development:** `npm run dev` — starts Vite dev server (http://localhost:8080).
- **Build:** `npm run build` — production build.
- **Preview (optional):** `npm run preview` — preview production build locally.
- **Lint:** `npm run lint` — ESLint.
- **Tests:** `npm run test` — Vitest; `npm run test:watch` if available for watch mode.

## Path Alias

- **`@/`** → `src/` — use in imports (e.g. `import X from '@/components/X'`). Configured in `vite.config.ts` and `tsconfig`.

## IDE / Editor

- **VS Code:** ESLint and TypeScript extensions recommended. Tailwind CSS IntelliSense for class names.
- Use project formatting/linting settings for consistency.

## Productivity

- Use `npm run dev` and keep the app open while changing `src/`; Vite HMR updates quickly.
- Use `npm run lint` and `npm run build` before committing to catch errors early.
