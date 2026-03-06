# Plans — Planejamento de features e mudanças

Esta pasta concentra **planos** e **templates** para implementar novas features e mudanças no projeto SIMP de forma guiada e consistente.

## Como usar

1. **Nova feature ou mudança:** comece pelo template em [templates/feature-plan-template.md](templates/feature-plan-template.md).
2. **Ciclo PREVC (Plan → Review → Execute → Validate):** use [templates/prevc-template.md](templates/prevc-template.md) para mudanças que exigem revisão antes de implementar.
3. **Regra de ouro:** ao executar um plano, altere **apenas** o que o plano define. Ver [metodologia-escopo-edicao.md](metodologia-escopo-edicao.md).

## Conteúdo

| Item | Descrição |
|------|-----------|
| [templates/feature-plan-template.md](templates/feature-plan-template.md) | Template para planejamento de features (overview, requisitos, fases, riscos). |
| [templates/prevc-template.md](templates/prevc-template.md) | Template do ciclo Plan → Review → Execute → Validate para mudanças controladas. |
| [metodologia-escopo-edicao.md](metodologia-escopo-edicao.md) | Preservar o que já funciona: editar só o escopo definido no plano. |
| [planning-pdca.md](planning-pdca.md) | Estrutura Plan / Do / Check / Act para reorganizações ou migrações. |
| [2026-02-25-refactor-context-agents-claude-para-simp.md](2026-02-25-refactor-context-agents-claude-para-simp.md) | Plano PREVC para refatorar .context, AGENTS.md e CLAUDE.md ao projeto SIMP (em revisão). |
| [2026-02-25-migracao-simp-para-starter-kit.md](2026-02-25-migracao-simp-para-starter-kit.md) | Plano de migração do frontend e domínio SIMP para o starter-kit-v2 (Next.js, Clerk, Prisma) — execução futura. |
| [2026-02-25-migracao-simp-para-simp-v2-patch-minimo.md](2026-02-25-migracao-simp-para-simp-v2-patch-minimo.md) | Migração SIMP → SIMP-V2 com patch mínimo: adicionar páginas/rotas, layout SIMP, dados em mock; todas as telas funcionando. |
| [2026-02-27-proposta-pei-equipe-multidisciplinar.md](2026-02-27-proposta-pei-equipe-multidisciplinar.md) | Proposta de PEI como documento elaborável (equipe multidisciplinar + professor). |
| [2026-02-27-plano-impl-elaboracao-pei-guiada.md](2026-02-27-plano-impl-elaboracao-pei-guiada.md) | Plano de implementação: elaboração de PEI guiada (wizard) baseada no modelo Jonas. |
| [2026-03-03-plano-congruencia-rotas-perfis.md](2026-03-03-plano-congruencia-rotas-perfis.md) | Plano de congruência visual e funcional entre rotas (Professor, Coordenação, Psicologia, Diretoria). |
| [2026-03-03-plano-tabelas-supabase-mcp.md](2026-03-03-plano-tabelas-supabase-mcp.md) | Plano para criar tabelas no Supabase via MCP, a partir das interfaces do domínio (mockData). |
| [2026-03-04-plano-painel-professor-turma-kanban.md](2026-03-04-plano-painel-professor-turma-kanban.md) | Painel do Professor: visão Kanban da turma, avaliações mensais, PEI pendente, notificações e produtividade. |
| [2026-03-04-investigacao-debug-professor.md](2026-03-04-investigacao-debug-professor.md) | Investigação e debug: erro ao salvar avaliação, contagem no card, PEI editável, ocorrência crítica ao coordenador. |
| [2026-03-06-plano-mapeamento-fluxos-notificacoes.md](2026-03-06-plano-mapeamento-fluxos-notificacoes.md) | Mapeamento de fluxos Professor ↔ Coordenador ↔ Equipe Multidisciplinar; notificação PEI elaborado; sinalização ao coordenador quando equipe conclui tarefas. |

## Convenção de nomes para planos

- **Features:** `YYYY-MM-DD-feature-<nome-curto>.md`
- **Refatorações / ajustes:** `YYYY-MM-DD-refactor-<nome-curto>.md` ou `YYYY-MM-DD-ajuste-<nome-curto>.md`
- **Investigação:** `YYYY-MM-DD-investigacao-<nome-curto>.md`

Exemplo: `2026-02-25-feature-dashboard-resumo.md`

## Stack do projeto (referência)

- **Frontend:** Vite, React, TypeScript, shadcn/ui, Tailwind.
- **Backend / dados:** Supabase (client em `src/integrations/supabase/`).
- **Paths:** alias `@/` → `src/`.

Ao preencher planos, use estes caminhos e tecnologias como referência.
