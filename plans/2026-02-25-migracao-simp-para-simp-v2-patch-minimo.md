# Plano — Migração SIMP para SIMP-V2 (patch mínimo)

**Data:** 2026-02-25  
**Escopo:** Adicionar todas as páginas e rotas do SIMP ao projeto SIMP-V2 com alterações mínimas (Next.js App Router, layout SIMP, dados em mock/context), mantendo todas as telas funcionando. **Mesmas URLs e nomes do SIMP** — o projeto SIMP será desativado e o SIMP-V2 passa a ser o produto único.  
**Status:** Rascunho | Em revisão | Aprovado | Em execução | Concluído  
**Destino:** SIMP-V2 (`/Users/david/Documents/Workspace/SIMP-V2`) — Next.js, Clerk, Prisma, subscription.

---

## 1. Feature Overview

- **Objetivo:** Levar o frontend do SIMP (todas as telas e fluxos) para o SIMP-V2 com **patch mínimo**: criar rotas no App Router, adaptar navegação (React Router → Next.js), usar um layout SIMP (header com voltar, logo, perfil, Sair via Clerk) e manter dados em memória (mock/context) para que todas as telas continuem funcionando sem alterar regras de negócio.
- **Decisão sobre admin:** O `/admin` do SIMP-V2 (template: créditos, usuários, configurações) **permanece inalterado**. O painel de gestão do SIMP (AdminDashboard) é acrescentado em **`/gestao-simp`**. Nada é unificado nem movido no admin do template.
- **Não escopo (nesta fase):** Persistência em Prisma; substituir Clerk por outro auth; alterar fluxos ou UX além do estritamente necessário para rodar no Next.js.

---

## 2. Requirements

### Funcionais

- [ ] RF1: **Mesmas URLs do SIMP** no SIMP-V2: `/`, `/professor`, `/professor/turma/[turmaId]`, `/psicologia`, `/coordenacao`, `/diretoria`, `/gestao-simp` (painel admin do SIMP). **O `/admin` permanece do SIMP-V2** (template: créditos, usuários) — não é alterado; apenas são acrescentadas as demais páginas. Comportamento visível idêntico (listas, filtros, formulários, navegação).
- [ ] RF2: Layout SIMP (header com botão voltar, logo SIMP, perfil atual, botão Sair) aplicado a essas rotas; "Sair" chama Clerk `signOut`.
- [ ] RF3: Seleção de perfil (Professor, Psicologia, Coordenação, Diretoria, Gestão SIMP) após login; ao escolher “Gestão SIMP”, redirecionar para `/gestao-simp`. Estado de perfil mantido no contexto durante a sessão.
- [ ] RF4: Dados em memória (alunos, turmas, avaliações, intervenções, timeline) idênticos ao SIMP atual — via cópia de `mockData` + provider/contexto no SIMP-V2.
- [ ] RF5: Nenhuma tela existente do SIMP-V2 (dashboard, billing, ai-chat, admin) deixar de funcionar.

### Não funcionais

- Acesso às rotas do app (/, /professor, /psicologia, etc.) exige usuário autenticado (Clerk). Definir se exige subscription ativa ou apenas login (ex.: incluir essas rotas em `allowedPaths` no layout (protected) se for acesso pós-login sem plano).
- Código das páginas SIMP deve seguir convenções do SIMP-V2 (alias `@/`, estrutura de pastas em `src/app/`).

---

## 3. Technical Specs

### Origem vs destino

| Aspecto | SIMP (origem) | SIMP-V2 (destino) |
|---------|----------------|-------------------|
| Framework | Vite + React Router | Next.js (App Router) |
| Rotas | `src/App.tsx` (Routes) | `src/app/(protected)/(app)/` — route group sem segmento na URL (/, /professor, …) |
| Navegação | `useNavigate`, `useParams`, `<Link to>` | `useRouter`, `usePathname`, `params` (props), `<Link href>` |
| Layout | `Layout.tsx` (header, voltar, Sair) | Layout SIMP em `(protected)/(app)/layout.tsx` (mesmo conceito, Sair = Clerk) |
| Dados | `AppContext` + `mockData.ts` | Provider + mesmo mock (cópia ou módulo compartilhado) |

### Mapeamento de rotas (SIMP → SIMP-V2) — mesmas URLs

Usar route group `(app)` dentro de `(protected)` para que a URL não ganhe segmento: `(protected)/(app)/page.tsx` → `/`, `(protected)/(app)/professor/page.tsx` → `/professor`.

| Rota (igual no SIMP e no SIMP-V2) | Arquivo no SIMP-V2 |
|-----------------------------------|---------------------|
| `/` (ProfileSelection) | `src/app/(protected)/(app)/page.tsx` |
| `/professor` | `src/app/(protected)/(app)/professor/page.tsx` |
| `/professor/turma/:turmaId` | `src/app/(protected)/(app)/professor/turma/[turmaId]/page.tsx` |
| `/professor/aluno/:studentId` | `src/app/(protected)/(app)/professor/aluno/[studentId]/page.tsx` |
| `/professor/aluno/:studentId/avaliacao` | `src/app/(protected)/(app)/professor/aluno/[studentId]/avaliacao/page.tsx` |
| `/psicologia` | `src/app/(protected)/(app)/psicologia/page.tsx` |
| `/psicologia/aluno/:studentId` | `src/app/(protected)/(app)/psicologia/aluno/[studentId]/page.tsx` |
| `/coordenacao` | `src/app/(protected)/(app)/coordenacao/page.tsx` |
| `/coordenacao/alertas` | `src/app/(protected)/(app)/coordenacao/alertas/page.tsx` |
| `/coordenacao/aluno/:studentId` | `src/app/(protected)/(app)/coordenacao/aluno/[studentId]/page.tsx` |
| `/coordenacao/intervencoes` | `src/app/(protected)/(app)/coordenacao/intervencoes/page.tsx` |
| `/diretoria` | `src/app/(protected)/(app)/diretoria/page.tsx` |
| `/gestao-simp` (painel admin do SIMP) | `src/app/(protected)/(app)/gestao-simp/page.tsx` — conteúdo do AdminDashboard do SIMP. **`/admin` permanece do SIMP-V2** (template: créditos, usuários) e não é alterado. |
| 404 | Next.js `not-found.tsx` conforme convenção do SIMP-V2 |

URLs finais do app SIMP: `/`, `/professor`, `/professor/turma/t1`, `/psicologia`, `/coordenacao`, `/diretoria`, `/gestao-simp`. O `/admin` continua sendo exclusivamente o admin do template SIMP-V2.

### O que levar do SIMP (checklist)

- **Páginas (origem):** `ProfileSelection`, `professor/*` (ProfessorDashboard, StudentList, StudentDetail, NewAssessment), `psychology/*` (PsychologyDashboard, PsychStudentDetail), `coordination/*` (CoordinationDashboard, AlertsPanel, InterventionManagement, CoordStudentDetail), `directory/DirectoryDashboard`, `admin/AdminDashboard` (→ página em `/gestao-simp`), `NotFound`.
- **Componentes:** `Layout.tsx` (adaptar para Next + Clerk), `RiskBadge`, `RiskFilterButtons`; componentes em `src/components/ui/` — conferir se já existem no SIMP-V2 (shadcn) para evitar duplicação.
- **Contexto e dados:** `AppContext` (perfil + students/setStudents); `src/data/mockData.ts` (tipos, initialStudents, turmas, getPsychStatus, etc.) — copiar ou referenciar no SIMP-V2.
- **Lógica de domínio:** Cálculo de risco (em NewAssessment), getPsychStatus, getPsychStatusLabel, etc. — manter ao migrar as páginas.

### Adaptações obrigatórias por página

- Trocar `useParams()` por `params` (props do Server Component) ou `useParams()` de `next/navigation` em Client Components.
- Trocar `useNavigate()` por `useRouter()` de `next/navigation`; `navigate('/path')` → `router.push('/path')` (mesmas URLs).
- Trocar `<Link to="...">` por `<Link href="...">` (Next.js).
- Links internos mantêm as mesmas URLs do SIMP (ex.: `/professor/turma/${id}`, `/psicologia/aluno/${id}`).
- Layout: usar `usePathname()` para "voltar" ou highlight; Sair → `signOut()` do Clerk.

### Dependências entre tarefas

1. Criar layout SIMP e provider de contexto (perfil + mock) antes de migrar páginas.
2. Incluir as rotas do app (/, /professor, /psicologia, /coordenacao, /diretoria, /gestao-simp) em `allowedPaths` no `(protected)/layout.tsx` (se a política for acesso pós-login sem subscription). No layout (protected), condicionar a exibição da Sidebar: nas rotas do app (/, /professor, /psicologia, /coordenacao, /diretoria, /gestao-simp) não mostrar Sidebar; nas demais (/dashboard, /billing, /ai-chat, /admin) manter Sidebar.
3. Ordem sugerida: layout (app) + seleção de perfil → professor (fluxo completo) → psicologia → coordenação → diretoria → gestao-simp → not-found.

---

## 4. Phases / Tasks

| # | Fase | Tarefas | Status |
|---|------|---------|--------|
| 1 | **Preparação no SIMP-V2** | Garantir que SIMP-V2 roda localmente (Clerk, .env). Criar route group `(app)` em `src/app/(protected)/(app)/`. Decidir política de subscription; se for só login, adicionar `/`, `/professor`, `/psicologia`, `/coordenacao`, `/diretoria`, `/gestao-simp` a `allowedPaths`. Ajustar `(protected)/layout.tsx` para não exibir Sidebar nas rotas do app (pathname em /, /professor, /psicologia, /coordenacao, /diretoria, /gestao-simp). **`/admin` permanece do SIMP-V2** — não alterar. | [ ] |
| 2 | **Dados e contexto** | Copiar (ou adaptar) `mockData.ts` e tipos para SIMP-V2 (ex.: `src/lib/simp/mockData.ts`). Criar provider React (perfil SIMP + estado students) compatível com o `useApp()` do SIMP; envolver as rotas do app no provider (layout de `(app)`). | [ ] |
| 3 | **Layout SIMP** | Criar `src/app/(protected)/(app)/layout.tsx` que renderize o header SIMP (voltar, logo, perfil, Sair com Clerk). Usar `usePathname()` e `useRouter()`; botão Sair chama `signOut()`. Garantir que `children` seja o conteúdo da rota. | [ ] |
| 4 | **Seleção de perfil** | Implementar `src/app/(protected)/(app)/page.tsx` a partir de ProfileSelection: escolha Professor, Psicologia, Coordenação, Diretoria, Gestão SIMP; ao escolher, redirecionar para `/professor`, `/psicologia`, `/coordenacao`, `/diretoria`, `/gestao-simp` respectivamente. Persistir perfil no estado do provider. | [ ] |
| 5 | **Rotas Professor** | Implementar (app)/professor/page.tsx, professor/turma/[turmaId]/page.tsx, professor/aluno/[studentId]/page.tsx, professor/aluno/[studentId]/avaliacao/page.tsx. Adaptar navegação e params; manter lógica de risco e timeline ao salvar avaliação. | [ ] |
| 6 | **Rotas Psicologia** | Implementar psicologia/page.tsx (lista + filtros), psicologia/aluno/[studentId]/page.tsx. | [ ] |
| 7 | **Rotas Coordenação** | Implementar coordenacao/page.tsx, coordenacao/alertas/page.tsx, coordenacao/aluno/[studentId]/page.tsx, coordenacao/intervencoes/page.tsx. | [ ] |
| 8 | **Rotas Diretoria e Gestão SIMP** | Implementar diretoria/page.tsx e gestao-simp/page.tsx (conteúdo do AdminDashboard do SIMP). | [ ] |
| 9 | **NotFound e ajustes** | Revisar todos os links internos (mesmas URLs do SIMP); garantir que Toaster/Sonner e TooltipProvider existam no layout raiz ou no layout (app). | [ ] |
| 10 | **Validação** | Percorrer todas as rotas (/, /professor, /psicologia, /coordenacao, /diretoria, /gestao-simp); testar fluxo Professor (turmas → aluno → nova avaliação), Psicologia (filtros, ficha), Coordenação (alertas, intervenções), Diretoria, Gestão SIMP. Confirmar que /dashboard, /billing e /admin (template SIMP-V2) seguem funcionando. | [ ] |

---

## 5. Risks & Mitigation

| Risco | Mitigation |
|-------|------------|
| Redirect para `/subscribe` ao acessar rotas do app | Incluir `/`, `/professor`, `/psicologia`, `/coordenacao`, `/diretoria`, `/gestao-simp` em `allowedPaths` no (protected) layout, a menos que a regra de produto exija subscription. |
| Conflito de componentes UI (shadcn) entre SIMP e SIMP-V2 | Comparar `components/ui` de ambos; usar os do SIMP-V2 e adaptar imports nas páginas migradas; copiar apenas componentes que não existirem (ex.: RiskBadge, RiskFilterButtons). |
| Perfil SIMP perdido ao recarregar | Persistir em localStorage ou em Clerk metadata (fase futura); nesta fase, estado em memória é aceitável (perfil resetado ao recarregar). |

---

## 6. Validation / Acceptance

- **Cenário 1:** Usuário logado acessa `/`, escolhe Professor, vê lista de turmas em `/professor`, entra em uma turma, abre um aluno, abre Nova avaliação, preenche e salva; volta à ficha e vê risco e timeline atualizados.
- **Cenário 2:** Usuário escolhe Psicologia; vê lista de encaminhados em `/psicologia` com filtros; abre ficha de um aluno; dados e badges corretos.
- **Cenário 3:** Coordenação acessa `/coordenacao`, alertas e intervenções; Diretoria vê dashboard em `/diretoria`; perfil Gestão SIMP acessa painel em `/gestao-simp`.
- **Cenário 4:** Acesso a `/dashboard`, `/billing` e `/admin` (template SIMP-V2) continua funcionando; Sair no layout SIMP desloga o usuário (Clerk).

---

## 7. Reference Documentation

- [Project overview SIMP](../.context/docs/project-overview.md) — objetivo, perfis, domínio.
- [README SIMP](../README.md) — contexto do projeto de origem.
- [README SIMP-V2](../../SIMP-V2/README.md) — setup e estrutura do destino.
- [Documentação SIMP-V2](../../SIMP-V2/.context/docs/README.md) — arquitetura, frontend, auth.
- [Metodologia de escopo](metodologia-escopo-edicao.md) — alterar apenas o que este plano define.

---

*Plano de migração com patch mínimo. Execução sugerida via Feature Developer (implementação) e Feature Breakdown (quebra em tarefas). Após conclusão, evolução futura pode incluir persistência Prisma e perfil em Clerk.*
