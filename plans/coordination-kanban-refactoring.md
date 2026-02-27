---
title: Coordination Kanban Refactoring (PREVC Plan)
status: Draft
---

# PREVC Plan: Coordination Kanban Refactoring

## P - Plan

### 1. Objetivo
Transformar a tela genérica de "Gestão de Intervenções" (`InterventionManagement.tsx`) em um **Painel Analítico Kanban (Acompanhamento Pedagógico)**. O foco é mudar a postura do Coordenador de "digitador" para "Gerente de Aprendizagem", permitindo o rastreamento visual do ciclo de vida das ações pedagógicas: do Alerta (Aguardando Ação), passando pela Tratativa (Acompanhamento/Pendência) até a Resolução Final (Concluído).

### 2. Before vs After
| Aspecto | Antes | Depois |
|--------|--------|--------|
| **Nomenclatura** | Gestão de Intervenções / Cadastrar Intervenção | Planos de Acompanhamento / Acompanhamento Pedagógico |
| **Visual da Tela** | Tabela/Lista estática de dados cadastrais | Quadro Kanban com colunas de status (Aguardando Ação, Em Acompanhamento, Concluído) |
| **Fluxo de Ação** | Registra uma "Intervenção" e o dado fica solto no sistema | Registra um Plano de Ação, que gera uma pendência (ex: aguarda ata de reunião) atrelada a prazos |
| **Encerramento de Ação** | Muda status num dropdown sem justificativa | Exige o preenchimento de uma "Ata de Resolução Final" para fechar o ciclo e ir para a coluna final |

### 3. Consultation (referências usadas)
- [x] Princípios de UI/UX do projeto: Formulários limpos, uso do shadcn/ui.
- [x] Dados atuais (`mockData.ts`): Estrutura de Intervention, Student, Assessment.
- [x] Prints do mock-up do cliente (Fluxo "Plano de Contingência -> Ação -> Ata").

### 4. Seções / arquivos a alterar (escopo estrito)
| Arquivo ou área | O que alterar |
|-----------------|----------------|
| `src/data/mockData.ts` | 1. Atualizar a interface `Intervention` para incluir campos de rastreabilidade (ex: `actionType`, `pendingUntil`, `resolutionAta`).<br>2. Adicionar status do Kanban ao aluno/intervenção (Aguardando, Em Acompanhamento, Concluído). |
| `src/pages/coordination/InterventionManagement.tsx` | 1. Renomear internamente para refletir o novo conceito (Acompanhamento Pedagógico).<br>2. Refatorar o layout inteiro de Tabela/Lista para um **Quadro Kanban (3 colunas)**.<br>3. Implementar drag-and-drop ou botões de movimentação.<br>4. Criar Modal "Plano de Contingência" contemplando abas para Acompanhamento Interno, Acionar Família (Canais: WhatsApp, Ligação, Agenda) e **Acionar Psicologia (Encaminhamento Crítico)**.<br>5. Criar Modal detalhado de Ata Final. |
| `src/components/Navigation.tsx` / Rotas | Atualizar labels do menu lateral (de "Intervenções" para "Acompanhamentos"). |
| `src/pages/coordination/CoordStudentDetail.tsx` | Atualizar botão de atalho para enviar para a tela de Kanban/Acompanhamento. |
| `src/pages/coordination/AlertsPanel.tsx` | Ajustes de labels para alinhar com a nova nomenclatura. |

### 5. Risks
| Risk 1 | Complexidade do Kanban UI | **Mitigation:** Usar grids CSS simples do Tailwind inicialmente com botões de avanço de stage, evitando bibliotecas drag-and-drop pesadas se a performance ou compatibilidade for um problema no setup atual. |
| Risk 2 | Quebra de dados mockados antigos | **Mitigation:** Ajustar o gerador de mock data para criar intervencões com os novos campos (data, tipo, status de kanban), garantindo que listas não fiquem vazias. |

### 6. Execution Checklist (fase E)
- [ ] 1. Alterar o `mockData.ts` (Interfaces Intervention e Student) com suporte aos novos fluxos.
- [ ] 2. Renomear links e labels no menu de navegação e botões em outras telas (`CoordStudentDetail`, `AlertsPanel`).
- [ ] 3. Refatorar a base do `InterventionManagement.tsx` trocando a Tabela por um grid de 3 colunas (Kanban).
- [ ] 4. Construir o Componente/Card funcional dentro das colunas do Kanban (visual minimalista focando no "Aluno" e "Selo de Prazo/Status").
- [ ] 5. Construir o Modal/Plano de Contingência (Tratativa) contemplando abas para: Ações Internas, Acionar Família (Canais: WhatsApp, Ligação, Agenda) e **Acionar Psicologia (Encaminhamento Crítico)**.
- [ ] 6. Construir Modal de Fechamento (obrigando Ata Final) para o aluno ir para "Concluído".

### 7. Validation Checklist (fase V)
- [ ] O menu mostra "Acompanhamentos" em vez de "Intervenções".
- [ ] O novo Painel Kanban carrega sem quebrar e os alunos são distribuídos corretamente nas colunas com base em seus status iniciais.
- [ ] Posso clicar em um aluno na coluna "Aguardando" e abrir a janela de "Ação" com as ferramentas corretas (Acionar Família, etc).
- [ ] Não é possível enviar para "Concluído" sem preencher um texto de Ata Final.
- [ ] A cor do selo do Aluno muda conforme o seu status e estágio no funil.

### 8. Approval
- **Revisado em:** _______________
- **Aprovado por:** USER
- **Data de execução:** _______________

