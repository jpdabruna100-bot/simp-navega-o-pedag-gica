# Q&A Index — SIMP

Project type: **SIMP** (Vite + React + Supabase web app)

## Getting started

- [How do I set up and run this project?](./getting-started.md) — See also [Development Workflow](../development-workflow.md).

## Architecture

- [How is the codebase organized?](./project-structure.md)
- [How does routing work?](./routing.md) — SIMP uses React Router in `src/App.tsx`.
- [How does middleware work?](./middleware.md) — SIMP has no Next.js middleware; use route guards or layout checks.

## Features

- [How is data stored and accessed?](./database.md) — SIMP uses Supabase; client in `src/integrations/supabase/`.
- [What API endpoints are available?](./api-endpoints.md) — SIMP relies on Supabase (Auth, Database); no custom API in repo unless added.

## Operations

- [How does caching work?](./caching.md)
- [How are errors handled?](./error-handling.md)

## Testing

- [How do I run and write tests?](./testing.md) — Vitest; see [Testing Strategy](../testing-strategy.md).
