# Plano — [Nome da feature ou mudança]

**Data:** YYYY-MM-DD  
**Escopo:** [Uma linha descrevendo o escopo]  
**Status:** Rascunho | Em revisão | Aprovado | Em execução | Concluído

---

## 1. Feature Overview

Breve descrição do que será entregue e qual problema ou necessidade atende.

- **Objetivo:** [O que queremos alcançar]
- **Não escopo (explicitamente fora):** [O que este plano não cobre]

---

## 2. Requirements

### Funcionais

- [ ] RF1: [Requisito 1]
- [ ] RF2: [Requisito 2]
- [ ] RF3: [Requisito 3]

### Não funcionais (quando aplicável)

- Performance, acessibilidade, segurança: [itens relevantes ou "N/A"]

---

## 3. Technical Specs

### Stack / impacto

| Área | Tecnologia no SIMP | Impacto neste plano |
|-----|--------------------|---------------------|
| Frontend | Vite, React, TypeScript, shadcn/ui | [Novas páginas? Componentes?] |
| Dados | Supabase | [Novas tabelas? RLS? Queries?] |
| Rotas | React Router | [Novas rotas?] |

### Estrutura de arquivos (sugestão)

- `src/pages/`: [páginas afetadas ou novas]
- `src/components/`: [componentes novos ou alterados]
- `src/integrations/supabase/`: [queries, tipos, hooks se aplicável]
- Outros: [context, lib, etc.]

### Dependências entre tarefas

Indicar ordem quando houver: ex. "Schema Supabase antes de API/UI".

---

## 4. Phases / Tasks

| # | Tarefa | Responsável | Status |
|---|--------|-------------|--------|
| 1 | [Primeira tarefa] | — | [ ] |
| 2 | [Segunda tarefa] | — | [ ] |
| 3 | [Terceira tarefa] | — | [ ] |

Adicione linhas conforme necessário. Quebre em tarefas implementáveis (vertical slice quando fizer sentido: um fluxo mínimo end-to-end antes de polish).

---

## 5. Risks & Mitigation

| Risk 1 | [Descrição do risco] | **Mitigation:** [O que fazer para reduzir] |
| Risk 2 | [Outro risco]        | **Mitigation:** [O que fazer]              |

---

## 6. Validation / Acceptance

- **Cenário 1:** [Como validar o fluxo principal]
- **Cenário 2:** [Outro cenário importante]
- **Edge case:** [Caso limite ou erro esperado]

---

## 7. Reference Documentation

- [Project overview (objetivo, perfis, domínio)](../../.context/docs/project-overview.md) — alinhamento com o propósito do SIMP
- [README do projeto](../../README.md)
- [Supabase / tipos](../../src/integrations/supabase/) (quando aplicável)
- Outros: [links para docs, decisões, ou planos relacionados]

---

*Template baseado em práticas de planejamento por agentes (feature breakdown, architect playbook). Preencha todas as seções obrigatórias antes de iniciar a implementação.*
