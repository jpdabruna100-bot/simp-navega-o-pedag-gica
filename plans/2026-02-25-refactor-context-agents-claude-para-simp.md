# Plano PREVC — Refatorar .context, AGENTS.md e CLAUDE.md para o projeto SIMP

**Data:** 2026-02-25  
**Tipo:** Refatoração  
**Status:** Executado

---

## O que é o ciclo PREVC?

- **P – Plan:** Documentar o que será feito, consultar referências, listar riscos.
- **R – Review:** Revisão humana do plano (aprovar ou ajustar). **← Você revisa aqui.**
- **E – Execute:** Implementar somente após aprovação.
- **V – Validate:** Validar resultado (checklist, links, termos).
- **C – Confirm:** Consolidar (commit, limpeza).

Nunca executar sem passar por P e R.

---

## 1. Objetivo

Adaptar **AGENTS.md**, **CLAUDE.md** e todo o conteúdo da pasta **.context** (docs, agents, skills, workflow) ao projeto **SIMP**, removendo referências ao starter-kit-n8n (Apps Script, n8n, Kommo, Bling, WooCommerce, etc.) e alinhando stack, paths e links à realidade do SIMP (Vite, React, TypeScript, Supabase, shadcn/ui, React Router).

---

## 2. Before vs After

| Aspecto | Antes | Depois |
|--------|--------|--------|
| **Stack descrita** | Apps Script + n8n + Supabase, Kommo, Bling, Melhor Envio, WooCommerce | Vite, React, TypeScript, Supabase, shadcn/ui, Tailwind, React Router |
| **AGENTS.md / CLAUDE.md** | Links para `docs/`, `agents/` (raiz), CONTRIBUTING, docs/01-core, n8n MCPs | Links para `.context/docs/`, `.context/agents/`, `plans/`, README do SIMP; MCPs opcionais/genéricos ou removidos |
| **Project Map** | `src/appscript/`, `src/n8n/`, supabase/ | `src/`, `src/pages/`, `src/components/`, `src/context/`, `src/integrations/supabase/`, `plans/` |
| **Code standards** | Apps Script (globalThis, rate limit Bling/Kommo), n8n (workflows, XML) | React/TS (componentes, hooks), Supabase client, padrões do SIMP |
| **.context/docs/** | Conteúdo genérico ou Next.js/Prisma/starter-kit | Overview, architecture, workflow e glossary adaptados ao SIMP |
| **.context/agents/** | Playbooks citando starter-kit, Next.js, Prisma, n8n | Playbooks com Key Files/Paths do SIMP; remover ou marcar “opcional” agentes n8n (Workflow Developer, AI Debug, etc.) |
| **.context/skills/** | Exemplos e paths do starter-kit/Next.js | Exemplos e paths do SIMP (src/, Vite, Supabase) |

---

## 3. Consultation (referências usadas)

- [x] [README.md](../../README.md) — Stack e como rodar o SIMP (npm install, npm run dev, porta 8080)
- [x] [plans/README.md](README.md) — Estrutura de planos e templates
- [x] Estrutura atual de `src/` (App.tsx, pages, components, integrations/supabase)
- [x] [metodologia-escopo-edicao.md](metodologia-escopo-edicao.md) — Alterar apenas o que este plano define

---

## 4. Seções / arquivos a alterar (escopo estrito)

Quem executa **só** mexe nos itens abaixo. Fora disso = não editar (ver [metodologia-escopo-edicao.md](metodologia-escopo-edicao.md)).

### 4.1 Raiz do repositório

| Arquivo | O que alterar |
|---------|----------------|
| **AGENTS.md** | Scope: "SIMP (Vite + React + Supabase)". Start Here: apenas `.context/docs/README.md` e `.context/agents/`. Key References: remover CONTRIBUTING, docs/01-core, docs/02-development, integrações Kommo/Bling; apontar para `.context/docs/`, `plans/`, README. Common Tasks: apontar para `.context/agents/*.md`. Remover toda seção "Planning Template Standard" (POA, plano-ajuste-agente) e "Exceções". Code Standards: remover Apps Script e n8n Patterns; manter SOLID/DRY; Supabase: adaptar para cliente em `src/integrations/supabase/` (sem MCP obrigatório). Project Map: substituir por `src/`, `src/pages/`, `src/components/`, `src/integrations/supabase/`, `plans/`, `.context/`. Seção MCPs: remover ou encurtar (n8n, Portainer, WooCommerce, Hostinger); manter genérico "consultar documentação quando necessário". Remover "Before Writing Any Code" específico de Apps Script. |
| **CLAUDE.md** | Alinhar ao AGENTS.md refatorado: Start Here apenas `.context/docs/README.md` e `.context/agents/`. Purpose & Scope: "SIMP (Vite, React, Supabase)". Key References: links para `.context/docs/`, `plans/`, README. Remover referências a docs/01-core, agents/ (raiz), CONTRIBUTING. Code Standards: remover Apps Script e n8n; manter SOLID/DRY e Supabase adaptado. Project Map: como em AGENTS.md. Seção MCPs: remover ou simplificar (n8n, Portainer, WooCommerce, Hostinger). Remover "Modo mínimo" específico de n8n ou adaptar para "contexto grande no SIMP". "Before Writing Any Code": remover Apps Script; manter consulta a padrões do projeto. |

### 4.2 .context/docs/

| Arquivo | O que alterar |
|---------|----------------|
| **.context/docs/README.md** | Texto de abertura: "SIMP knowledge base". Repository Structure: descrever SIMP (`src/`, Vite, React, Supabase, React Router, `src/pages/`, `src/components/`, `src/integrations/supabase/`). Core Guides: manter links para project-overview, architecture, development-workflow, glossary, security, testing-strategy; garantir que os .md apontados existam e não citem starter-kit/n8n como projeto. |
| **.context/docs/project-overview.md** | Substituir referências a "starter-kit", Next.js, Prisma, n8n por SIMP: Vite, React, TypeScript, Supabase, shadcn, perfis (professor, psicologia, coordenação, etc.). |
| **.context/docs/architecture.md** | Adaptar camadas e diagramas ao SIMP (frontend Vite/React, Supabase, sem n8n/Apps Script). |
| **.context/docs/development-workflow.md** | Local setup: `npm install`, `npm run dev`, porta 8080; paths `src/`, `@/`; remover Prisma/Next.js/n8n. |
| **.context/docs/glossary.md** | Remover termos específicos do starter-kit/n8n; manter ou adicionar termos do domínio SIMP. |
| **.context/docs/security.md** | Manter boas práticas genéricas; remover referências a APIs Kommo/Bling/n8n se houver. |
| **.context/docs/testing-strategy.md** | Adaptar para Vitest, React Testing Library, estrutura de testes do SIMP. |
| **.context/docs/codebase-map.json** | Se existir e for usado: atualizar paths para estrutura `src/` do SIMP. |
| **.context/docs/conversational-ai-agents.md** | Remover ou adaptar (conteúdo é n8n/IA conversacional); se manter, deixar genérico. |
| **.context/docs/prompt-engineering-best-practices.md** | Manter genérico ou adaptar para uso com agentes no SIMP. |
| **.context/docs/tooling.md** | Scripts e ferramentas: citar apenas as do SIMP (npm run dev, build, lint, test). |
| **.context/docs/qa/*.md** | Se os arquivos forem genéricos (testing, error-handling, database), adaptar exemplos para SIMP; se forem específicos de outro stack, remover ou reescrever resumidamente para SIMP. |

### 4.3 .context/agents/

| Arquivo | O que alterar |
|---------|----------------|
| **.context/agents/README.md** | Listar apenas agentes relevantes para SIMP (Code Reviewer, Bug Fixer, Refactoring, Test Writer, Documentation, Frontend, Security, Architect; opcional: AI Solutions Architect). Marcar como "opcional / referência" ou remover da lista: Workflow Developer, AI Debug Specialist, AI QA Engineer (focados em n8n). Related Resources: apontar para `../docs/README.md`, `../../AGENTS.md`; remover CONTRIBUTING se não existir. |
| **.context/agents/code-reviewer.md** | Key Project Resources: paths para `.context/docs/`, `AGENTS.md`. Repository Starting Points: `src/`, `src/components/`, `src/pages/`. Key Files: `vite.config.ts`, `package.json`, componentes em `src/`; remover Prisma/middleware.ts. Key Symbols: adaptar para React/TS (ex.: hooks, supabase client). |
| **.context/agents/bug-fixer.md** | Idem: Repository Starting Points e Key Files do SIMP. |
| **.context/agents/refactoring-specialist.md** | Idem. |
| **.context/agents/test-writer.md** | Idem; citar Vitest, estrutura de testes do SIMP. |
| **.context/agents/documentation-writer.md** | Idem; manter ".context/docs/ e .context/agents/"; Key Files: README, package.json, estrutura src/. |
| **.context/agents/frontend-specialist.md** | Idem; Key Files: componentes shadcn, `src/pages/`, Vite. |
| **.context/agents/security-auditor.md** | Idem; remover referências a APIs externas do starter-kit. |
| **.context/agents/architect-specialist.md** | Idem; Repository Starting Points: `src/`, `src/pages/`, `src/components/`, `src/context/`, `src/integrations/supabase/`. Key Files: `App.tsx`, `vite.config.ts`, cliente Supabase. |
| **.context/agents/performance-optimizer.md** | Idem; remover SSR/Next.js; citar Vite/React. |
| **.context/agents/devops-specialist.md** | Adaptar para CI/CD genérico ou scripts do SIMP; remover referências a stack alheia. |
| **.context/agents/ai-solutions-architect.md** | Manter apenas se for útil para “arquitetura de prompts/regras” no SIMP; senão marcar como referência ou enxugar referências n8n/XML. |
| **.context/agents/ai-qa-engineer.md** | Marcar como opcional/referência (focado em agentes n8n) ou adaptar para QA de UI/fluxos do SIMP. |
| **.context/agents/ai-debug-specialist.md** | Marcar como opcional/referência ou remover da lista ativa. |
| **.context/agents/workflow-developer.md** | Marcar como "referência / não aplicável ao SIMP" ou remover da lista (n8n). |
| **.context/agents/portable-prompts/*.txt** | Manter como estão ou adicionar nota "genérico"; não obrigatório alterar. |

### 4.4 .context/skills/

| Arquivo | O que alterar |
|---------|----------------|
| **.context/skills/README.md** | "Project: SIMP". Tabela de skills: manter as que fizerem sentido; remover ou marcar "referência" skills muito ligadas a n8n (ex.: prompt-debugging se for só para XML). |
| **.context/skills/*/SKILL.md** (cada pasta) | Em cada SKILL: substituir "starter-kit-v2" ou "starter-kit" por "SIMP"; exemplos de paths: `src/`, `src/components/`, `src/pages/`, `src/integrations/supabase/`; remover Prisma/Next.js; adaptar exemplos de código para React/TS/Vite quando houver. Skills a revisar: code-review, commit-message, pr-review, test-generation, documentation, refactoring, bug-investigation, feature-breakdown, api-design, security-audit; prompt-debugging e prompt-engineering: adaptar ou marcar como referência. |

### 4.5 .context/workflow/ e .context/CLAUDE.md

| Arquivo | O que alterar |
|---------|----------------|
| **.context/workflow/status.yaml** | Ajustar para estados/fluxos do SIMP, se usado; ou deixar mínimo. |
| **.context/workflow/plans.json** | Se existir lista de planos, alinhar aos planos em `plans/` do SIMP. |
| **.context/workflow/actions.jsonl** | Opcional: limpar ou manter genérico. |
| **.context/CLAUDE.md** | Se for cópia do CLAUDE.md da raiz: após refatorar o CLAUDE.md da raiz, replicar aqui ou manter um único CLAUDE.md na raiz e remover este; decidir na execução (objetivo: não ter dois CLAUDE.md desalinhados). |

---

## 5. Regras de substituição (aplicar em todos os arquivos do escopo)

- **Stack:** Remover: Apps Script, n8n, Kommo, Bling, Melhor Envio, WooCommerce, Evolution API, Portainer (exceto se SIMP usar). Incluir: Vite, React, TypeScript, Supabase, shadcn/ui, Tailwind, React Router.
- **Paths:** `docs/` → `.context/docs/` quando for doc técnica; `agents/` → `.context/agents/`; `src/app/`, `src/lib/` (Next.js) → `src/`, `src/pages/`, `src/components/`, `src/context/`, `src/integrations/supabase/`; `prisma/` → remover ou substituir por "Supabase (schema/tipos em src/integrations/supabase)".
- **Links quebrados:** CONTRIBUTING.md, docs/01-core/*, docs/02-development/*, agents/architecture-planning.md (fora de .context): remover ou redirecionar para `.context/docs/` ou `.context/agents/` equivalente.
- **Projeto:** "starter-kit", "starter-kit-v2", "starter-kit-n8n" → "SIMP".

---

## 6. Risks

| Risk 1 | Quebrar links ou referências cruzadas entre .context e raiz. | **Mitigation:** Executar por fases; após cada fase, checar links dos arquivos alterados. |
| Risk 2 | Remover informação útil (ex.: MCPs que o SIMP use no futuro). | **Mitigation:** Encurtar ou marcar "opcional"; não apagar seções inteiras sem deixar nota "adaptar conforme uso". |

---

## 7. Execution Checklist (fase E — só após aprovação R)

- [x] **Fase 1:** Refatorar `AGENTS.md` e `CLAUDE.md` (raiz).
- [x] **Fase 2:** Refatorar `.context/docs/README.md` e arquivos listados em 4.2.
- [x] **Fase 3:** Refatorar `.context/agents/README.md` e cada playbook listado em 4.3.
- [x] **Fase 4:** Refatorar `.context/skills/README.md` e cada `SKILL.md` listado em 4.4.
- [x] **Fase 5:** Ajustar `.context/workflow/` e `.context/CLAUDE.md` conforme 4.5.

---

## 8. Validation Checklist (fase V)

- [ ] Não restam menções a "Apps Script", "n8n" (como stack do projeto), "Kommo", "Bling", "Melhor Envio", "WooCommerce" em AGENTS.md e CLAUDE.md (exceto em nota histórica se necessário).
- [ ] Start Here e Key References em AGENTS.md e CLAUDE.md apontam para `.context/docs/`, `.context/agents/`, `plans/`, README.
- [ ] Project Map reflete `src/`, `src/pages/`, `src/components/`, `src/integrations/supabase/`, `plans/`, `.context/`.
- [ ] Links internos em .context (docs, agents, skills) não quebrados; paths relativos corretos.
- [ ] Playbooks em .context/agents citam Key Files/Paths do SIMP.
- [ ] Skills em .context/skills referem "SIMP" e paths do SIMP nos exemplos.
- [ ] `npm run build` e `npm run lint` seguem passando (refatoração não altera código em `src/`).

---

## 9. Approval (PREVC R)

- **Revisado em:** _______________
- **Aprovado por:** _______________
- **Data de execução (fase E):** _______________

---

*Plano criado para revisão (PREVC R). Após aprovação, executar as fases na ordem do checklist e validar com a fase V.*
