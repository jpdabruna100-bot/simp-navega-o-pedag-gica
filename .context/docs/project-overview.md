# Visão Geral do Projeto — SIMP

**SIMP (Sistema Integrado de Monitoramento Pedagógico)** é uma aplicação web que integra o acompanhamento pedagógico e psicopedagógico da escola em um único sistema. Professores registram avaliações por aluno e turma; psicologia acompanha encaminhamentos; coordenação e diretoria visualizam alertas, intervenções e indicadores — tudo centrado no **aluno**, no **nível de risco** e nas **ações** (avaliações, intervenções, psicologia).

Este documento é a referência para **objetivo do projeto**, **perfis**, **fluxos** e **conceitos de domínio**. Use-o ao implementar novas features ou melhorias para manter o alinhamento com o propósito do SIMP.

---

## Para que o projeto serve

O SIMP serve para **integrar o monitoramento pedagógico e psicopedagógico** em contexto escolar (no código, foco em **Fundamental 1**). O sistema foi preparado para trabalhar com **quatro esferas**: professor, coordenação pedagógica, equipe multidisciplinar (psicologia) e diretoria. Diferentes atores acessam conforme seu perfil e realizam ações sobre alunos, turmas, avaliações e intervenções. O **nível de risco** do aluno (baixo / médio / alto) é calculado a partir das avaliações pedagógicas e usado em todos os perfis para priorização e tomada de decisão.

---

## Personas / Perfis

| Perfil        | O que vê e faz |
|---------------|----------------|
| **Professor** | Acesso **apenas às turmas em que está cadastrado** como professor. **Avaliação mensal** do aluno: conceito geral; evolução em escrita, leitura, matemática; atenção e comportamento; dificuldade percebida (se sim, deve justificar, informar se recente/recorrente e se já usou estratégias em sala). Ficha do aluno (avaliações, timeline). Ao salvar, o sistema recalcula o risco; aluno com conceito **insuficiente** em qualquer área entra no **painel de alertas** da coordenação. |
| **Coordenação**| Papel de **maestro** do acompanhamento pedagógico. Dashboards (andamento de alertas e intervenções); **painel de alertas** com alunos insuficientes/defasados; leitura da avaliação do professor. Pode **encaminhar para psicologia** (botão → aluno aparece na tela da equipe multidisciplinar) ou definir **intervenção pedagógica** (conversa com família, reforço escolar, estratégias diferenciadas, plano de nivelamento). **Gestão de intervenções**: status Planejada → Em andamento → Concluída, sempre registrando resultados; compõe o **dashboard de eficácia das intervenções**. |
| **Psicologia**| Lista de alunos encaminhados: **avaliação pendente** vs **em acompanhamento** (prioridade: pendentes sem avaliação inicial). Três ações possíveis: estagiária observa em sala; psicóloga observa em sala; ou aluno vai à sala da psicologia para avaliação. Na avaliação: classificação (típico, em observação, em suspeita, neurodivergente), observação técnica (comportamento e aprendizagem), necessita acompanhamento (sim/não — se não, aluno sai da lista). Tipos: inicial, acompanhamento, reavaliação. Acesso à avaliação pedagógica (relato do professor), upload (laudo, PEI), acompanhamento clínico externo e medicação. |
| **Diretoria**  | **Visão macro**: indicadores de aprendizagem; quantos alunos a psicologia atende; quantas intervenções concluídas; **índice de risco** (alto/baixo); **top 5 piores turmas** para atenção; **QPIs por área**; **insights automáticos** para tomada de decisão. |
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

## Fluxo operacional (4 esferas)

1. **Professor** — Acessa o sistema, escolhe a turma (só as que está cadastrado), vê a relação de alunos. Clica em cada aluno e faz a **avaliação mensal** (conceito geral, escrita, leitura, matemática, atenção, comportamento; dificuldade percebida; se houver dificuldade, justifica, informa se recente/recorrente e estratégias já usadas em sala). Aluno com **insuficiente** em qualquer área **vai para o painel de alertas** da coordenação.

2. **Coordenação** — Vê dashboards e **painel de alertas**. Lê a avaliação do professor; se o aluno precisa de acompanhamento da equipe multidisciplinar, clica em **Psicologia** e o aluno passa a aparecer na tela da psicologia. Se a coordenação pode resolver com intervenção pedagógica (ex.: defasagem na escrita), define a intervenção (conversa com família, reforço, estratégias diferenciadas, plano de nivelamento). Acompanha tudo na **gestão de intervenções** (planejada → em andamento → concluída, com resultados), que alimenta o **dashboard de eficácia**.

3. **Psicologia** — Recebe os encaminhados; prioriza os **pendentes de avaliação inicial**. Decide: observação em sala (estagiária ou psicóloga) ou avaliação na sala da psicologia. Registra classificação (típico, em observação, em suspeita, neurodivergente), observação técnica e se necessita acompanhamento; se não, o aluno sai da lista. Acompanha evolução pela ficha; pode registrar laudo, PEI, acompanhamento clínico e medicação.

4. **Diretoria** — Visão macro: indicadores de aprendizagem, volume de atendimento da psicologia, intervenções concluídas, índice de risco, top 5 turmas que precisam de atenção, QPIs por área e insights para decisão.

---

## Regra de alerta

- **Aluno com conceito insuficiente em qualquer área** (leitura, escrita, matemática, atenção, comportamento ou conceito geral) **entra automaticamente no painel de alertas** da coordenação pedagógica. A coordenação é quem direciona o próximo passo (intervenção pedagógica ou encaminhamento para psicologia).

---

## Conceitos de domínio

| Conceito | Descrição |
|----------|-----------|
| **Aluno** | Identificação, turma, nível de risco (low/medium/high), avaliações pedagógicas, avaliações psicológicas, intervenções, timeline (eventos), contato familiar (tentativas, retorno), documentos. |
| **Turma** | Nome, turno (ex.: Manhã, Tarde), professor responsável. |
| **Avaliação pedagógica** | **Mensal**, por aluno. Conceito geral; leitura, escrita, matemática, atenção, comportamento (adequada / em desenvolvimento / defasada); dificuldade percebida (sim/não); observação do professor; perguntas orientadoras (opcional: principal dificuldade, recente/recorrente, estratégias já usadas). Gera atualização de risco e evento na timeline; insuficiente em qualquer área → painel de alertas. |
| **Avaliação psicológica** | Data, tipo (inicial, reavaliação, acompanhamento). Classificação: aluno típico, em observação, em suspeita, neurodivergente. Observação técnica (comportamento e aprendizagem); necessita acompanhamento (sim/não). PEI, laudo, acompanhamento clínico externo, medicação. Se não necessita acompanhamento, aluno sai da lista de encaminhados. |
| **Intervenção** | Definida pela coordenação. Tipos: conversa com família, reforço escolar, estratégias diferenciadas em sala, plano de nivelamento. Status: Planejada → Em andamento → Concluída; resultado sempre registrado. Alimenta o dashboard de eficácia das intervenções. |
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
