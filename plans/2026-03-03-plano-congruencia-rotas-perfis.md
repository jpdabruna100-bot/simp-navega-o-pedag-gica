# Plano — Congruência visual e funcional entre rotas e perfis

**Data:** 2026-03-03  
**Escopo:** Padronizar layout, formatação, títulos e componentes entre as rotas do Professor, Coordenação, Psicologia e Diretoria, garantindo congruência visual e fluxos intuitivos para acompanhamento pedagógico e multidisciplinar.  
**Status:** Rascunho  
**Referências:** [project-overview.md](../.context/docs/project-overview.md), [glossary.md](../.context/docs/glossary.md)

---

## 1. Feature Overview

### Problema
As páginas dos diferentes perfis (Professor, Coordenação, Psicologia, Diretoria) apresentam inconsistências em:
- Títulos e subtítulos (variando entre `text-2xl`, `text-3xl`, com ou sem subtítulo)
- Estrutura da ficha do aluno (informações distintas ou ausentes entre perfis)
- Status de intervenções (valores diferentes: `Concluído` vs `Concluída`, `Em_Acompanhamento` vs `Em andamento`)
- Filtros e barra de ações (implementação heterogênea)
- Componentes de alerta crítico duplicados

### Objetivo
- Uniformizar padrões visuais e de estrutura em todas as rotas
- Garantir que informações relevantes estejam disponíveis em cada perfil conforme sua responsabilidade
- Unificar nomenclatura e valores de status de intervenções
- Facilitar manutenção e evolução do sistema

### Não escopo (explicitamente fora)
- Integração com Supabase ou migração de dados
- Novas funcionalidades de negócio além das já existentes
- Alteração do fluxo operacional descrito no project-overview

---

## 2. Requirements

### Funcionais

- [ ] RF1: Padronizar cabeçalho de página (h1 + subtítulo opcional) em todas as rotas
- [ ] RF2: Unificar valores de status de intervenções em `mockData` e UI (`Aguardando`, `Em_Acompanhamento`, `Concluído`)
- [ ] RF3: Extrair componente compartilhado `CriticalAlertModal` para reutilização em Coordenação e Psicologia
- [ ] RF4: Adicionar seções opcionais por perfil na ficha do aluno (PEI na Coordenação, evolução na Psicologia quando fizer sentido)
- [ ] RF5: Padronizar filtros (turma, risco, período) e integração com query params quando aplicável
- [ ] RF6: Documentar e aplicar convenção de formatação (classes Tailwind, spacing, cores de risco)
- [ ] RF7: Corrigir DirectoryDashboard para usar status de intervenção unificados (`Concluído`, `Em_Acompanhamento`, `Aguardando`)

### Não funcionais
- UX: hierarquia visual consistente; labels claros em todos os indicadores
- Manutenibilidade: componentes reutilizáveis; menos duplicação
- Acessibilidade: manter ou melhorar navegação por teclado, ARIA quando aplicável

---

## 3. Technical Specs

### Stack / impacto

| Área | Tecnologia no SIMP | Impacto neste plano |
|------|--------------------|---------------------|
| Frontend | Vite, React, TypeScript, shadcn/ui, Tailwind | Componentes compartilhados; ajustes de layout e classes |
| Dados | AppContext (mock) | Padronizar status em `mockData.ts` |
| Rotas | React Router | Nenhuma rota nova; apenas ajustes nas páginas existentes |

### Estrutura de arquivos (sugestão)

- `src/components/`: novo `CriticalAlertModal.tsx`; possivelmente `PageHeader.tsx` para padrão de título
- `src/pages/professor/`: ProfessorDashboard, StudentList, StudentDetail
- `src/pages/coordination/`: CoordinationDashboard, AlertsPanel, CoordStudentDetail, InterventionManagement, CriticalOccurrenceDetail
- `src/pages/psychology/`: PsychologyDashboard, PsychStudentDetail
- `src/pages/directory/`: DirectoryDashboard
- `src/data/mockData.ts`: status de Intervention

### Dependências entre tarefas
- Fase 1 (padronização mínima) pode ser feita em paralelo em partes
- Fase 2 depende da unificação de status em mockData (RF2/RF7)
- Fase 3 (componentes compartilhados) deve vir antes de refatorar páginas que os usam

---

## 4. Phases / Tasks (fases de execução)

### Fase 1 — Padronização de cabeçalhos e títulos

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 1.1 | Definir convenção: `h1` com `text-2xl font-bold`; subtítulo com `text-muted-foreground text-sm` | — | [x] |
| 1.2 | Aplicar padrão em ProfessorDashboard, StudentList, StudentDetail | `src/pages/professor/*` | [x] |
| 1.3 | Aplicar padrão em CoordinationDashboard, AlertsPanel, CoordStudentDetail, InterventionManagement | `src/pages/coordination/*` | [x] |
| 1.4 | Aplicar padrão em PsychologyDashboard, PsychStudentDetail | `src/pages/psychology/*` | [x] |
| 1.5 | Aplicar padrão em DirectoryDashboard | `src/pages/directory/*` | [x] |
| 1.6 | (Opcional) Criar componente `PageHeader` e substituir blocos repetidos | `src/components/PageHeader.tsx` | [ ] |

### Fase 2 — Unificação de status de intervenções

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 2.1 | Confirmar enum único em `mockData`: `Aguardando` \| `Em_Acompanhamento` \| `Concluído` | `src/data/mockData.ts` | [ ] |
| 2.2 | Corrigir DirectoryDashboard: mapear `Concluída` → `Concluído`, `Em andamento` → `Em_Acompanhamento`, `Planejada` → `Aguardando` (ou equivalente) | `src/pages/directory/DirectoryDashboard.tsx` | [ ] |
| 2.3 | Validar que InterventionManagement e CoordStudentDetail usam corretamente os status unificados | `src/pages/coordination/*` | [ ] |

### Fase 3 — Componentes compartilhados

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 3.1 | Extrair `CriticalAlertModal`: props `aluno`, `turma`, `reportadoPor`, `sintomas`, `descricao`, `onClose`, `onAssumir` | `src/components/CriticalAlertModal.tsx` | [ ] |
| 3.2 | Integrar `CriticalAlertModal` em CoordinationDashboard (substituir Dialog atual) | `src/pages/coordination/CoordinationDashboard.tsx` | [ ] |
| 3.3 | Integrar `CriticalAlertModal` em PsychologyDashboard (substituir Dialog atual) | `src/pages/psychology/PsychologyDashboard.tsx` | [ ] |

### Fase 4 — Ficha do aluno e informações por perfil

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 4.1 | Garantir exibição do PEI registrado em CoordStudentDetail (usar PEIDisplayCard ou equivalente) | `src/pages/coordination/CoordStudentDetail.tsx` | [ ] |
| 4.2 | Revisar se Professor, Coordenação e Psicologia exibem timeline do aluno de forma consistente | `StudentDetail`, `CoordStudentDetail`, `PsychStudentDetail` | [ ] |
| 4.3 | Documentar matriz "perfil x seção na ficha" (o que cada perfil vê e por quê) | `.context/docs/` ou este plano | [ ] |

### Fase 5 — Filtros e barra de ações

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 5.1 | Padronizar uso de RiskFilterButtons em todas as páginas com lista de alunos | `src/pages/*` | [ ] |
| 5.2 | Padronizar Select de turma (se houver): mesma estrutura e classes | `src/pages/*` | [ ] |
| 5.3 | Revisar integração de filtros com query params (InterventionManagement, AlertsPanel) | `src/pages/coordination/*` | [ ] |

### Fase 6 — Validação e documentação

| # | Tarefa | Arquivos | Status |
|---|--------|----------|--------|
| 6.1 | Executar checklist de validação (ver seção 6) | — | [ ] |
| 6.2 | Atualizar documentação de convenções (Layout, títulos, filtros) em `.context/docs/` | `.context/docs/` | [ ] |

---

## 5. Risks & Mitigation

| Risco | Descrição | Mitigation |
|-------|-----------|------------|
| Quebra de UI | Mudanças em classes ou estrutura podem alterar aparência em telas sensíveis | Testar em cada perfil; smoke test em todas as rotas |
| Inconsistência de dados | DirectoryDashboard usa status diferentes do mockData | Mapear no cálculo; não alterar origem dos dados sem plano de migração |
| Regressão em fluxos críticos | Alterar CriticalAlertModal pode impactar fluxo OC-1 | Manter props e callbacks compatíveis; testar "Assumir Caso" e encaminhamento |

---

## 6. Validation / Acceptance

- **Cenário 1:** Navegar por Professor → Turma → Aluno e verificar títulos e subtítulos padronizados
- **Cenário 2:** Navegar por Coordenação → Alertas, Intervenções, Aluno e verificar consistência visual
- **Cenário 3:** Navegar por Psicologia → Alunos e verificar Kanban e modal de alerta crítico
- **Cenário 4:** Verificar DirectoryDashboard: gráficos e KPIs com status de intervenção corretos
- **Cenário 5:** `npm run build` e `npm run lint` sem erros
- **Edge case:** Aluno sem PEI em CoordStudentDetail não deve quebrar; PEIDisplayCard só aparece se `student.pei` existir

---

## 7. Reference Documentation

- [Project overview (objetivo, perfis, domínio)](../.context/docs/project-overview.md)
- [Glossary](../.context/docs/glossary.md)
- [AGENTS.md / metodologia de edição](../metodologia-escopo-edicao.md)
- [README do projeto](../README.md)

---

*Plano baseado na análise de congruência entre rotas e perfis (Professor, Coordenação, Psicologia, Diretoria). Execução em fases permite validação incremental.*
