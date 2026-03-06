# Plano de Investigação e Debug — Rota do Professor

**Data:** 2026-03-04  
**Escopo:** Investigar e corrigir 5 problemas reportados na rota do professor.  
**Status:** Rascunho  
**Validação:** Políticas RLS validadas via MCP Supabase (user-supabase_simp) em 2026-03-04

---

## 1. Problemas Reportados

| # | Problema | Prioridade |
|---|----------|------------|
| 1 | Erro ao salvar avaliação pedagógica (2 etapas) | Alta |
| 2 | Erro ao salvar avaliação pedagógica (4 etapas) | Alta |
| 3 | Mostrar contagem de avaliações no card do aluno | Média |
| 4 | O PEI deve ser editável pelo professor | Média |
| 5 | Sinalização de ocorrência crítica não está chegando ao coordenador | Alta |

---

## 2. Políticas RLS Validadas (MCP Supabase)

Consulta executada em `pg_policies` e `list_tables` via MCP user-supabase_simp:

### 2.0 Matriz de políticas por tabela

| Tabela | RLS ativo | SELECT | INSERT | UPDATE | Observação |
|--------|-----------|--------|--------|--------|------------|
| assessments | ✅ | ✅ assessments_select_all | ❌ **ausente** | ❌ | **Causa do erro ao salvar avaliação** |
| students | ✅ | ✅ students_select_all | ❌ | ✅ students_update_all | OK para updateStudent |
| timeline_events | ✅ | ✅ | ✅ timeline_events_insert_all | ❌ | OK |
| interventions | ✅ | ✅ | ✅ interventions_insert_all | ✅ interventions_update_all | OK |
| psych_assessments | ✅ | ✅ | ✅ psych_assessments_insert_all | ✅ psych_assessments_update_all | OK |
| family_contacts | ✅ | ✅ | ✅ | ✅ | OK |
| student_documents | ✅ | ✅ | ✅ | ❌ | OK |
| intervention_updates | ✅ | ✅ | ✅ | ❌ | OK |
| profiles | ✅ | ✅ | ❌ | ❌ | — |
| turmas | ✅ | ✅ | ❌ | ❌ | — |
| **critical_occurrences** | ❌ | — | — | — | **RLS desativado** — acesso total, sem policies |
| critical_occurrence_logs | ❌ | — | — | — | RLS desativado |

### 2.0.1 Tabelas com RLS desativado

- `critical_occurrences` e `critical_occurrence_logs` têm `relrowsecurity: false` — não há RLS, operações são permitidas por padrão.
- **Conclusão:** O problema da ocorrência crítica **não é RLS**; a tabela aceita INSERT. O problema é que o app **não persiste** (fluxo mockado).

---

## 3. Análise Preliminar (Investigação)

### 3.1 Erro ao salvar avaliação pedagógica (2 e 4 etapas)

**Arquivos:** `src/pages/professor/ExperimentalAssessment.tsx`, `src/lib/supabase-mutations.ts`, `supabase/migrations/`

**Fluxo atual:**
- `handleSave()` chama: `insertAssessment` → `updateStudent` → `insertTimelineEvent` → (se defasagem) `insertIntervention`
- Todas as chamadas usam Supabase

**Hipóteses de causa:**

| Hipótese | Evidência | Verificação |
|----------|-----------|-------------|
| **H1: RLS bloqueia INSERT em assessments** | A tabela `assessments` tem RLS com apenas `assessments_select_all` (SELECT). **Não existe policy de INSERT.** | Confirmado: `20260303100020_rls_allow_read_public.sql` e `20260304300000_rls_timeline_events_insert.sql` — assessments não tem INSERT policy |
| H2: Schema mismatch (colunas) | `insertAssessment` envia `frequencia_por_area` como JSON; schema aceita JSONB | Verificar se `frequenciaPorArea` (Record) serializa corretamente |
| H3: FK student_id inválido | student_id deve existir em students | Verificar se o student existe no banco |
| H4: Erro em insertIntervention (quando hasDefasagem) | interventions tem INSERT policy em `20260304200000_rls_interventions_update.sql` | Verificar action_category enum e status |

**Ação recomendada:** Criar migration com `assessments_insert_all` policy (INSERT para anon/authenticated). **Confirmado via MCP:** tabela `assessments` tem apenas `assessments_select_all`; INSERT bloqueado por RLS.

---

### 3.2 Mostrar contagem de avaliações no card do aluno

**Arquivos:** `src/pages/professor/StudentList.tsx` (renderCard, renderListItem), `src/pages/professor/StudentDetail.tsx`

**Estado atual:**
- Cards exibem: PEI pendente, Avaliação pendente (badge booleano), Encaminhado, Risco
- **Não exibem** a quantidade de avaliações (ex.: "3 avaliações" ou "3/10 no ano")

**Onde adicionar:**
- `StudentList`: em `renderCard` e `renderListItem` — badge ou texto com `student.assessments.length` (ou contagem por ano letivo)
- `StudentDetail`: na seção de Avaliações Pedagógicas já mostra "X registros" — verificar se está visível

**Ação:** Adicionar badge/texto com contagem (ex.: "3 av." ou "3 no ano") nos cards da turma. Dado disponível: `student.assessments.length` (304 registros em assessments no banco).

---

### 3.3 O PEI deve ser editável pelo professor

**Arquivos:** `src/components/PEIDisplayCard.tsx`, `src/pages/professor/StudentDetail.tsx`, `src/components/PEIWizard.tsx`

**Estado atual:**
- `PEIDisplayCard`: apenas exibe o PEI e botão "Imprimir PEI". **Sem botão de editar.**
- `PEIWizard`: usado para criar PEI; aceita `onSave` e `onOpenChange`. Pode ser reutilizado para edição passando `initialPei` ou equivalente.

**Hipóteses:**
- PEIWizard pode não suportar modo "edição" (pré-preenchido com dados existentes)
- Falta botão "Editar PEI" no PEIDisplayCard que abre o wizard em modo edição

**Ação:** 
1. Verificar se `PEIWizard` aceita dados iniciais para edição
2. Adicionar botão "Editar PEI" no `PEIDisplayCard` ou em `StudentDetail`
3. Implementar fluxo de edição (abrir wizard com dados atuais → salvar via updateStudent). `students` tem coluna `pei` (jsonb) e policy `students_update_all` — update funciona.

---

### 3.4 Sinalização de ocorrência crítica não chega ao coordenador

**Arquivos:** `src/pages/professor/StudentDetail.tsx`, `src/pages/coordination/CoordinationDashboard.tsx`, `supabase/migrations/20260303100011_create_critical_occurrences.sql`

**Fluxo atual (Professor):**
- `handleSendAlert()` em StudentDetail:
  - Valida `alertType` e `alertText`
  - Faz `toast("Alerta Crítico Enviado!")`
  - `setActiveAlertState("novo")`
  - **Não chama nenhuma mutation do Supabase**
  - Simula "coordenação assumiu" com `setTimeout` (mock)

**Fluxo atual (Coordenador):**
- `CoordinationDashboard`: usa `activeAlert` **hardcoded** (Laura Barbosa, etc.)
- Modal de alerta crítico aparece via `setTimeout` (mock) — **não lê de critical_occurrences**
- Não há query para `critical_occurrences` no fetch de dados

**Causa raiz:** O fluxo de ocorrência crítica está **100% mockado**. Não há:
- `insertCriticalOccurrence` em supabase-mutations
- `updateStudent` com `critical_alert: true`
- Query de `critical_occurrences` em supabase-queries
- Integração do CoordinationDashboard com dados reais

**Ação:**
1. Criar `insertCriticalOccurrence(studentId, { categories, description, reportedBy })` em supabase-mutations
2. Em `handleSendAlert`, chamar `insertCriticalOccurrence` e `updateStudent(..., { critical_alert: true })`
3. Incluir `critical_occurrences` no fetch (ou criar hook/query específica)
4. CoordinationDashboard deve ler ocorrências não resolvidas e exibir modal/dados reais
5. **RLS:** `critical_occurrences` tem RLS desativado — INSERT/SELECT funcionam sem policies. Não é necessário criar RLS para este fluxo.

**Schema validado:** `critical_occurrences` tem colunas: id, student_id, status, categories (text[]), description, reported_by, reported_at, resolved_at. Existem 2 registros na tabela.

---

## 4. Tarefas de Correção (Ordem Sugerida)

| # | Tarefa | Arquivos | Dependência |
|---|--------|----------|-------------|
| 1 | Criar migration `assessments_insert_all` (RLS) | `supabase/migrations/` | — |
| 2 | Testar salvamento de avaliação (2 e 4 etapas) | — | 1 |
| 3 | Adicionar contagem de avaliações nos cards | `StudentList.tsx` | — |
| 4 | Implementar edição de PEI pelo professor | `PEIDisplayCard`, `PEIWizard`, `StudentDetail` | Verificar PEIWizard |
| 5 | Implementar fluxo real de ocorrência crítica | `StudentDetail`, `supabase-mutations`, `supabase-queries`, `CoordinationDashboard` | — (RLS desativado em critical_occurrences) |

---

## 5. Verificações de Debug

### Para erro de avaliação (1 e 2):
1. Abrir DevTools → Console ao salvar avaliação
2. Verificar mensagem de erro do Supabase (ex.: "new row violates row-level security policy")
3. Executar `supabase.from("assessments").insert({...}).select()` no console para reproduzir
4. Verificar se `students` existe e `student_id` é UUID válido

### Para ocorrência crítica (5):
1. ~~Verificar se tabela `critical_occurrences` existe e tem RLS~~ — Validado: existe, RLS desativado (acesso livre)
2. ~~Verificar policies~~ — Não aplicável (RLS off)
3. Conferir se `fetchStudents` ou outro hook traz `critical_occurrences` ou `critical_alert` — atualmente não traz

---

## 6. Referências

- [Project overview](../.context/docs/project-overview.md) — Regra de alerta e Dossiê OC-1
- [supabase-mutations](../src/lib/supabase-mutations.ts)
- [supabase-queries](../src/lib/supabase-queries.ts)
- Migrations: `supabase/migrations/`
- **MCP Supabase SIMP:** `user-supabase_simp` — `execute_sql`, `list_tables` para validação de schema e RLS

---

*Plano de investigação para correção dos bugs reportados na rota do professor. Políticas RLS validadas via MCP em 2026-03-04.*
