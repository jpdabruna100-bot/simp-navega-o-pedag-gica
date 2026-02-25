# Documentation Index — SIMP

Welcome to the **SIMP** knowledge base. This documentation provides a guide to the project's architecture, development workflow, and conventions.

**Para o LLM — ação rápida:** use [AGENTS.md](../../AGENTS.md) e este índice para escopo e qual agente/playbook usar; playbooks em [.context/agents/](../agents/).

## Core Guides

- [**Project Overview**](./project-overview.md): **Objetivo do projeto**, perfis (personas), fluxos principais, conceitos de domínio e estado atual. Leia primeiro ao implementar novas features ou melhorias.
- [**Architecture Notes**](./architecture.md): System design, layers, and patterns (Vite, React, Supabase).
- [**Development Workflow**](./development-workflow.md): Local setup, contribution guidelines, and conventions.
- [**Testing Strategy**](./testing-strategy.md): Unit and integration testing with Vitest.
- [**Glossary & Domain Concepts**](./glossary.md): Terminology and business rules.
- [**Security & Compliance**](./security.md): Security policies and guardrails.
- [**Tooling & Productivity**](./tooling.md): Scripts and automation (npm run dev, build, lint, test).
- [**Prompt Engineering Best Practices**](./prompt-engineering-best-practices.md): Techniques for prompts and AI-assisted workflows (generic).
- [**Conversational AI Agents**](./conversational-ai-agents.md): Reference on agent architecture (generic).

## Repository Structure (SIMP)

- **`src/`**: Frontend application.
  - `src/pages/`: Route-level pages (professor, psychology, coordination, directory, admin).
  - `src/components/`: Reusable UI components (including shadcn/ui).
  - `src/context/`: React context (e.g. AppContext).
  - `src/integrations/supabase/`: Supabase client, types, and auth/data patterns.
- **`vite.config.ts`**: Vite config; dev server on port 8080.
- **`plans/`**: Planning documents and templates (PREVC, feature plans).
- **`.context/`**: Documentation and agent playbooks (this folder).

## Agent Playbooks

For how specific AI agents interact with this codebase, see the [Agents Directory](../agents/).

## Skills

For task-specific procedures (code review, tests, docs, etc.), see the [Skills Directory](../skills/).
