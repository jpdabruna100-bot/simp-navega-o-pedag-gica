# Plano — Migração do frontend e domínio SIMP para o starter-kit-v2

**Data:** 2026-02-25  
**Escopo:** Levar o frontend (telas, componentes, fluxos) e o modelo de domínio do SIMP para dentro do projeto starter-kit-v2-1.3.1 (Next.js, Clerk, Prisma), utilizando a infraestrutura já existente (auth, API, .env, banco).  
**Status:** Rascunho | Em revisão | Aprovado | Em execução | Concluído  
**Repositório de destino:** starter-kit-v2-1.3.1 (Next.js 16, Clerk, Prisma, PostgreSQL)

---

## 1. Feature Overview

- **Objetivo:** Integrar o SIMP (Sistema Integrado de Monitoramento Pedagógico) ao starter-kit-v2, mantendo o frontend e a lógica de domínio do SIMP e aproveitando auth (Clerk), API routes, Prisma e configuração do starter-kit. O trabalho é feito **no repositório do starter-kit**: as telas e o domínio do SIMP são incorporados lá; o repositório SIMP permanece como referência de origem.
- **Não escopo:** Migrar o starter-kit para dentro do SIMP; substituir Clerk por outro provedor de auth; reescrever do zero as telas do SIMP (reutilizar/adaptar o que já existe).

---

## 2. Requirements

### Funcionais

- [ ] RF1: Todas as rotas e fluxos do SIMP (professor, psicologia, coordenação, diretoria, admin) disponíveis no starter-kit, com as mesmas URLs ou convenção equivalente (ex.: `/professor`, `/professor/turma/[turmaId]`, `/professor/aluno/[studentId]/avaliacao`).
- [ ] RF2: Layout do SIMP (header com logo, botão voltar, perfil, Sair) integrado ao starter-kit; "Sair" utiliza sign-out do Clerk.
- [ ] RF3: Seleção de perfil (Professor, Psicologia, Coordenação, Diretoria, Admin) após login Clerk; restrição de acesso por perfil quando aplicável.
- [ ] RF4: Dados de alunos, turmas, avaliações e intervenções persistidos no banco (Prisma); modelo de dados alinhado aos conceitos do SIMP (ver [project-overview](../.context/docs/project-overview.md)).
- [ ] RF5: Regras de negócio do SIMP preservadas (cálculo de risco a partir de avaliações, timeline, encaminhamento psicologia, etc.).

### Não funcionais

- Seguir convenções do starter-kit (App Router, Server Components onde fizer sentido, API routes para mutações).
- Não quebrar funcionalidades existentes do starter-kit (auth, créditos, admin genérico) sem decisão explícita; SIMP pode coexistir como conjunto de rotas/features.

---

## 3. Technical Specs

### Origem (SIMP) vs Destino (starter-kit)

| Aspecto | SIMP (origem) | starter-kit (destino) |
|---------|----------------|------------------------|
| Framework | Vite + React Router | Next.js 16 (App Router) |
| Auth | Nenhum (seleção de perfil local) | Clerk |
| Dados | Estado global (AppContext) + mock (`src/data/mockData.ts`) | Prisma + PostgreSQL |
| Rotas | `src/App.tsx` (Routes) | `src/app/` (pastas = rotas) |
| Layout | `src/components/Layout.tsx` | A ser integrado em `(protected)` ou layout específico SIMP |

### Mapeamento de rotas SIMP → App Router (starter-kit)

| Rota SIMP (React Router) | Destino sugerido (Next.js App Router) |
|--------------------------|----------------------------------------|
| `/` (ProfileSelection) | `src/app/(protected)/simp/page.tsx` ou rota pós-login para escolha de perfil SIMP |
| `/professor` | `src/app/(protected)/simp/professor/page.tsx` |
| `/professor/turma/:turmaId` | `src/app/(protected)/simp/professor/turma/[turmaId]/page.tsx` |
| `/professor/aluno/:studentId` | `src/app/(protected)/simp/professor/aluno/[studentId]/page.tsx` |
| `/professor/aluno/:studentId/avaliacao` | `src/app/(protected)/simp/professor/aluno/[studentId]/avaliacao/page.tsx` |
| `/psicologia` | `src/app/(protected)/simp/psicologia/page.tsx` |
| `/psicologia/aluno/:studentId` | `src/app/(protected)/simp/psicologia/aluno/[studentId]/page.tsx` |
| `/coordenacao` | `src/app/(protected)/simp/coordenacao/page.tsx` |
| `/coordenacao/alertas` | `src/app/(protected)/simp/coordenacao/alertas/page.tsx` |
| `/coordenacao/aluno/:studentId` | `src/app/(protected)/simp/coordenacao/aluno/[studentId]/page.tsx` |
| `/coordenacao/intervencoes` | `src/app/(protected)/simp/coordenacao/intervencoes/page.tsx` |
| `/diretoria` | `src/app/(protected)/simp/diretoria/page.tsx` |
| `/admin` (SIMP) | Decidir: unificar com admin do starter-kit ou `src/app/(protected)/simp/admin/page.tsx` |

Prefixo `/simp` é opcional; pode ser removido se as rotas do SIMP forem as principais do produto.

### O que levar do SIMP (checklist de origem)

- **Páginas:** `src/pages/ProfileSelection.tsx`, `src/pages/professor/*`, `src/pages/psychology/*`, `src/pages/coordination/*`, `src/pages/directory/*`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/NotFound.tsx`.
- **Componentes:** `Layout.tsx`, `RiskBadge`, `RiskFilterButtons`; componentes em `src/components/ui/` já existentes no starter-kit (shadcn/Radix) não precisam ser duplicados — conferir versões.
- **Contexto / estado:** Ideia do `AppContext` (perfil SIMP, dados em memória); no destino, perfil pode ser Clerk metadata ou tabela; dados vêm de Prisma.
- **Dados e tipos:** `src/data/mockData.ts` — usar como **referência para o schema Prisma** (Student, Turma, Assessment, PsychAssessment, Intervention, TimelineEvent, FamilyContact, etc.); implementar models e relações no Prisma.
- **Lógica de domínio:** Cálculo de risco (ex.: em `NewAssessment.tsx`), regras de exibição por perfil; extrair para `src/lib/simp/` ou equivalente no starter-kit.

### Dependências entre tarefas

1. Definir e aplicar schema Prisma (models SIMP) antes de implementar páginas que leem/escrevem dados.
2. Layout e navegação SIMP (header, voltar, Sair com Clerk) antes de migrar todas as telas.
3. Seleção de perfil e integração com Clerk (quem é o usuário, qual perfil SIMP) antes de restringir rotas por perfil.

---

## 4. Phases / Tasks

| # | Fase | Tarefas | Status |
|---|------|---------|--------|
| 1 | **Preparação no starter-kit** | Clonar/criar branch; garantir que starter-kit roda localmente (Clerk, DB, .env); criar pasta ou grupo de rotas para SIMP (ex. `src/app/(protected)/simp/` ou sem prefixo). | [ ] |
| 2 | **Schema Prisma (domínio SIMP)** | Definir models: Turma, Student (ou Aluno), Assessment, PsychAssessment, Intervention, TimelineEvent, FamilyContact, etc., com relações; rodar migração; opcional: seed com dados de exemplo a partir de `mockData.ts`. | [ ] |
| 3 | **Camada de dados e tipos** | Criar `src/lib/simp/` (ou equivalente): tipos TypeScript alinhados ao Prisma; funções de query (ex.: listar turmas, aluno por id, criar avaliação); regra de cálculo de risco em função reutilizável. | [ ] |
| 4 | **Layout e navegação** | Adaptar `Layout.tsx` do SIMP para Next: usar `useRouter`/`usePathname`; botão voltar; "Sair" chamando sign-out do Clerk; exibir perfil (Clerk ou perfil SIMP). Aplicar layout nas rotas protegidas do SIMP. | [ ] |
| 5 | **Seleção de perfil e auth** | Tela de escolha de perfil (Professor, Psicologia, etc.) após login; persistir perfil no Clerk (metadata) ou em tabela (User → perfil SIMP); middleware ou guard para rotas por perfil se necessário. | [ ] |
| 6 | **Rotas e páginas — Professor** | Implementar páginas: painel professor (turmas), lista de alunos por turma, ficha do aluno, nova avaliação pedagógica; consumir dados via Prisma (Server Components ou API + client); manter comportamento atual do SIMP (salvar avaliação atualiza risco e timeline). | [ ] |
| 7 | **Rotas e páginas — Psicologia** | Painel psicologia (alunos encaminhados, filtros), ficha do aluno (avaliações psicológicas, PEI, contato familiar). | [ ] |
| 8 | **Rotas e páginas — Coordenação** | Dashboard estratégico, alertas, intervenções, ficha do aluno (coordenação). | [ ] |
| 9 | **Rotas e páginas — Diretoria e Admin** | Dashboard diretoria; decisão sobre admin SIMP vs admin existente do starter-kit; implementar o definido. | [ ] |
| 10 | **Ajustes e validação** | Revisar todas as rotas; garantir que nenhuma funcionalidade crítica do starter-kit foi quebrada; testes manuais por perfil; documentar onde ficou o SIMP no repositório (README ou .context/docs). | [ ] |

---

## 5. Risks & Mitigation

| Risco | Mitigation |
|-------|------------|
| Conflito de rotas ou layout com o starter-kit (ex.: `/admin` já existe). | Usar prefixo `/simp` para as rotas do SIMP ou renomear rotas do SIMP (ex.: `/dashboard/professor`); documentar decisão. |
| Divergência de versões de componentes (shadcn/Radix) entre SIMP e starter-kit. | Comparar `package.json` e componentes em `src/components/ui/`; adaptar imports ou estilos ao que existir no starter-kit; evitar duplicar biblioteca inteira. |
| Modelo de dados do SIMP não mapear 1:1 para Prisma (ex.: enums, JSON). | Revisar tipos em `mockData.ts` e [project-overview](.context/docs/project-overview.md); definir enums e relações no schema; usar migrations incrementais. |
| Perfil SIMP (professor/psicologia/…) distinto do role do Clerk. | Decidir se perfil SIMP é metadata do Clerk ou tabela no banco (ex.: UserProfile); implementar uma única abordagem e usar em todo o fluxo. |

---

## 6. Validation / Acceptance

- **Cenário 1:** Usuário logado (Clerk) acessa seleção de perfil SIMP, escolhe Professor, vê painel de turmas, entra em uma turma, abre ficha de um aluno, registra nova avaliação; risco e timeline atualizam; dados persistem no banco.
- **Cenário 2:** Usuário escolhe Psicologia; vê lista de encaminhados com filtros; abre ficha do aluno e vê avaliações psicológicas e dados esperados.
- **Cenário 3:** Coordenação acessa dashboard, alertas e intervenções; Diretoria acessa visão institucional.
- **Edge case:** Acesso a rota de outro perfil (ex.: professor acessando `/coordenacao`) — redirecionar ou exibir mensagem conforme regra definida.

---

## 7. Reference Documentation

- [Project overview (objetivo, perfis, domínio do SIMP)](../.context/docs/project-overview.md) — referência de propósito e conceitos.
- [README do SIMP](../README.md) — contexto do projeto de origem.
- Repositório/código do **starter-kit-v2-1.3.1** — README, `.context/docs/`, `src/app/`, `prisma/schema.prisma`, middleware Clerk.
- [Metodologia de escopo](metodologia-escopo-edicao.md) — ao executar, alterar apenas o que este plano define.
- [Planning PDCA](planning-pdca.md) — para organizar fases Plan/Do/Check/Act durante a execução.

---

*Plano de migração para execução futura. Ao iniciar, revisar este documento (PREVC R), ajustar datas e responsáveis, e executar por fases com validação entre elas.*
