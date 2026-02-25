# Architecture Notes — SIMP

This document describes the architectural design and boundaries of the **SIMP** project. The system is a **single-page application (SPA)** built with Vite and React, using Supabase for backend and auth.

## System Architecture Overview

The application uses **Vite** as the build tool and **React** as the UI layer. Data and authentication are handled by **Supabase** (client in `src/integrations/supabase/`). There is no separate Node backend in this repo; all server-side logic is delegated to Supabase (Auth, Database, optional Edge Functions).

### High-Level Data Flow

1. **User:** Interacts with the app in the browser (routes under `src/pages/`).
2. **UI Layer:** React components and pages; state via React state, Context (`AppContext`), or TanStack Query.
3. **Data Layer:** Supabase client (`src/integrations/supabase/client.ts`) for auth and data; types in `src/integrations/supabase/types.ts`.
4. **Supabase:** Handles authentication, database (PostgreSQL), and optional real-time or storage.

## Architectural Layers

- **Pages (Route Layer):** Entry points per profile — `src/pages/professor/`, `src/pages/psychology/`, `src/pages/coordination/`, `src/pages/directory/`, `src/pages/admin/`.
- **Components (UI Layer):** Reusable components in `src/components/`, including shadcn/ui under `src/components/ui/`.
- **Context (State Layer):** Global app state in `src/context/` (e.g. AppProvider).
- **Integrations (External Layer):** Supabase client and types in `src/integrations/supabase/`.
- **Config:** `vite.config.ts`, `tsconfig.json`, path alias `@/` → `src/`.

## Design Patterns

- **Component composition:** React components composed from smaller pieces; shadcn for primitives.
- **Client-side routing:** React Router; routes and navigation in `App.tsx`.
- **Server state:** TanStack Query for fetching/caching when used; Supabase client for direct calls otherwise.
- **Auth:** Supabase Auth; session and user state integrated in the app as needed.

## Key Entry Points

- **App:** `src/App.tsx` — Router, providers (QueryClient, Tooltip, AppContext), Toaster, routes.
- **Supabase:** `src/integrations/supabase/client.ts` — Single Supabase client instance.

## Related Resources

- [Project Overview](project-overview.md)
- [Development Workflow](development-workflow.md)
- [Agents Directory](../agents/README.md)
