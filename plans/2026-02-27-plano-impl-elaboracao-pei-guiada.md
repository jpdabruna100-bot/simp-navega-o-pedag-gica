# Plano — Elaboração de PEI guiada e intuitiva (fluxo wizard)

**Data:** 2026-02-27  
**Escopo:** Implementar fluxo guiado de elaboração de PEI para o professor, baseado no modelo Jonas (Plano Educacional Especializado), com pré-preenchimento a partir da avaliação pedagógica e recomendações da equipe multidisciplinar.  
**Status:** Rascunho  
**Referências:** [proposta-pei-equipe-multidisciplinar](2026-02-27-proposta-pei-equipe-multidisciplinar.md), [pei-jonas.txt](../../src/data/pei-jonas.txt)

---

## 1. Feature Overview

### Problema
A maioria dos professores tem dificuldade para estruturar um PEI. O documento é extenso, com muitas seções, e exige tempo para redigir do zero. A elaboração manual pode levar dias.

### Objetivo
Oferecer um fluxo **guiado, intuitivo e inteligente** em que o sistema:
- Pré-preenche o máximo possível a partir dos dados já existentes (avaliação pedagógica, recomendações da equipe)
- Sugere opções e frases comuns em vez de tela em branco
- Guia o professor passo a passo (wizard), reduzindo carga cognitiva
- Produz um PEI completo no padrão Jonas em minutos, não dias

**Métrica de sucesso:** Professor conclui elaboração com sensação de "Uau, que sistema incrível, fácil e inteligente — eu levava dias!"

### Não escopo (explicitamente fora)
- Modelo PEI Educação Infantil (estrutura em tabela 4 colunas) — pode ser fase futura
- Upload de PEI externo (já existe parcialmente; manter)
- Assinaturas digitais ou integração com certificação

---

## 2. Requirements

### Funcionais

- [ ] RF1: Wizard de elaboração de PEI em etapas sequenciais (9 passos), com navegação "Anterior / Próximo" e indicador de progresso
- [ ] RF2: Pré-preenchimento automático a partir de: `lastAssessment`, `peiRecomendado` (áreas de atenção, sugestões), dados do aluno
- [ ] RF3: Etapa "Visão geral": exibir resumo do que o sistema já sabe (avaliação, recomendações) — professor confirma/revisa
- [ ] RF4: Etapa "Capacidades": checklist + campo livre; sugestões baseadas em conceitos "Adequada/Adequado"
- [ ] RF5: Etapa "O que sabe": pré-preenchido por área (Linguagens, Matemática etc.) a partir da avaliação; professor ajusta
- [ ] RF6: Etapa "Necessidades / O que aprender": gerado a partir de "Defasada/Defasado" + recomendações da equipe; professor revisa e detalha
- [ ] RF7: Etapa "Recursos": checkboxes (lousa, material dourado, plataformas etc.) + campo para itens customizados
- [ ] RF8: Etapa "Estratégias": lista de estratégias comuns selecionáveis + campo livre curto
- [ ] RF9: Etapa "Objetivos e metas": sugestões por área com base em defasagens; professor escolhe, edita ou adiciona; metas curto e longo prazo
- [ ] RF10: Etapa "Avaliação": opções pré-definidas (somativa adaptada, prova objetiva etc.) + observação opcional
- [ ] RF11: Etapa "Revisão": exibir PEI completo gerado; professor confirma e salva
- [ ] RF12: Persistir PEI no estado do aluno (`pei`) e adicionar evento na timeline

### Não funcionais
- UX: fluxo deve parecer "inteligente" — mínimo de digitação livre, máximo de escolhas guiadas
- Performance: pré-preenchimento e sugestões sem atraso perceptível (dados em memória)
- Acessibilidade: labels, foco, navegação por teclado

---

## 3. Technical Specs

### Stack / impacto

| Área | Tecnologia no SIMP | Impacto neste plano |
|------|--------------------|---------------------|
| Frontend | Vite, React, TypeScript, shadcn/ui | Novo componente `PEIWizard`; modal ou rota dedicada; steps com Stepper |
| Dados | AppContext (mock) | Estender `pei` com estrutura do Jonas; funções de pré-preenchimento |
| Rotas | React Router | Rota opcional `/professor/aluno/:id/pei/elaborar` ou modal na ficha |

### Estrutura de dados PEI (extensão)

Estrutura atual em `mockData.ts`:
```ts
pei?: { objetivos: string; estrategias: string; responsavel: string; dataRevisao: string; dataRegistro?: string };
```

Estrutura proposta (modelo Jonas, mantendo compatibilidade):

```ts
interface PEIElaborado {
  dataRegistro: string;
  dataRevisao: string;
  responsavel: string;
  // Seções Jonas
  capacidades?: string[];
  oQueSabe?: { linguagens?: string; matematica?: string; cienciasHumanas?: string; cienciasNatureza?: string };
  oQueGosta?: string[];
  necessidades?: string[];
  recursos?: string[];
  estrategias?: string[];
  objetivosAcademicos?: { linguagens?: string; matematica?: string; cienciasHumanas?: string; cienciasNatureza?: string };
  objetivosSociais?: string[];
  avaliacao?: { tipo: string; observacao?: string };
  observacoes?: string;
  metasCurtoPrazo?: { linguagens?: string; matematica?: string; cienciasHumanas?: string; cienciasNatureza?: string };
  metasLongoPrazo?: { linguagens?: string; matematica?: string; cienciasHumanas?: string; cienciasNatureza?: string };
  // Campos simplificados atuais (fallback)
  objetivos?: string;
  estrategias?: string;
}
```

**Estratégia de migração:** Manter `objetivos` e `estrategias` como resumo/concatenação para compatibilidade com exibição atual.

### Arquivos impactados (sugestão)

| Arquivo | Alteração |
|---------|-----------|
| `src/data/mockData.ts` | Extender interface `pei`; constantes de sugestões (recursos, estratégias) |
| `src/components/PEIWizard/` ou `src/pages/professor/` | Novo wizard multi-step |
| `src/pages/professor/StudentDetail.tsx` | Trocar modal atual "Registrar PEI" por botão que abre o wizard |
| `src/lib/pei-utils.ts` (novo) | Funções: `preencherAPartirDeAvaliacao`, `sugerirObjetivos`, `sugerirRecursos` |

### Constantes de sugestão (exemplos)

```ts
// recursos comuns
RECURSOS_SUGERIDOS = ["Lousa e pincel", "Livro didático", "Material dourado", "Jogos pedagógicos", "Plataformas digitais", "Projetor", ...];
// estratégias comuns
ESTRATEGIAS_SUGERIDAS = ["Sentar próximo à professora", "Pausas entre tarefas", "Leitura compartilhada", "Avaliação adaptada com suporte", ...];
```

---

## 4. Phases / Tasks

### Fase 1 — Fundação (pré-requisitos)
| # | Tarefa | Dependência | Status |
|---|--------|-------------|--------|
| 1.1 | Criar `src/lib/pei-utils.ts` com funções de pré-preenchimento e sugestões | — | [ ] |
| 1.2 | Definir constantes `RECURSOS_SUGERIDOS`, `ESTRATEGIAS_SUGERIDOS` e mapeamento área → sugestões de objetivos | — | [ ] |
| 1.3 | Estender interface `pei` em `mockData.ts` (manter compatibilidade com `objetivos`, `estrategias`) | 1.1 | [ ] |

### Fase 2 — Wizard MVP (fluxo mínimo)
| # | Tarefa | Dependência | Status |
|---|--------|-------------|--------|
| 2.1 | Criar componente `PEIWizard` com Stepper (9 etapas) e navegação Anterior/Próximo | — | [ ] |
| 2.2 | Implementar etapa 1: Visão geral (resumo avaliação + recomendações; confirmação) | 1.1, 2.1 | [ ] |
| 2.3 | Implementar etapa 2: Capacidades (checklist + sugestões) | 1.1, 2.1 | [ ] |
| 2.4 | Implementar etapa 3: O que sabe (pré-preenchido por área) | 1.1, 2.1 | [ ] |
| 2.5 | Implementar etapa 4: Necessidades (gerado a partir de defasagens + recomendações) | 1.1, 2.1 | [ ] |
| 2.6 | Implementar etapas 5–6: Recursos (checkboxes) e Estratégias (seleção + livre) | 1.2, 2.1 | [ ] |
| 2.7 | Implementar etapa 7: Objetivos e metas (sugestões por área; curto/longo prazo) | 1.1, 2.1 | [ ] |
| 2.8 | Implementar etapa 8: Avaliação (opções) e etapa 9: Revisão + Salvar | 2.1 | [ ] |
| 2.9 | Integrar wizard na ficha do aluno (Professor): botão "Elaborar PEI" abre wizard em modal ou rota | 2.8 | [ ] |
| 2.10 | Persistir PEI no estado; adicionar evento na timeline | 1.3, 2.9 | [ ] |

### Fase 3 — Refino UX
| # | Tarefa | Dependência | Status |
|---|--------|-------------|--------|
| 3.1 | Indicador de progresso visual (ex.: "Passo 3 de 9") e breadcrumb | 2.1 | [ ] |
| 3.2 | Permitir salvar rascunho e retomar depois (opcional) | 2.10 | [ ] |
| 3.3 | Preview do PEI formatado na etapa Revisão (estilo documento) | 2.8 | [ ] |

### Fase 4 — Validação e documentação
| # | Tarefa | Dependência | Status |
|---|--------|-------------|--------|
| 4.1 | Testar fluxo com aluno s8 (Miguel) — tem `peiRecomendado` | 2.10 | [ ] |
| 4.2 | Atualizar `project-overview.md` ou glossário com "PEI guiado" | 4.1 | [ ] |

---

## 5. Risks & Mitigation

| Risco | Mitigação |
|-------|-----------|
| Complexidade do wizard desanima o professor | Manter etapas curtas; mostrar progresso; permitir "pular" etapas opcionais se dados mínimos forem preenchidos |
| Pré-preenchimento incorreto ou genérico | Revisão explícita na etapa 1; professor sempre pode editar; sugestões claramente marcadas como "sugestão" |
| Conflito com formulário PEI atual (modal simples) | Substituir modal "Registrar PEI" pelo wizard; manter dados salvos compatíveis com exibição atual |
| Aluno sem `peiRecomendado` nem avaliação recente | Wizard funciona com campos vazios; sugestões baseadas apenas em assessment se existir; sem recomendações = menos pré-preenchimento |

---

## 6. Validation / Acceptance

- **Cenário 1 (com peiRecomendado):** Professor acessa ficha do aluno s8 → clica "Elaborar e registrar PEI" → wizard abre com etapa 1 mostrando avaliação e recomendações (Leitura, Atenção; sugestões da equipe) → professor avança, confirma sugestões, adiciona poucos itens → na etapa 9 vê PEI completo → Salva → PEI aparece na ficha; timeline registra evento
- **Cenário 2 (sem peiRecomendado):** Professor acessa aluno com avaliação mas sem recomendação → wizard abre com etapa 1 mostrando avaliação → pré-preenchimento baseado em defasagens da avaliação → professor completa manualmente o que faltar
- **Edge case:** Aluno sem avaliação → wizard abre com campos vazios; professor preenche do zero (fluxo ainda guiado por estrutura)

---

## 7. Reference Documentation

- [Project overview](../../.context/docs/project-overview.md)
- [Proposta PEI equipe multidisciplinar](2026-02-27-proposta-pei-equipe-multidisciplinar.md)
- [PEI Jonas (referência de estrutura)](../../src/data/pei-jonas.txt)
- [mockData.ts (interfaces atuais)](../../src/data/mockData.ts)
