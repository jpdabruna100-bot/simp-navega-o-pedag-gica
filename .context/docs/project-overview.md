# Visão Geral do Projeto — SIMP

**SIMP (Sistema Integrado de Monitoramento Pedagógico)** é uma aplicação web que integra o acompanhamento pedagógico e psicopedagógico da escola em um único sistema. Professores registram avaliações por aluno e turma; psicologia acompanha encaminhamentos; coordenação e diretoria visualizam alertas, intervenções e indicadores — tudo centrado no **aluno**, no **nível de risco** e nas **ações** (avaliações, intervenções, psicologia).

Este documento é a referência para **objetivo do projeto**, **perfis**, **fluxos** e **conceitos de domínio**. Use-o ao implementar novas features ou melhorias para manter o alinhamento com o propósito do SIMP.

---

## Para que o projeto serve

O SIMP serve para **integrar o monitoramento pedagógico e psicopedagógico** em contexto escolar (no código, foco em **Fundamental 1**). Diferentes atores (professor, psicologia, coordenação, diretoria, admin) acessam o sistema conforme seu perfil e realizam ações sobre alunos, turmas, avaliações e intervenções. O **nível de risco** do aluno (baixo / médio / alto) é calculado a partir das avaliações pedagógicas e usado em todos os perfis para priorização e tomada de decisão.

---

## Personas / Perfis

| Perfil        | O que vê e faz |
|---------------|----------------|
| **Professor** | Turmas próprias; lista de alunos por turma; ficha do aluno (avaliações, timeline, documentos); **registro de nova avaliação pedagógica** (conceitos por área, observação, perguntas orientadoras). O sistema recalcula o risco do aluno a partir das avaliações. |
| **Psicologia**| Alunos encaminhados para psicologia; filtros por turma, risco e status (pendente, em acompanhamento, avaliado); ficha do aluno com avaliações psicológicas, PEI, contato familiar. Acompanha encaminhamentos e evolução. |
| **Coordenação**| Dashboard estratégico (totais por prioridade, intervenções ativas, encaminhamentos pendentes); gráficos por área (leitura, escrita, matemática, atenção); painel de alertas; gestão de intervenções (planejadas, em andamento, concluídas); ficha do aluno pela ótica da coordenação. |
| **Diretoria**  | Visão institucional: indicadores gerais da escola (com base nos mesmos dados de alunos, turmas, riscos e intervenções). |
| **Admin**      | Painel de gestão/configuração do sistema (no protótipo atual, ainda genérico). |

---

## Fluxos principais (resumo)

- **Professor:** Seleção de perfil → Painel (turmas) → Turma → Lista de alunos → Ficha do aluno → Nova avaliação pedagógica (`/professor/aluno/:studentId/avaliacao`). Ao salvar a avaliação, o risco do aluno é atualizado e a timeline ganha um novo evento.
- **Psicologia:** Painel com alunos encaminhados (filtros por turma, risco, status) → Ficha do aluno (avaliações psicológicas, PEI, contato familiar).
- **Coordenação:** Dashboard → Alertas e/ou Intervenções; acesso à ficha do aluno quando necessário.
- **Diretoria:** Dashboard institucional com indicadores agregados.
- **Admin:** Acesso ao painel de administração.

Rotas principais estão em `src/App.tsx` (React Router).

---

## Conceitos de domínio

| Conceito | Descrição |
|----------|-----------|
| **Aluno** | Identificação, turma, nível de risco (low/medium/high), avaliações pedagógicas, avaliações psicológicas, intervenções, timeline (eventos), contato familiar (tentativas, retorno), documentos. |
| **Turma** | Nome, turno (ex.: Manhã, Tarde), professor responsável. |
| **Avaliação pedagógica** | Conceito geral; leitura, escrita, matemática, atenção, comportamento (adequada / em desenvolvimento / defasada); dificuldade percebida (sim/não); observação do professor; perguntas orientadoras (opcional). Gera atualização de risco e evento na timeline. |
| **Avaliação psicológica** | Data, tipo (inicial, reavaliação, acompanhamento), classificação, necessita acompanhamento, observação, PEI, responsável. |
| **Intervenção** | Tipo, objetivo, responsável, status (Planejada / Em andamento / Concluída), resultado, data. |
| **Risco (riskLevel)** | Derivado das avaliações pedagógicas (ex.: conceito insuficiente ou várias áreas “Defasada” → alto risco). Usado em todos os perfis para priorização. |
| **Timeline** | Lista de eventos do aluno: avaliação pedagógica, avaliação psicológica, intervenção, encaminhamento, contato familiar. |
| **Encaminhamento para psicologia** | Aluno com `psychReferral`; psicologia acompanha status (pendente, em acompanhamento, avaliado). |
| **Contato familiar** | Tentativas de contato, retorno, observação (estado em `FamilyContact`). |

Tipos e estruturas de dados estão em `src/data/mockData.ts` (interfaces `Student`, `Assessment`, `Turma`, etc.).

---

## Estado atual do produto

- **Protótipo navegável** (originado no Lovable), com **dados simulados**.
- **Dados em memória:** estado global em React (`AppContext`), alimentado por `initialStudents` e demais mocks em `src/data/mockData.ts`. Não há persistência em backend para esses fluxos hoje.
- **Supabase:** cliente e tipos existem em `src/integrations/supabase/`, mas ainda não são usados para alunos, turmas, avaliações ou intervenções; a aplicação roda inteiramente com estado local.
- Novas features e melhorias devem considerar essa base (mock + contexto) até que a persistência real seja implementada.

---

## Stack e estrutura (resumo)

- **Stack:** Vite, React 18, TypeScript, shadcn/ui, Tailwind, React Router, TanStack Query. Supabase preparado para uso futuro.
- **Pontos de entrada:** `src/App.tsx` (rotas), `src/context/AppContext.tsx` (estado global), `src/data/mockData.ts` (dados iniciais e tipos).
- **Estrutura:** `src/pages/` (páginas por perfil), `src/components/` (Layout, UI shadcn), `src/context/`, `src/integrations/supabase/`.

---

## Referências técnicas

- [Arquitetura](architecture.md) — Camadas e padrões do sistema.
- [Fluxo de Desenvolvimento](development-workflow.md) — Setup local e convenções.
- [Glossário](glossary.md) — Termos e conceitos do repositório.
- Código: `src/App.tsx` (rotas), `src/context/AppContext.tsx`, `src/data/mockData.ts`.
