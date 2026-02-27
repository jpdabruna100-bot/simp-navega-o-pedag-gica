# Visão Geral do Projeto — SIMP

**SIMP (Sistema Integrado de Monitoramento Pedagógico)** é uma aplicação web que integra o acompanhamento pedagógico e psicopedagógico da escola em um único sistema. Professores registram avaliações por aluno e turma; psicologia acompanha encaminhamentos; coordenação e diretoria visualizam alertas, fluxos de acompanhamento e indicadores — tudo centrado no **aluno**, no **nível de risco** e nas **ações** (avaliações, tratativas educacionais, psicologia).

Este documento é a referência para **objetivo do projeto**, **perfis**, **fluxos** e **conceitos de domínio**. Use-o ao implementar novas features ou melhorias para manter o alinhamento com o propósito do SIMP.

---

## Para que o projeto serve

O SIMP serve para **integrar o monitoramento pedagógico e psicopedagógico** em contexto escolar (no código, foco em **Fundamental 1**). O sistema foi preparado para trabalhar com **quatro esferas**: professor, coordenação pedagógica, equipe multidisciplinar (psicologia) e diretoria. Diferentes atores acessam conforme seu perfil e realizam ações sobre alunos, turmas, avaliações e tratativas de acompanhamento. O **nível de risco** do aluno (baixo / médio / alto) é calculado a partir das avaliações pedagógicas e usado em todos os perfis para priorização e tomada de decisão.

---

## Personas / Perfis

| Perfil        | O que vê e faz |
|---------------|----------------|
| **Professor** | Acesso **apenas às turmas em que está cadastrado** como professor. **Avaliação mensal** do aluno: conceito geral; evolução em escrita, leitura, matemática; atenção e comportamento; dificuldade percebida (se sim, deve justificar, informar se recente/recorrente e se já usou estratégias em sala). Ao salvar, o sistema recalcula o risco; aluno com conceito **insuficiente** em qualquer área entra no **painel de alertas** da coordenação. Além disso, pode emitir Alertas Críticos (Dossiê #OC-1) para informar imediatamente situações de risco iminente ou proteção à criança ao radar prioritário da coordenação. |
| **Coordenação**| Papel de **maestro** do acompanhamento pedagógico. Dashboards com funil de triagem; **painel de alertas de urgência (Dossiês OC-1)** e alunos defasados. Pode **acionar a psicologia** e controlar o prazo através da métrica "Prazo Regimental de Escuta" (SLA 48h úteis). Também pode definir um **plano de contingência/ação externa** (conversa com a família, reforço na escola, plano de nivelamento). **Gestão de Acompanhamentos** é centralizada em um quadro Kanban focado no ciclo de vida da tratativa: **Aguardando Ação → Em Acompanhamento → Concluído**. |
| **Psicologia**| Lista de alunos encaminhados. Pode priorizar atendimentos baseados nos Alertas Críticos da Coordenação ou avaliações pendentes. Na avaliação: classificação (típico, em observação, em suspeita, neurodivergente), observação técnica (comportamento e aprendizagem), necessita acompanhamento (sim/não — se não, aluno sai da lista). Tipos: inicial, acompanhamento, reavaliação. Acesso ao relato do professor, upload (laudo, PEI), acompanhamento clínico externo e medicação. |
| **Diretoria**  | **Visão macro**: indicadores de aprendizagem; quantos alunos a psicologia atende; histórico de casos concluídos; **índice de risco** (alto/baixo); **top 5 piores turmas** para atenção; **QPIs por área**; **insights automáticos** para tomada de decisão. |
| **Admin**      | Painel de gestão/configuração do sistema (no protótipo atual, ainda genérico). |

---

## Fluxos principais (resumo)

- **Professor:** Seleção de perfil → Painel (turmas) → Turma → Lista de alunos → Ficha do aluno → Nova avaliação pedagógica (`/professor/aluno/:studentId/avaliacao`). Ao salvar a avaliação, o risco do aluno é atualizado. Disparo de Dossiê de Ocorrências Críticas, se grave.
- **Coordenação:** Dashboard Estratégico → Resolução imediata de Dossiês Críticos (OC-1) OU Triagem no Quadro Kanban de Gestão de Acompanhamentos (com filtros por Urgência ou Psicologia).
- **Psicologia:** Painel com alunos encaminhados (filtros por turma, SLA, risco) → Ficha do aluno (avaliações psicológicas, PEI, contato familiar).
- **Diretoria:** Dashboard institucional com indicadores agregados e extratos gerenciais ("Relatórios Conselho de Classe").
- **Admin:** Acesso ao painel de administração.

Rotas principais estão em `src/App.tsx` (React Router).

---

## Fluxo operacional (4 esferas)

1. **Professor** — Acessa o sistema, escolhe a turma e faz a avaliação mensal dos alunos ou reporta uma ocorrência gravíssima de forma iminente. Aluno com déficit **vai para a triagem** da coordenação, seja pelas métricas normais de "Alto Risco" ou instantaneamente por Acionamento Urgente.
2. **Coordenação** — Monitora o funil na ferramenta Kanban. Casos na 1ª coluna ("Aguardando Ação") demandam um Plano de Contingência/Tratativa, onde se escolhe ou Acionar a Família, Realizar Ações Internas (Reforço/Material) ou Acionar Psicologia. Ao iniciar a tratativa, o card é movido para a 2ª coluna ("Em Acompanhamento"). Tudo possui prazo de pendência exigido, com SLAs controlados (ex: Aguardando Parecer Psicológico tem tela própria de cobrança). Ao ser fechado e assinada a Ata de Resolução Final, move para a 3ª coluna ("Concluídos").
3. **Psicologia** — Recebe encaminhamento via Kanban da coordenação ou diretoria; prioriza os listados na coluna de "Aguardando". Decide intervenções e observa os relatos pedagógicos. Pode arquivar atestados, relatórios externos e estabelecer classificação de diagnóstico sem atrapalhar a parte pedagógica. 
4. **Diretoria** — Visão macro e extração de insights por dashboards (geração de relatórios governamentais em PDF, acompanhamento de eficácia das intervenções por turma e escola, engajamento e SLA das equipes da Coordenação e Psico).

---

## Regra de alerta e Alertas Críticos

- **Alerta Pedagógico Padrão (Fila Kanban):** Aluno com conceito insuficiente em qualquer área da avaliação mensal assume o nível de alto/médio risco e cai na fila "Aguardando Ação" no Kanban da Coordenação para planejamento de mitigação.
- **Alerta Crítico Iminente (Dossiê #OC-1):** Ocorrência enviada subitamente pelo professor sobre risco iminente, abuso, indisciplina com violência ou transtorno emergencial psicossocial. Trava o modelo natural do dashboard através de um modal "Alerta Vermelho" e exige "Assumir Caso Imediatamente" pela Coordenação antes de qualquer triagem secundária.

---

## Conceitos de domínio

| Conceito | Descrição |
|----------|-----------|
| **Aluno** | Identificação, turma, nível de risco (low/medium/high), avaliações pedagógicas, avaliações psicológicas, acompanhamentos no kanban, timeline (eventos), contato familiar. |
| **Turma** | Nome, turno (ex.: Manhã, Tarde), professor responsável. |
| **Avaliação pedagógica** | **Mensal**, por aluno. Conceitada em "adequada / em desenvolvimento / defasada". Gera atualização automática de risco no sistema. |
| **Avaliação psicológica** | Típico, em observação, em suspeita ou neurodivergente. Upload de laudo, PEI, medicação acompanhamento e SLA do retorno dessa avaliação à escola (48h Úteis recomendáveis). |
| **Acompanhamento Pedagógico (Planos de Ação)** | Substitui o antigo conceito de "Intervenções". Gerido via Kanban. Três estágios principais: **Aguardando Ação → Em Acompanhamento → Concluído**. Toda conclusão exige uma "Ata de Resolução Final". |
| **Risco (riskLevel)** | Derivado das avaliações. Alimenta diretamente e visivelmente os cards de prioridade urgentes no Dashboard. |
| **Timeline** | Histórico/prontuário digital universal do aluno que acopla ações de contato, pedagógicas, psicológicas e relatórios críticos em ordem temporal. |
| **Aguardando Psicologia** | Label/Filtro aplicado nos fluxos e painéis do sistema aos alunos que tiveram "Acionar Psicologia" como Plano de Contingência ativo em andamento e necessitam seguir SLA de resposta à escola. |

Tipos e estruturas de dados estão em `src/data/mockData.ts` (interfaces `Student`, `Assessment`, `Turma`, etc.).

---

## Estado atual do produto

- **Protótipo navegável** com **dados simulados**.
- **Dados em memória:** estado global em React (`AppContext`), alimentado em `src/data/mockData.ts`.
- **Supabase:** cliente e tipos em `src/integrations/supabase/`, como infraestrutura preparada (não em uso para o fluxo de persistência no momento das validações UX).
- Funcionalidades modernas B2B como Dashboards analíticos, Kanban de Triagem de Alunos e Redirecionamentos via Query/URL (filtros de SLA e urgência) foram criados estaticamente local.

---

## Stack e estrutura (resumo)

- **Stack:** Vite, React 18, TypeScript, shadcn/ui, Tailwind, React Router, TanStack Query.
- **Pontos de entrada:** `src/App.tsx` (rotas), `src/context/AppContext.tsx` (estado global), `src/data/mockData.ts` (dados da UX).
- **Estrutura:** `src/pages/`, `src/components/`, `src/context/`.

---

## Referências técnicas

- [Arquitetura](architecture.md) — Camadas e padrões do sistema.
- [Fluxo de Desenvolvimento](development-workflow.md) — Setup local e convenções.
- [Glossário](glossary.md) — Termos e conceitos do repositório.
