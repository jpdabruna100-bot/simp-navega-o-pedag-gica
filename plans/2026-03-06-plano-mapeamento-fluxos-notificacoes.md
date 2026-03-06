# Plano: Mapeamento de Fluxos e Notificações — Professor ↔ Coordenador ↔ Equipe Multidisciplinar

**Data:** 2026-03-06  
**Escopo:** Mapear processos de sinalização e notificação entre Professor, Coordenação e Equipe Multidisciplinar (Psicologia/Psicopedagogia), com foco em PEI e conclusão de tarefas.  
**Status:** Rascunho

---

## 1. Visão Geral

Este plano documenta os fluxos atuais e propõe melhorias para que:

1. **Professor** receba sinalização quando a equipe multidisciplinar recomendar PEI (etapa "Aguardando Ação").
2. **Equipe multidisciplinar** receba notificação quando o professor registrar o PEI elaborado.
3. **Coordenador** seja sinalizado quando a equipe multidisciplinar concluir uma ação/tarefa na ficha do aluno.

---

## 2. Ciclo Principal: Professor → Coordenador → Equipe Multidisciplinar → Professor

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────────────┐     ┌─────────────┐
│  Professor  │ ──► │ Coordenador  │ ──► │ Equipe Multidisciplinar │ ──► │  Professor  │
│             │     │              │     │ (Psicologia/Psicopedag.) │     │             │
└─────────────┘     └──────────────┘     └─────────────────────────┘     └─────────────┘
       │                     │                         │                          │
       │ Avaliação           │ Triagem /               │ Avaliação psi,           │ Elabora PEI,
       │ pedagógica,         │ Plano de contingência,   │ recomenda PEI,           │ registra na
       │ Alerta crítico      │ Aciona Psicologia       │ conclui tarefas           │ ficha do aluno
       └─────────────────────┴─────────────────────────┴──────────────────────────┘
```

### 2.1 Etapas do Ciclo

| Etapa | Ator | Ação | Sinalização para |
|-------|------|------|------------------|
| 1 | Professor | Avaliação pedagógica com defasagem; ou Alerta Crítico | Coordenador (Kanban, Dashboard) |
| 2 | Coordenador | Triagem; inicia Plano de Contingência; aciona Psicologia/Equipe Multidisciplinar | Equipe Multidisciplinar (Fila de Triagem) |
| 3 | Equipe Multidisciplinar | Avaliação psicológica; recomenda PEI; conclui tarefas | Professor (PEI pendente); Coordenador (conclusão) |
| 4 | Professor | Elabora e registra PEI | Equipe Multidisciplinar (PEI elaborado) |

---

## 3. Fluxo PEI: Recomendação → Elaboração → Notificação

### 3.1 Estado Atual (Mapeado)

| Passo | Onde | O que existe | Gap |
|-------|------|--------------|-----|
| 1. Equipe recomenda PEI | Psicologia: `PsychStudentDetail` | Psicólogo salva avaliação com `recomenda_elaboracao_pei`, `areas_atencao_pei`, `sugestoes_pei`, `prazo_pei` → gera `pei_recomendado` no aluno | — |
| 2. Professor vê sinalização | Professor: `StudentList`, `StudentDetail` | Coluna "Aguardando Ação" quando `peiRecomendado` existe; card "PEI pendente"; botão "Elaborar e registrar PEI" | ✅ Funciona |
| 3. Professor registra PEI | Professor: `PEIWizard` → `handleSavePei` | `updateStudent(pei, pei_recomendado: null)`; `updatePsychAssessment(possui_pei: "Sim")`; `insertTimelineEvent("pei_atualizado")` | — |
| 4. Equipe recebe notificação | Psicologia: `PsychologyDashboard` | **Não existe** — não há sinalização de "PEI elaborado pelo professor" | ❌ **Gap** |

### 3.2 Proposta: Notificar Equipe Multidisciplinar quando PEI for registrado

**Requisito:** Quando o professor salvar o PEI, a equipe multidisciplinar deve ser sinalizada.

**Opções de implementação:**

| Opção | Descrição | Complexidade |
|-------|-----------|--------------|
| **A** | **Badge no card** (recomendado): no Painel Multidisciplinar, manter o aluno na coluna em que já está (ex.: "Em Acompanhamento") e exibir um **badge dentro do card** — ex.: "PEI elaborado" ou "Aguardando revisão" — para alunos com `student.pei` recém-registrado. O aluno **não sai** da coluna; a equipe só é sinalizada no próprio card. | Média |
| **B** | Evento na timeline + visibilidade na ficha: "PEI registrado pelo professor em DD/MM" — coordenador e equipe veem ao abrir o prontuário. | Baixa (parcialmente existe) |
| **C** | Tabela `pei_notifications` ou flag `pei_elaborado_pendente_revisao` — controle explícito de "equipe ainda não viu". | Alta |

**Recomendação:** Opção **A (badge no card)**. Não faz sentido criar uma nova coluna e fazer o aluno "sair" de "Em Acompanhamento": ele continua em acompanhamento; o PEI elaborado é um evento dentro desse fluxo. A equipe deve ver o mesmo card, na mesma coluna, com um badge que sinalize "PEI elaborado — aguardando revisão". O evento `pei_atualizado` na timeline (opção B) já existe e complementa.

### 3.3 Jornada no Painel da Equipe Multidisciplinar (Envia → Aguarda PEI → PEI elaborado)

Do ponto de vista da **equipe multidisciplinar**, o aluno percorre três momentos após a recomendação de PEI. O aluno **permanece na mesma coluna** ("Em Acompanhamento"); o que muda é o **badge/indicador no card**, para a equipe saber em que etapa está:

| Momento | Ação da equipe / Sistema | Coluna no Painel | Badge / Indicador no card |
|---------|--------------------------|------------------|----------------------------|
| **1. Envia** | Equipe recomenda PEI (salva avaliação com `recomenda_elaboracao_pei`); sistema grava `pei_recomendado` no aluno. | Em Acompanhamento | "Aguardando PEI do professor" (ou "PEI encaminhado") — sinaliza que a bola está com o professor. |
| **2. Aguarda PEI** | Professor ainda não registrou o PEI. `student.peiRecomendado` existe; `student.pei` vazio. | Em Acompanhamento | Mesmo badge "Aguardando PEI do professor"; opcional: exibir prazo (ex.: "Prazo: DD/MM"). |
| **3. PEI elaborado** | Professor registrou o PEI (`student.pei` preenchido; `pei_recomendado` zerado). | Em Acompanhamento | "PEI elaborado" ou "Aguardando revisão" — equipe é sinalizada para revisar o PEI na ficha. |

**Resumo:** Durante toda a jornada o card fica na coluna **Em Acompanhamento**. A diferença entre "Aguarda PEI" e "PEI elaborado" é apenas o **texto do badge** no card (e, na etapa 3, o evento na timeline). Não é necessário mover o aluno de coluna; a equipe acompanha o status pelo badge.

---

## 4. Fluxo: Equipe Multidisciplinar conclui tarefa → Coordenador sinalizado

### 4.1 Estado Atual

| Ação da Equipe | Onde persiste | Coordenador vê? |
|----------------|---------------|-----------------|
| Avaliação psicológica salva | `psych_assessments` | Indiretamente (aluno sai da fila "Aguardando Psicologia" no Kanban) |
| Intervenção concluída | `interventions.status = "Concluído"` | Sim — card move para "Concluídos" |
| Atualização na timeline | `timeline_events` | Sim — se o coordenador abrir a ficha do aluno |
| Aceite de caso ("Assumir") | `interventions.accepted_by` | Sim — card muda de coluna |

**Gap:** O coordenador não recebe uma **sinalização ativa** (ex.: badge, contador, destaque) quando a equipe multidisciplinar realiza uma ação na ficha do aluno. Hoje ele precisa:
- Abrir a ficha do aluno para ver a timeline, ou
- Perceber a mudança no Kanban (card movido).

### 4.2 Proposta: Sinalizar Coordenador na ficha/histórico

**Requisito:** Quando a equipe multidisciplinar realiza uma ação (avaliação, conclusão de intervenção, registro de andamento), o coordenador deve ser sinalizado.

**Opções:**

| Opção | Descrição | Onde |
|-------|-----------|------|
| **A** | Timeline já registra — garantir que `insertTimelineEvent` seja chamado em todas as ações da equipe (avaliação psi, conclusão, etc.) | `PsychStudentDetail`, mutations |
| **B** | Badge "Novo" ou indicador na ficha do aluno (CoordStudentDetail) quando há eventos recentes da equipe não "vistos" pelo coordenador | `CoordStudentDetail` |
| **C** | Card no Dashboard da Coordenação: "Atualizações da Equipe (últimas 24h)" — lista de alunos com atividade recente da psicologia | `CoordinationDashboard` |

**Recomendação:** Opção A (base) + B ou C. A timeline é a fonte da verdade; o coordenador precisa de um **ponto de entrada** para ver o que mudou — seja na ficha (badge "Novo") ou no dashboard (resumo de atividades).

---

## 5. Matriz de Sinalizações (As-Is vs To-Be)

| Origem | Destino | Evento | As-Is | To-Be |
|--------|---------|--------|-------|-------|
| Equipe Multidisciplinar | Professor | PEI recomendado | ✅ `peiRecomendado` → "Aguardando Ação" | Manter |
| Professor | Equipe Multidisciplinar | PEI elaborado/registrado | ❌ Nenhuma | Nova sinalização no Painel Multidisciplinar |
| Professor | Coordenador | Avaliação defasagem / Alerta crítico | ✅ Kanban / Dashboard | Manter |
| Coordenador | Equipe Multidisciplinar | Acionar Psicologia | ✅ Intervenção → Fila de Triagem | Manter |
| Equipe Multidisciplinar | Coordenador | Avaliação concluída / Tarefa concluída | Parcial (Kanban move) | Sinalização explícita na ficha ou dashboard |

---

## 6. Especificação Técnica (Resumo)

### 6.1 Notificação "PEI elaborado" para Equipe Multidisciplinar

**Arquivos impactados:**
- `src/pages/psychology/PsychologyDashboard.tsx` — exibir badge no card quando `student.pei` preenchido (e opcionalmente recém-registrado)
- `src/data/mockData.ts` ou Supabase — eventual flag `pei_elaborado_pendente_revisao` (opcional)
- `src/lib/supabase-queries.ts` — se usar flag, incluir no fetch

**Lógica proposta:**
- Alunos com `student.pei` preenchido (e, opcionalmente, evento `pei_atualizado` recente ou sem "visto" da equipe) → exibir **badge no card** ("PEI elaborado" / "Aguardando revisão") no Painel Multidisciplinar, **sem mudar de coluna**. Quem já está em "Em Acompanhamento" permanece lá; o badge apenas sinaliza que o professor registrou o PEI e a equipe pode revisar.

### 6.2 Sinalização para Coordenador (ações da equipe)

**Arquivos impactados:**
- `src/pages/coordination/CoordStudentDetail.tsx` — badge ou seção "Atividade recente da equipe"
- `src/pages/psychology/PsychStudentDetail.tsx` — garantir `insertTimelineEvent` em todas as ações relevantes
- `src/lib/supabase-mutations.ts` — já possui `insertTimelineEvent`

**Lógica proposta:**
- Timeline já é a fonte. Garantir que avaliação psi e conclusão de intervenção gerem eventos.
- Em `CoordStudentDetail`: exibir eventos da timeline com destaque para os de autoria "Psicologia" / "Equipe" nos últimos N dias.
- Opcional: Dashboard da Coordenação com card "Atualizações da Equipe" listando alunos com eventos recentes.

---

## 7. Fases de Implementação Sugeridas

| Fase | Tarefa | Prioridade |
|------|--------|------------|
| 1 | Garantir `insertTimelineEvent` em todas as ações da equipe (avaliação psi, conclusão) | Alta |
| 2 | Badge "PEI elaborado" (ou "Aguardando revisão") no card do aluno no Painel Multidisciplinar — aluno permanece na coluna atual | Alta |
| 3 | Badge ou destaque em CoordStudentDetail para "Atividade recente da equipe" | Média |
| 4 | Card "Atualizações da Equipe" no Dashboard da Coordenação (opcional) | Baixa |

---

## 8. Diagrama de Sequência (PEI)

```
Equipe Multidisciplinar     Professor              Sistema
         |                       |                     |
         |-- Avaliação psi ----->|                     |
         |   recomenda PEI       |                     |
         |                       |<-- peiRecomendado --|
         |                       |   (Aguardando Ação) |
         |                       |                     |
         |                       |-- Elabora PEI ------>|
         |                       |   (Wizard)          |
         |                       |-- Salva PEI -------->|
         |                       |                     |
         |<-- ??? NOTIFICAÇÃO ???|   (pei_atualizado   |
         |   "PEI elaborado"     |    na timeline)      |
         |                       |                     |
```

---

## 9. Referências

- [.context/docs/project-overview.md](../.context/docs/project-overview.md) — Fluxos e perfis
- [plans/2026-02-27-proposta-pei-equipe-multidisciplinar.md](2026-02-27-proposta-pei-equipe-multidisciplinar.md) — Proposta PEI colaborativo
- [plans/2026-02-27-plano-impl-elaboracao-pei-guiada.md](2026-02-27-plano-impl-elaboracao-pei-guiada.md) — Implementação PEI guiado
- `src/pages/psychology/PsychologyDashboard.tsx` — Painel Multidisciplinar (Kanban)
- `src/pages/professor/StudentList.tsx` — Coluna "Aguardando Ação" do professor
