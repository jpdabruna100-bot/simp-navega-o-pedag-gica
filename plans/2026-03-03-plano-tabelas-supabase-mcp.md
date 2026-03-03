# Plano — Tabelas Supabase para o SIMP (via MCP)

**Data:** 2026-03-03  
**Escopo:** Definir e implementar o schema de banco de dados no Supabase a partir das interfaces do domínio (mockData, project-overview), usando o MCP `user-supabase_simp` (`apply_migration`).  
**Status:** Executado (migrações criadas em `supabase/migrations/`; tipos regenerados)

---

## 1. Feature Overview

### Objetivo

Criar as tabelas necessárias no Supabase para migrar o SIMP de dados em memória (mockData) para persistência real, alinhadas à arquitetura e ao domínio descritos em [project-overview.md](../.context/docs/project-overview.md).

### Mapeamento: Interfaces → Tabelas

As interfaces em `src/data/mockData.ts` e o fluxo do sistema (incl. Dossiê OC-1) indicam as entidades abaixo. O Supabase `types.ts` está vazio (`Tables: { [_ in never]: never }`), portanto todas as tabelas precisam ser criadas.

### Não escopo (explicitamente fora)

- Migração de dados (seed) do mockData para o banco
- Integração do frontend com Supabase (queries, hooks, AppContext)
- RLS (Row Level Security) detalhado (pode ser fase futura)
- Storage para upload de documentos (laudos, PEI em PDF)

---

## 2. Entidades e Tabelas

### 2.1 Tabelas principais

| Entidade (mockData) | Tabela Supabase   | Descrição |
|---------------------|-------------------|-----------|
| User                | `profiles`        | Perfis ligados ao `auth.users` (professor, coordenação, psicologia, etc.) |
| Turma               | `turmas`          | Turmas (nome, turno, professor) |
| Student             | `students`        | Alunos (matrícula, turma, risco, encaminhamento, PEI, etc.) |
| Assessment          | `assessments`     | Avaliações pedagógicas mensais |
| PsychAssessment     | `psych_assessments` | Avaliações psicológicas/psicopedagógicas |
| Intervention        | `interventions`   | Acompanhamentos (Kanban: Aguardando, Em_Acompanhamento, Concluído) |
| InterventionUpdate  | `intervention_updates` | Atualizações/andamento de intervenções |
| FamilyContact       | `family_contacts` | Contato com família (3 tentativas, retorno) |
| FamilyContactAttempt| (embed em JSONB)  | Tentativas dentro de `family_contacts` |
| StudentDocument     | `student_documents` | Laudos, PEI, atestados (arquivo via URL) |
| TimelineEvent       | `timeline_events` | Histórico/prontuário do aluno |
| Critical Occurrence | `critical_occurrences` | Dossiês OC-1 (alertas críticos iminentes) |
| Critical Occurrence Log | `critical_occurrence_logs` | Log de ações por ocorrência |

### 2.2 Relacionamentos (FKs)

```
profiles (auth.users)
  ↑
turmas.professor_id → profiles.id
  ↑
students.turma_id → turmas.id
  ├── assessments.student_id → students.id
  ├── psych_assessments.student_id → students.id
  ├── interventions.student_id → students.id
  ├── family_contacts.student_id → students.id
  ├── student_documents.student_id → students.id
  ├── timeline_events.student_id → students.id
  └── critical_occurrences.student_id → students.id
        └── critical_occurrence_logs.occurrence_id → critical_occurrences.id

intervention_updates.intervention_id → interventions.id
```

---

## 3. Especificação das Tabelas (DDL)

### 3.1 Enums

```sql
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE user_role AS ENUM ('professor', 'psicologia', 'psicopedagogia', 'coordenacao', 'diretoria', 'admin');
CREATE TYPE intervention_status AS ENUM ('Aguardando', 'Em_Acompanhamento', 'Concluído');
CREATE TYPE psych_assessment_tipo AS ENUM ('Inicial', 'Reavaliação', 'Acompanhamento');
CREATE TYPE action_category AS ENUM ('Ações Internas', 'Acionar Família', 'Acionar Psicologia', 'Acionar Psicopedagogia', 'Equipe Multidisciplinar');
CREATE TYPE timeline_event_type AS ENUM ('assessment', 'psych', 'intervention', 'referral', 'family_contact', 'potencialidades_registradas', 'pei_atualizado');
CREATE TYPE critical_occurrence_status AS ENUM ('Em Tratativa', 'Resolvido');
CREATE TYPE document_category AS ENUM ('laudo', 'pei', 'outro');
CREATE TYPE document_type AS ENUM ('pdf', 'image', 'doc');
```

### 3.2 Tabela `profiles`

Integração com Supabase Auth: `profiles.id` = `auth.users.id`.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Tabela `turmas`

```sql
CREATE TABLE turmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  turno TEXT NOT NULL,
  professor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Tabela `students`

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  matricula TEXT NOT NULL UNIQUE,
  turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  risk_level risk_level NOT NULL DEFAULT 'low',
  last_assessment_date DATE,
  psych_referral BOOLEAN NOT NULL DEFAULT FALSE,
  psych_referral_reason TEXT,
  critical_alert BOOLEAN DEFAULT FALSE,
  medicacao TEXT,
  acompanhamento_externo TEXT,
  potencialidades TEXT,
  zdp TEXT,
  pei JSONB,
  pei_recomendado JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_students_turma_id ON students(turma_id);
CREATE INDEX idx_students_risk_level ON students(risk_level);
CREATE INDEX idx_students_psych_referral ON students(psych_referral);
```

### 3.5 Tabela `assessments`

```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  ano_letivo INT NOT NULL,
  bimestre INT NOT NULL,
  conceito_geral TEXT NOT NULL,
  leitura TEXT NOT NULL,
  escrita TEXT NOT NULL,
  matematica TEXT NOT NULL,
  atencao TEXT NOT NULL,
  comportamento TEXT NOT NULL,
  dificuldade_percebida BOOLEAN NOT NULL DEFAULT FALSE,
  observacao_professor TEXT,
  principal_dificuldade TEXT,
  recorrente_ou_recente TEXT,
  estrategia_em_sala TEXT,
  sintomas_identificados TEXT[],
  acoes_iniciais TEXT[],
  outros_sintomas TEXT,
  outra_acao TEXT,
  frequencia_por_area JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assessments_student_id ON assessments(student_id);
CREATE INDEX idx_assessments_ano_bimestre ON assessments(ano_letivo, bimestre);
```

### 3.6 Tabela `psych_assessments`

```sql
CREATE TABLE psych_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  tipo psych_assessment_tipo NOT NULL,
  classificacao TEXT NOT NULL,
  necessita_acompanhamento BOOLEAN NOT NULL DEFAULT TRUE,
  observacao TEXT,
  possui_pei TEXT CHECK (possui_pei IN ('Sim', 'Não', 'Em elaboração')),
  responsavel TEXT,
  potencialidades TEXT,
  zdp TEXT,
  queixa_descritiva TEXT,
  pei JSONB,
  recomenda_elaboracao_pei BOOLEAN,
  areas_atencao_pei TEXT[],
  sugestoes_pei TEXT,
  prazo_pei DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_psych_assessments_student_id ON psych_assessments(student_id);
```

### 3.7 Tabela `interventions`

```sql
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  action_category action_category NOT NULL,
  action_tool TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  status intervention_status NOT NULL DEFAULT 'Aguardando',
  pending_until DATE,
  resolution_ata TEXT,
  accepted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_interventions_student_id ON interventions(student_id);
CREATE INDEX idx_interventions_status ON interventions(status);
```

### 3.8 Tabela `intervention_updates`

```sql
CREATE TABLE intervention_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id UUID NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intervention_updates_intervention_id ON intervention_updates(intervention_id);
```

### 3.9 Tabela `family_contacts`

`tentativa1`, `tentativa2`, `tentativa3` armazenados como JSONB: `{ done: boolean, date: string | null }`.

```sql
CREATE TABLE family_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE UNIQUE,
  tentativa1 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  tentativa2 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  tentativa3 JSONB NOT NULL DEFAULT '{"done": false, "date": null}',
  houve_retorno BOOLEAN,
  observacao TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_family_contacts_student_id ON family_contacts(student_id);
```

### 3.10 Tabela `student_documents`

```sql
CREATE TABLE student_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type document_type NOT NULL,
  date DATE NOT NULL,
  responsavel TEXT NOT NULL,
  url TEXT NOT NULL,
  doc_category document_category,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_documents_student_id ON student_documents(student_id);
```

### 3.11 Tabela `timeline_events`

```sql
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type timeline_event_type NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_events_student_id ON timeline_events(student_id);
```

### 3.12 Tabela `critical_occurrences`

```sql
CREATE TABLE critical_occurrences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status critical_occurrence_status NOT NULL DEFAULT 'Em Tratativa',
  categories TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL,
  reported_by TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_critical_occurrences_student_id ON critical_occurrences(student_id);
CREATE INDEX idx_critical_occurrences_status ON critical_occurrences(status);
```

### 3.13 Tabela `critical_occurrence_logs`

```sql
CREATE TABLE critical_occurrence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurrence_id UUID NOT NULL REFERENCES critical_occurrences(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_critical_occurrence_logs_occurrence_id ON critical_occurrence_logs(occurrence_id);
```

---

## 4. Uso do MCP Supabase (`user-supabase_simp`)

### 4.1 Pré-requisito

O MCP `user-supabase_simp` requer autenticação via `SUPABASE_ACCESS_TOKEN` ou `--access-token`. Sem token válido, `list_tables`, `apply_migration` e `execute_sql` retornam erro `Unauthorized`.

**Passos:**
1. Gerar token em: Supabase Dashboard → Account → Access Tokens
2. Configurar no ambiente onde o MCP é executado (Cursor/Codex)

### 4.2 Ferramentas disponíveis

| Ferramenta | Uso neste plano |
|------------|------------------|
| `list_tables` | Verificar tabelas existentes antes de aplicar migrações |
| `apply_migration` | Aplicar DDL (CREATE TABLE, CREATE TYPE, etc.) — **principal** |
| `execute_sql` | Query DML/SELECT (não recomendado para DDL; preferir `apply_migration`) |
| `generate_typescript_types` | Regenerar `src/integrations/supabase/types.ts` após criar tabelas |

### 4.3 Ordem de migrações

As migrações precisam respeitar dependências (FKs). Sugestão de ordem:

1. **Enums** — sem dependências
2. **profiles** — depende de `auth.users` (Supabase já possui)
3. **turmas** — depende de `profiles`
4. **students** — depende de `turmas`
5. **assessments**, **psych_assessments**, **interventions**, **family_contacts**, **student_documents**, **timeline_events** — dependem de `students`
6. **intervention_updates** — depende de `interventions`
7. **critical_occurrences** — depende de `students`
8. **critical_occurrence_logs** — depende de `critical_occurrences`

**Nota sobre `profiles`:** Se o projeto ainda não usa Supabase Auth com tabela `profiles`, pode ser necessário criar primeiro um schema que não referencia `auth.users`, ou usar `UUID` sem FK até a integração com Auth. Alternativa: criar `profiles` com `id UUID PRIMARY KEY` e sincronizar com `auth.users` via trigger ou função posteriormente.

---

## 5. Phases / Tasks (Fases de Execução)

### Fase 1 — Preparação e enums

| # | Tarefa | Ferramenta MCP | Status |
|---|--------|----------------|--------|
| 1.1 | Verificar tabelas existentes em `public` | `list_tables` | [x] (N/A: MCP indisponível) |
| 1.2 | Aplicar migração `create_enums` com todos os CREATE TYPE | `apply_migration` / `supabase/migrations/` | [x] |

### Fase 2 — Tabelas base (profiles, turmas, students)

| # | Tarefa | Ferramenta MCP | Status |
|---|--------|----------------|--------|
| 2.1 | Criar `profiles` (ou adaptar se auth ainda não estiver em uso) | `apply_migration` / `supabase/migrations/` | [x] |
| 2.2 | Criar `turmas` | `apply_migration` / `supabase/migrations/` | [x] |
| 2.3 | Criar `students` | `apply_migration` / `supabase/migrations/` | [x] |

### Fase 3 — Tabelas ligadas a students

| # | Tarefa | Ferramenta MCP | Status |
|---|--------|----------------|--------|
| 3.1 | Criar `assessments` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.2 | Criar `psych_assessments` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.3 | Criar `interventions` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.4 | Criar `intervention_updates` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.5 | Criar `family_contacts` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.6 | Criar `student_documents` | `apply_migration` / `supabase/migrations/` | [x] |
| 3.7 | Criar `timeline_events` | `apply_migration` / `supabase/migrations/` | [x] |

### Fase 4 — Ocorrências críticas (OC-1)

| # | Tarefa | Ferramenta MCP | Status |
|---|--------|----------------|--------|
| 4.1 | Criar `critical_occurrences` | `apply_migration` / `supabase/migrations/` | [x] |
| 4.2 | Criar `critical_occurrence_logs` | `apply_migration` / `supabase/migrations/` | [x] |

### Fase 5 — Regenerar tipos e validação

| # | Tarefa | Ferramenta MCP | Status |
|---|--------|----------------|--------|
| 5.1 | Regenerar `src/integrations/supabase/types.ts` | `generate_typescript_types` | [x] |
| 5.2 | Rodar `npm run build` e `npm run lint` | terminal | [x] |

---

## 6. Alternativa: Tabela `profiles` sem Auth

Se o Supabase Auth ainda não estiver configurado, criar `profiles` sem FK para `auth.users`:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

E `turmas.professor_id` referencia `profiles(id)`. Depois, migração futura pode vincular `profiles.id` ao `auth.users.id` quando Auth estiver em uso.

---

## 7. Risks & Mitigation

| Risco | Descrição | Mitigation |
|-------|-----------|------------|
| Token inválido | MCP retorna Unauthorized | Configurar `SUPABASE_ACCESS_TOKEN` no ambiente |
| Auth não configurado | `profiles` FK para `auth.users` falha | Usar tabela `profiles` sem FK (ver seção 6) |
| Ordem de migrações | FKs falham se tabela referenciada não existir | Aplicar na ordem definida na seção 4.3 |
| Nomenclatura diferente | tipos.ts gerado usa snake_case, mockData usa camelCase | Mapear no código ou manter camelCase em views/aliases |
| RLS | Sem RLS, todos leem/escrevem tudo | Plano futuro: políticas por perfil |

---

## 8. Validation / Acceptance

- **Cenário 1:** `list_tables` retorna todas as tabelas criadas (profiles, turmas, students, assessments, psych_assessments, interventions, intervention_updates, family_contacts, student_documents, timeline_events, critical_occurrences, critical_occurrence_logs)
- **Cenário 2:** `generate_typescript_types` gera tipos coerentes em `src/integrations/supabase/types.ts`
- **Cenário 3:** `npm run build` e `npm run lint` passam
- **Edge case:** Migração idempotente — se tabela já existir, `apply_migration` pode falhar; documentar rollback ou uso de `IF NOT EXISTS` quando apropriado

---

## 9. Reference Documentation

- [Project overview (objetivo, perfis, domínio)](../.context/docs/project-overview.md)
- [Architecture](../.context/docs/architecture.md)
- [mockData.ts — interfaces do domínio](../src/data/mockData.ts)
- [Supabase types](../src/integrations/supabase/types.ts)
- [Plans README](README.md)
- MCP `user-supabase_simp`: tools em `mcps/user-supabase_simp/tools/`

---

*Plano baseado na análise da arquitetura do SIMP e das interfaces em mockData.ts. Execução via MCP Supabase (`apply_migration`) requer token de acesso configurado.*

---

## 10. Execução realizada (2026-03-03)

O MCP `user-supabase_simp` não estava disponível na sessão. As migrações foram criadas como arquivos SQL em `supabase/migrations/` e os tipos TypeScript foram gerados manualmente em `src/integrations/supabase/types.ts`.

### Como aplicar as migrações ao banco

**Opção A — Supabase CLI** (instale: `brew install supabase/tap/supabase`):

```sh
supabase link --project-ref rbkwfjydneknqnumaswy  # project_id em config.toml
supabase db push
```

**Opção B — Dashboard Supabase:**

1. Acesse o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. SQL Editor → New query
3. Copie e execute cada arquivo em `supabase/migrations/` na ordem numérica (00000 a 00012)

**Arquivos de migração criados:**

- `20260303100000_create_enums.sql`
- `20260303100001_create_profiles.sql`
- `20260303100002_create_turmas.sql`
- `20260303100003_create_students.sql`
- `20260303100004_create_assessments.sql`
- `20260303100005_create_psych_assessments.sql`
- `20260303100006_create_interventions.sql`
- `20260303100007_create_intervention_updates.sql`
- `20260303100008_create_family_contacts.sql`
- `20260303100009_create_student_documents.sql`
- `20260303100010_create_timeline_events.sql`
- `20260303100011_create_critical_occurrences.sql`
- `20260303100012_create_critical_occurrence_logs.sql`
