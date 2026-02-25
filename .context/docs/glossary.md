# Glossary & Domain Concepts — SIMP

This document defines terminology and domain concepts used in the SIMP project.

## Core Terms

- **SIMP:** The project name; application for educational/institutional profiles (professor, psychology, coordination, directory, admin).
- **Perfis:** User roles or areas: Professor, Psicologia, Coordenação, Direção, Admin. Each has dedicated pages and dashboards under `src/pages/`.
- **shadcn/ui:** Component library used for the UI; components live in `src/components/ui/`.
- **Supabase:** Backend-as-a-Service used for authentication and database; client in `src/integrations/supabase/`.
- **AppContext:** Global React context for app-wide state (e.g. `src/context/AppContext`).

## Repository Terms

- **Path alias `@/`:** Maps to `src/` (Vite/TypeScript). Use for imports, e.g. `@/components/...`, `@/pages/...`.
- **Plans:** Planning documents and templates in `plans/` (feature plans, PREVC template).
- **.context:** Directory containing documentation (`.context/docs/`), agent playbooks (`.context/agents/`), and skills (`.context/skills/`).

## Personas / Actors

- **Professor:** User with professor dashboard; students list, student detail, new assessment.
- **Psicologia:** User with psychology dashboard and student detail views.
- **Coordenação:** User with coordination dashboard, alerts panel, intervention management, student detail.
- **Direção:** User with directory dashboard.
- **Admin:** Administrator with admin dashboard.

## Domain Rules (when applicable)

- **Auth:** Supabase Auth governs authentication; protect routes and data according to RLS and app-level checks.
- **Data integrity:** Use the Supabase client and typed queries; respect existing patterns in `src/integrations/supabase/`.
