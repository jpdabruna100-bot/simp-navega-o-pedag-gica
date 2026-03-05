# Plano — Painel do Professor: visão produtiva e congruente

**Data:** 2026-03-04  
**Escopo:** Redesenhar a visualização da turma pelo professor (rota `/professor/turma/:turmaId`) para alinhar ao Kanban do restante do projeto e suportar fluxo de produtividade (avaliações por ano letivo, PEI, demandas da equipe multidisciplinar/coordenação, pendências).  
**Status:** Em execução

---

## 1. Feature Overview

### Problema
- A rota `/professor/turma/:turmaId` exibe alunos em **lista**, enquanto Coordenação e Psicologia usam **Kanban**.
- O professor não tem visão clara de:
  - Demandas recebidas da equipe multidisciplinar/coordenação (PEI recomendado, encaminhamentos).
  - Avaliações pendentes (critério relativo à turma: até 10/ano letivo).
  - Pendências em atraso.
  - Início de tratativa de PEI.

### Objetivo
- Oferecer ao professor uma visão orientada a **produtividade** e **ação**.
- Alinhar a interface ao padrão Kanban usado em Coordenação e Psicologia.
- Garantir visibilidade de: demandas (Aguardando Ação), em andamento (PEI/avaliação), avaliações pendentes e pendências em atraso.

### Regra de demandas
- Quando o professor receber uma demanda da equipe multidisciplinar/coordenação, o aluno deve cair na etapa **Aguardando Ação**.

### Não escopo
- Alterar regras de negócio (PEI guiado).
- Integração com Supabase além do que já existe.
- Novas rotas além das já previstas.

---

## 2. Requirements

### Funcionais

- [ ] **RF1:** Visualizar alunos da turma em estrutura de 3 etapas: lista (Todos os alunos) + Kanban (Aguardando Ação | Em andamento).
- [ ] **RF2:** Exibir demandas da equipe multidisciplinar/coordenação (PEI recomendado, encaminhamentos) nos cards — alunos caem em **Aguardando Ação**.
- [ ] **RF3:** Permitir iniciar elaboração de PEI a partir do card quando houver `peiRecomendado`.
- [ ] **RF4:** Sinalizar avaliação pendente por aluno — **critério relativo à turma**: a partir do momento em que 1 aluno tiver avaliação superior às dos demais, os demais devem ser sinalizados como pendente. Até 10 avaliações por ano letivo.
- [ ] ~~**RF5:**~~ Recusado.
- [ ] **RF6:** Destacar pendências em atraso (avaliação atrasada, PEI com prazo vencido).
- [ ] ~~**RF7:**~~ Recusado — remover filtros (busca, risco) por completo.
- [ ] **RF8:** (Opcional) Alternar entre visualização Kanban e Lista.

### Não funcionais
- UX consistente com PsychologyDashboard e InterventionManagement.
- Performance adequada para turmas com até ~50 alunos.
- Acessibilidade: teclado, ARIA, contraste.

---

## 3. Proposta de estrutura visual (3 etapas)

| Etapa | Tipo | Critério |
|-------|------|----------|
| **1. Todos os alunos** | Lista (visão geral) | Todos os alunos da turma — exibida antes do Kanban |
| **2. Aguardando Ação** | Coluna Kanban | Demandas recebidas da equipe multidisciplinar/coordenação (PEI recomendado, encaminhamentos, notificações) |
| **3. Em andamento** | Coluna Kanban | PEI wizard aberto/iniciado ou avaliação em edição |

### Fluxo
- **Etapa 1:** Lista com todos os alunos da turma (visão geral).
- **Etapa 2:** Alunos com demandas pendentes — professor precisa agir.
- **Etapa 3:** Alunos em processo ativo — PEI em elaboração ou avaliação em edição.

---

## 4. Technical Specs

### Stack / impacto

| Área | Tecnologia | Impacto |
|------|------------|---------|
| Frontend | React, shadcn/ui, Tailwind | Refatoração de `StudentList.tsx`; sem filtros busca/risco |
| Dados | AppContext, Supabase | Lógica de avaliação pendente (relativo à turma) e status "em andamento" |
| Rotas | React Router | Sem novas rotas; ajustes em `/professor/turma/:turmaId` |

### Estrutura de arquivos

- `src/pages/professor/StudentList.tsx` — Refatorar: lista (Todos) + Kanban (Aguardando Ação | Em andamento).
- `src/components/` — Possível `ProfessorTurmaKanban.tsx` ou `ProfessorStudentCard.tsx` reutilizável.
- `src/lib/` — Função `getAssessmentPendingByTurma(students, anoLetivo)` — retorna alunos com menos avaliações que o máximo da turma.
- `src/data/mockData.ts` — Sem alteração de schema; usar `assessments`, `peiRecomendado`, `interventions`.

### Regra de avaliação pendente (RF4)

- **Critério relativo à turma:** a partir do momento em que 1 aluno tiver mais avaliações que os demais, os demais são sinalizados como pendente.
- **Limite:** até 10 avaliações por ano letivo (`assessment.anoLetivo`).
- **Implementação:** contar `assessments` por aluno no `anoLetivo`; `maxCount` = máximo na turma; alunos com `count < maxCount` = pendente.

### Status "Em andamento"

- PEI wizard aberto/iniciado (estado local ou flag).
- Avaliação em edição (estado local ou flag).

### Dependências

- Reutilizar `RiskBadge`, `PEIWizard` já existentes.
- **Remover:** `RiskFilterButtons`, filtro de busca.

---

## 5. Phases / Tasks

| # | Tarefa | Responsável | Status |
|---|--------|-------------|--------|
| 1 | Criar `getAssessmentPendingByTurma(students, anoLetivo)` em `src/lib/` | — | [x] |
| 2 | Implementar lista "Todos os alunos" (visão geral) | — | [x] |
| 3 | Implementar Kanban com colunas Aguardando Ação e Em andamento | — | [x] |
| 4 | Mapear demandas (peiRecomendado, notificações) → Aguardando Ação | — | [x] |
| 5 | Mapear PEI em elaboração / avaliação em edição → Em andamento | — | [x] |
| 6 | Sinalizar avaliação pendente nos cards (critério relativo à turma) | — | [x] |
| 7 | Destacar pendências em atraso (badge, cor) | — | [x] |
| 8 | Remover filtros (busca, risco) | — | [x] |
| 9 | (Opcional) Toggle Kanban / Lista | — | [x] |
| 10 | Validar congruência com PsychologyDashboard e InterventionManagement | — | [ ] |

---

## 6. Risks & Mitigation

| Risco | Mitigação |
|-------|-----------|
| Status "Em andamento" volátil | Persistir em estado local (sessionStorage) ou flag no contexto quando PEI/avaliação em edição |
| Regressão na navegação | Manter clique no card → `/professor/aluno/:id` |
| Performance com muitas turmas | Virtualização ou paginação se necessário |

---

## 7. Validation / Acceptance

- **Cenário 1:** Professor acessa turma e vê lista "Todos os alunos" + Kanban (Aguardando Ação | Em andamento).
- **Cenário 2:** Aluno com demanda (PEI recomendado, notificação) aparece em Aguardando Ação.
- **Cenário 3:** Aluno com PEI em elaboração ou avaliação em edição aparece em Em andamento.
- **Cenário 4:** Alunos com menos avaliações que o máximo da turma são sinalizados como pendente.
- **Cenário 5:** Alunos em atraso (avaliação ou PEI) ficam destacados.
- **Cenário 6:** Sem filtros de busca ou risco.
- **Cenário 7:** `npm run build` e `npm run lint` sem erros.

---

## 8. Reference Documentation

- [Project overview](../.context/docs/project-overview.md)
- [Glossary](../.context/docs/glossary.md)
- [Plano congruência rotas-perfis](2026-03-03-plano-congruencia-rotas-perfis.md)
- [AGENTS.md](../AGENTS.md)
- [README do projeto](../README.md)

---

## Resumo da recomendação

- **Estrutura:** 3 etapas — (1) Lista "Todos os alunos" + (2) Kanban "Aguardando Ação" + (3) Kanban "Em andamento".
- **Aguardando Ação:** demandas da equipe multidisciplinar/coordenação (PEI recomendado, encaminhamentos).
- **Em andamento:** PEI wizard aberto/iniciado ou avaliação em edição.
- **Avaliação pendente:** critério relativo à turma — quando 1 aluno tem mais avaliações, os demais são sinalizados (até 10/ano letivo).
- **Sem filtros:** busca e risco removidos.
- **Produtividade:** cards com ações diretas (nova avaliação, iniciar PEI) e destaque para atrasos.

---

*Template baseado em [feature-plan-template.md](templates/feature-plan-template.md).*
