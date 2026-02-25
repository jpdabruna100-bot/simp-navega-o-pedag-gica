# Agents Guide — SIMP

This file is a navigation hub for agents working in this repository. It avoids duplicating content and points you to the authoritative docs and guides.

## ⚡ Instrução rápida (qualquer ação)

Para **plano, tarefa, ajuste, correção ou investigação**: use **AGENTS.md** (este arquivo) e **[.context/docs/README.md](.context/docs/README.md)** como referência de escopo e de qual agente/playbook usar. A tabela **Common Tasks → Guides** e as **Key References** abaixo indicam onde olhar; playbooks em [.context/agents/](.context/agents/).

## Start Here

- [.context/docs/README.md](.context/docs/README.md) — Índice da documentação técnica do SIMP
- [.context/agents/](.context/agents/) — Playbooks dos agentes (Code Reviewer, Bug Fixer, Architect, Frontend, etc.)
- [plans/README.md](plans/README.md) — Planejamento de features e templates PREVC
- [README.md](README.md) — Visão geral do projeto e como rodar local

## Purpose & Scope

- Use this file to quickly find the right guide or reference.
- All detailed standards live under `.context/docs/` and actionable playbooks under `.context/agents/`.
- **Scope:** applies to the entire repository **SIMP** (Vite + React + TypeScript + Supabase).

## Key References (authoritative)

- **Project overview (objetivo, perfis, domínio):** [.context/docs/project-overview.md](.context/docs/project-overview.md) — referência para novas features e melhorias
- **Architecture:** [.context/docs/architecture.md](.context/docs/architecture.md)
- **Development workflow:** [.context/docs/development-workflow.md](.context/docs/development-workflow.md)
- **Glossary:** [.context/docs/glossary.md](.context/docs/glossary.md)
- **Security:** [.context/docs/security.md](.context/docs/security.md)
- **Plans & templates:** [plans/README.md](plans/README.md)
- **Supabase:** tipos e cliente em `src/integrations/supabase/`

## Common Tasks → Guides

- Plan a feature: [plans/templates/feature-plan-template.md](plans/templates/feature-plan-template.md) e [.context/agents/architect-specialist.md](.context/agents/architect-specialist.md)
- Review code: [.context/agents/code-reviewer.md](.context/agents/code-reviewer.md)
- Fix a bug: [.context/agents/bug-fixer.md](.context/agents/bug-fixer.md)
- Refactor: [.context/agents/refactoring-specialist.md](.context/agents/refactoring-specialist.md)
- Write tests: [.context/agents/test-writer.md](.context/agents/test-writer.md)
- Documentation: [.context/agents/documentation-writer.md](.context/agents/documentation-writer.md)
- Frontend / UI: [.context/agents/frontend-specialist.md](.context/agents/frontend-specialist.md)
- Security review: [.context/agents/security-auditor.md](.context/agents/security-auditor.md)

## Code Standards (SOLID & DRY)

### Single Responsibility Principle

- Each function or component does ONE thing well.
- Separate concerns: data fetching → transformation → UI; use hooks and context where appropriate.

### DRY (Don't Repeat Yourself)

- Use shared utilities and components under `src/`.
- Consolidate common logic in hooks or `src/context/`.
- Config-driven when possible (avoid hardcoded values).

### React & TypeScript (SIMP)

- **Components:** Prefer functional components; use `src/components/ui/` (shadcn) for primitives.
- **State:** React state, context (`AppContext`), or TanStack Query for server state.
- **Paths:** Alias `@/` → `src/` (see `vite.config.ts`, `tsconfig`).
- **Styling:** Tailwind CSS; use design tokens and existing components.

### Supabase (SIMP)

- **Client:** `src/integrations/supabase/client.ts` — use for auth and data.
- **Types:** `src/integrations/supabase/types.ts` (Database types).
- **Queries:** Prefer typed queries; use RLS and existing patterns in the codebase.

### Edição a partir de plano

- When executing a plan, alter **only** the files or sections listed in the plan.
- Do not rewrite or "improve" other sections in the same file. See [plans/metodologia-escopo-edicao.md](plans/metodologia-escopo-edicao.md).

## Project Map (for orientation)

- **Frontend:** `src/` — `App.tsx`, `src/pages/`, `src/components/`, `src/context/`
- **Data / Auth:** `src/integrations/supabase/`
- **Config:** `vite.config.ts`, `package.json`, `tsconfig.json`
- **Documentation:** `.context/docs/`, `.context/agents/`, `.context/skills/`
- **Plans:** `plans/`, `plans/templates/`

For local setup: `npm install` then `npm run dev` (see [README.md](README.md)). App runs at http://localhost:8080.

## Validação e documentação (recomendado)

- Before making structural or behavioral changes, consult the docs in `.context/docs/` and the relevant agent playbook in `.context/agents/`.
- When available, use project documentation (or MCPs if configured) to validate assumptions before implementing.
- This reduces incorrect assumptions and keeps contributions consistent with the SIMP codebase.

---

## Critical: Before Writing Any Code

- Consult [.context/docs/development-workflow.md](.context/docs/development-workflow.md) and the relevant playbook in [.context/agents/](.context/agents/) for conventions.
- Follow naming and patterns used in `src/` (React, TypeScript, Supabase).
- Run `npm run lint` and `npm run build` after changes when applicable.

This prevents inconsistencies and keeps the SIMP project maintainable.
