# Plano de Refatoração: Modal de Planos de Contingência (Tratativas Estruturadas via KPIs)

**Data:** 27 de Fevereiro de 2026
**Autor:** AI Solutions / Architect Specialist
**Status:** Planejamento (P do ciclo PREVC)
**Domínio:** Coordenação Pedagógica / Gestão de Acompanhamentos

---

## 1. Diagnóstico e Objetivo

**O Problema Atual:**
O modal "Iniciar Plano Estratégico" (Plano de Contingência) na tela de Coordenação Pedagógica baseia-se pesadamente em campos abertos de texto livre (`Estratégia / Observação`). Isso impossibilita a criação de KPIs, relatórios automatizados de eficácia e impede a plataforma de usar os ricos dados da "Avaliação do Professor" (como defasagens específicas e ações em sala) para sugerir direcionamentos estruturados.

**O Objetivo (Opção B - Árvore de Decisão Baseada em Regras Locais):**
Transformar o campo aberto em uma interface de **Seleção Baseada em Categorias e Tags (KPIs)**. O sistema deve ler o Mock de avaliação do aluno (`student.assessments`) e pré-sugerir ações estruturadas, transformando uma UX passiva em uma UX **consultiva**, base do futuro motor com uso real de IA Preditiva.

---

## 2. Before vs After (Análise de Escopo)

### Como é hoje (Before)
- **Seleção:** Radio buttons genéricos (Internas, Acionar Família, Psicólogo).
- **Conteúdo:** Campo `textarea` livre onde o coordenador digita qualquer coisa sem taxonomia.
- **Conexão de Dados:** Cega. O modal não lê o que o professor preencheu na ficha antes para mudar de estado.

### Como será (After)
- **UI de Sugestão e Contexto:** Um banner nativo "Inteligência SIMP" no topo do modal que lê os dados de risco do aluno e diz: *"Visto que a dificuldade principal está na Leitura/Escrita e o professor já tentou [Ação Externa X], sugerimos..."*
- **Taxonomia Fechada (KPIs):** As categorias de ação viram um banco estruturado:
    - *Ação Interna:* [Adaptação Curricular, Ledora em Prova, Reforço no Contraturno]
    - *Acionar Família:* [Convite Reunião Presencial, Encaminhamento Clínico Externo, Adaptação de Rotina em Casa]
- **Campo Auxiliar:** O `textarea` vira estritamente um local para "Justificativa/Complemento", não a base da ação.

---

## 3. Arquivos Impactados

1. **`src/types/index.ts` (ou similar) e `src/data/mockData.ts`**
   - *O que muda:* Criação dos objetos de taxonomia base (Enums ou Arrays) para as Ações Estruturadas que alimentarão o Modal e os futuros relatórios.

2. **`src/pages/coordination/InterventionManagement.tsx` (e `CoordStudentDetail.tsx`)**
   - *O que muda:* Refatoração do componente `<DialogContent>` da Intervenção. Inserção lógica que recupera `student.assessments[0]` para injetar como "Contexto Analítico" sugerido no topo do modal.
   - *Risco:* Quebrar o Submit atual que salva no estado global das Intervenções. *Mitigação:* Manter a interface de contrato de disparo inalterada, ajustando apenas o *payload* do texto final gerado ou adicionando os novos campos na interface.

3. **`src/context/AppContext.tsx`**
   - *O que muda:* Atualização das funções de `addIntervention` caso seja necessário injetar Tags estruturadas no payload das intervenções.

---

## 4. Estratégia de Execução (Passo a Passo)

1. **Setup de Taxonomia (Dados Mockados):** Definir as listas exatas do que é uma "Ação Interna" validada e o que é "Ação da Família" validada, para que virem *Selects* fechados.
2. **Construir Inteligência Local (Árvore de Decisão Local):** Criar uma função utilitária `generateSuggestionBasedOnAssessment(assessment)` que retorna dicas com base nas notas insuficientes da avaliação.
3. **Refatoração UI do Modal:** 
   - Inserir Painel Consultivo (Inteligência SIMP).
   - Trocar a caixa genérica de textarea por Selects multiescolha (Tags).
4. **Validação de Fluxo de Salvar:** Garantir que quando o coordenador "Iniciar Tratativa", o texto gerado na timeline do aluno e no Kanban combine as tags escolhidas em um layout bonito e descritível.

---

## 5. Risco e Mitigações

* **Risco:** O Coordenador sentir que "ficou amarrado" para escrever algo específico que não está na lista.
* **Mitigação:** Manter um campo opcional curto para "Observações Livres" abaixo das seleções obrigatórias de KPI.
* **Risco:** A inteligência pré-fabricada sugerir coisas absurdas.
* **Mitigação:** Começar com uma lógica simples baseada apenas em regras de "SE Leitura = Defasada → Rota X".

---
*Aguardando validação do Usuário (Fase R - REVIEW) para transformar em Código.*
