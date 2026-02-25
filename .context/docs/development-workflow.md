# Development Workflow — SIMP

The SIMP project follows a standard front-end development workflow with Vite and React. This document covers local setup, conventions, and how to contribute.

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app runs at **http://localhost:8080** (port configured in `vite.config.ts`).
3. **Build for production:**
   ```bash
   npm run build
   ```
4. **Lint:**
   ```bash
   npm run lint
   ```
5. **Tests:**
   ```bash
   npm run test
   ```
   Uses Vitest; see [Testing Strategy](testing-strategy.md).

## Paths and Conventions

- **Path alias:** `@/` points to `src/` (see `vite.config.ts` and `tsconfig`). Use `@/components/...`, `@/pages/...`, etc.
- **Components:** Prefer functional components; use TypeScript. UI primitives from `src/components/ui/` (shadcn).
- **State:** React state, `AppContext`, or TanStack Query as appropriate.
- **Data:** Supabase client from `src/integrations/supabase/client.ts`; use existing types from `src/integrations/supabase/types.ts`.

## Code Review Expectations

- Follow existing patterns in `src/` (see [Architecture](architecture.md)).
- Include or update tests when adding features or fixing bugs where relevant.
- Do not commit secrets or API keys; use environment variables if needed.
- Update documentation (e.g. `.context/docs/` or README) when changing behavior or setup.

## Agent Collaboration

When using AI agents, follow the playbooks in [AGENTS.md](../../AGENTS.md) and the guides in [.context/agents/](../agents/).

## Onboarding

1. Clone the repo, run `npm install` and `npm run dev`.
2. Explore `src/App.tsx` and `src/pages/` to understand routes and profiles.
3. Review `src/integrations/supabase/` for data and auth usage.
4. Check [plans/](../../plans/README.md) for planning templates and workflows.
