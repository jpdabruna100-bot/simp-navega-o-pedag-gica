# Revisão: Plano de melhoria do fluxo da equipe multidisciplinar (Psicologia Escolar Crítica e OQE)

**Data:** 2026-03-01  
**Objetivo:** Consolidar o entendimento do plano de 01/03/2026 com a proposta PEI (27/02) e evidenciar o que é relevante para o SIMP, além de prós e contras.

---

## 1. Entendimento do conteúdo

### 1.1 Princípios ancorados

O plano propõe ancorar o SIMP em:

- **Psicologia Escolar Crítica** e **Orientação à Queixa Escolar (OQE)**  
- Foco no **processo de escolarização** (rede de relações no cotidiano escolar), não no “distúrbio” do aluno  
- Evitar que o módulo da equipe multidisciplinar vire **ferramenta clínica** (prontuário, diagnóstico como centro)

Ou seja: a queixa é fenômeno da **rede** (escola, família, aluno); o sistema deve apoiar **escuta**, **trajetória** e **intervenção pedagógica**, não só registro de sintomas ou rótulos.

### 1.2 Seis estratégias e aplicação no SIMP

| Estratégia | Aplicação no SIMP |
|------------|--------------------|
| **1. Foco no processo de escolarização** | Campos para “Trajetória Escolar” e “Quem é esse aluno em sala e no intervalo”; colher versões da escola, família e aluno sobre o impasse (não “sintomas médicos”). |
| **2. Potencialidades em vez de só déficits** | Campo obrigatório “Identificar e Fortalecer Potências” (ZDR → ZDP); evita rotulagem e centra em como a rede pode atuar. |
| **3. Instrumentos de escuta pedagógica** | EOCA (Entrevista Operativa Centrada na Aprendizagem) e PDI como roteiros/templates; PDI processual, focado em objetivos de aprendizagem e mediação do professor. |
| **4. Linguagem descritiva vs. diagnóstica** | Sugerir/exigir verbos de ação e descrição (“demonstra necessidade de apoio para…”) em vez de rótulos (“tem TDAH”). |
| **5. Coordenador como mediador** | Coordenação vê “mediação e intervenção” sugerida para o professor; alertar se a orientação técnica virou prática em sala. |
| **6. Integração extraescolar sem perder identidade** | Módulo de encaminhamentos externos (UBS, CRAS), mas registros internos focados em **como a escola adapta metodologia/didática** para aquele aluno. |

### 1.3 Requisitos funcionais (RF) do plano

- **RF1:** Mini-formulário de **entrada** (versões da queixa, trajetória escolar, **potencialidades obrigatórias**, instrumento utilizado).  
- **RF2:** Templates/roteiros EOCA e observação integrados à timeline.  
- **RF3:** Formulário completo com tipo, queixa (texto livre, verbo ativo), **ZDR/ZDP**, potencialidades, necessidade de acompanhamento, **PEI/PDI** (objetivos, estratégias, responsáveis, cronograma), encaminhamentos externos (com aviso de foco escolar), observação, anexos.  
- **RF4:** Avaliação inicial → criar automaticamente tarefa de contato familiar se não existir.  
- **RF5:** Coordenação recebe notificações; vê potenciais, ZDP e mini-PEI com opção de converter em intervenção pedagógica.  
- **RF6:** Timeline com todos os registros de escuta e avaliações, ícones distintos, detalhes (incl. formulários/roteiros).  
- **RF7:** Filtros no painel (instrumento, situação, potencialidades); ordenação: pendentes → acompanhamento → avaliados.  
- **RF8:** Lembretes automáticos de reavaliação (periodicidade configurável).  
- **RF9:** Dados (potencialidades, ZDR, ZDP) expostos via API para relatórios.

---

## 2. O que é relevante para o projeto SIMP

- **Alinhamento com o propósito:** O project-overview já define o SIMP como “monitoramento **pedagógico** e psicopedagógico”; o plano reforça que a equipe multidisciplinar atua no **processo de escolarização**, não como clínica. Isso é diretamente relevante.  
- **PEI/PDI:** O plano usa “PDI” (Plano de Desenvolvimento Individual) no sentido processual (objetivos de aprendizagem, estratégias de mediação). A [proposta PEI 27/02](2026-02-27-proposta-pei-equipe-multidisciplinar.md) trata o PEI como **documento elaborável no sistema** por professor e equipe. Os dois se reforçam: PDI/PEI no SIMP = plano **pedagógico** (objetivos, estratégias, responsáveis), não só anexo de laudo.  
- **Coordenação como mediadora:** O project-overview já coloca a coordenação como “maestro”; o plano explicita “ver mediação sugerida para o professor” e “converter mini-PEI em intervenção”. Relevante para dashboards e fluxo Kanban.  
- **Timeline e notificações:** Já existem timeline e fluxos de intervenção; o plano acrescenta eventos de escuta, EOCA, reavaliação e notificações à coordenação — tudo compatível com o modelo atual.  
- **Evitar duplicação de conceitos:** PEI (proposta 27/02) e PDI (plano 01/03) no contexto do SIMP podem ser tratados como o **mesmo artefato** (plano individual de desenvolvimento/educacional), com nome unificado (ex.: “PEI/PDI”) na UI e no domínio.

---

## 3. Resposta: campo “Potencialidades do Aluno” no início da ficha

**Sim, ajuda a quebrar a tendência clínica.**

- Colocar **“Potencialidades do Aluno”** (ou “Identificar e Fortalecer Potências”) **logo no início** da ficha da equipe multidisciplinar:
  - **Obriga** a equipe a registrar o que o aluno **já consegue** (ZDR) antes de preencher queixa, classificação ou encaminhamento.
  - Reduz o risco de a tela virar “lista de problemas/sintomas”.
  - Alinha com ZDR/ZDP e com a prioridade de “potências” em vez de só “déficits”.
- **Sugestão de implementação:** Primeiro bloco visível na ficha (ou no mini-formulário de entrada RF1) com campo obrigatório “Potencialidades / O que esse aluno já faz bem (em sala, no intervalo, em casa)?”; opcionalmente um segundo campo “Objetivos de desenvolvimento (ZDP)” já na entrada ou no formulário completo.

**Prós:** Consistência com OQE e Psicologia Escolar Crítica; UX que guia para linguagem não rotuladora.  
**Contras:** Mais um campo obrigatório; pode exigir formação da equipe para preenchimento qualificado.

---

## 4. Cruzamento com a proposta PEI (27/02)

| Tema | Proposta PEI (27/02) | Plano 01/03 (Psicologia Escolar Crítica) | Convergência |
|------|----------------------|-------------------------------------------|--------------|
| Quem elabora o plano | Professor e/ou equipe multidisciplinar; colaborativo | PDI com objetivos de aprendizagem e estratégias de mediação do professor | Mesmo artefato: PEI/PDI elaborável no sistema por ambos; foco pedagógico. |
| Conteúdo do plano | Metas, estratégias, responsáveis, prazos, observações | Objetivos de aprendizagem, estratégias de mediação, cronograma | Alinhados. Incluir ZDR/ZDP e potencialidades no PEI/PDI. |
| Coordenação | Ver PEI; timeline “PEI criado/atualizado” | Ver mini-PEI; converter em intervenção pedagógica; alertar se orientação não virou prática | Coordenação vê e **age** sobre o plano (converter em intervenção no Kanban). |
| Upload | Manter upload de PEI externo como opção | — | Mantido; foco principal é elaboração no sistema. |
| Linguagem | — | Descritiva, não diagnóstica | Campos de PEI/avaliação devem sugerir descrição (ex. placeholders, ajuda contextual). |

Conclusão: a proposta PEI e o plano 01/03 se **somam**. O PEI/PDI no SIMP deve ser o mesmo recurso: elaborável, com potencialidades/ZDR/ZDP, objetivos e estratégias, acessível ao professor e à equipe, com coordenação podendo converter em intervenção e acompanhar se virou prática.

---

## 5. Prós e contras do plano 01/03

### Prós

- **Mantém o SIMP como ferramenta pedagógica/institucional**, não clínica: escuta, trajetória, rede, mediação.  
- **Potencialidades obrigatórias** e ZDR/ZDP reduzem rotulagem e centram em intervenção.  
- **EOCA e PDI** como instrumentos nomeados dão lastro teórico e reprodutibilidade ao fluxo.  
- **Coordenação ativa:** não só “repasse”; vê orientações e converte em intervenção, com alertas de efetividade.  
- **Timeline e notificações** aproveitam estruturas já previstas no projeto.  
- **Lembretes de reavaliação** melhoram acompanhamento contínuo.  
- **API/Prisma** para potencialidades e ZDR/ZDP prepara relatórios e análises futuras.

### Contras / Riscos

- **Escopo grande:** muitos RFs e campos novos (mini-entrada, EOCA, PDI, notificações, lembretes, filtros). Mitigação: implementar em fases (ex.: primeiro mini-entrada + potencialidades + PEI/PDI; depois EOCA; depois notificações e lembretes).  
- **Curva de uso:** equipe e professores precisam entender ZDR/ZDP, linguagem descritiva e instrumentos (EOCA). Mitigação: textos de ajuda, exemplos na UI e formação.  
- **Duplicidade PEI x PDI:** dois nomes para o mesmo tipo de plano pode confundir. Mitigação: unificar em “PEI/PDI” ou “Plano de Desenvolvimento (PEI)” na documentação e na interface.  
- **Backend:** plano menciona Prisma; o projeto atual usa mock e Supabase. Mitigação: definir se próxima etapa é Prisma ou extensão do modelo atual (Supabase/types + mock) e manter RFs compatíveis com ambos.  
- **Notificações in-app:** exige definição de canal (toast, lista, sino) e persistência; pode ser deixado para fase 2.

---

## 6. Recomendações

1. **Incluir o campo “Potencialidades do Aluno”** no início da ficha (e no mini-formulário de entrada) como obrigatório, e referenciar ZDR/ZDP na ajuda do formulário.  
2. **Unificar PEI e PDI** no desenho do sistema: uma entidade/recurso “PEI/PDI” com objetivos, estratégias, responsáveis, cronograma, potencialidades e ZDP.  
3. **Priorizar na primeira entrega:** (a) mini-formulário de entrada com potencialidades e versões da queixa; (b) campo potencialidades + ZDR/ZDP no formulário de avaliação; (c) PEI/PDI elaborável (conforme proposta 27/02); (d) coordenação vê PEI/PDI e pode converter em intervenção. Deixar EOCA como template/roteiro para fase seguinte.  
4. **Documentar** no project-overview e no glossary que o módulo da equipe multidisciplinar está ancorado em Psicologia Escolar Crítica e OQE e que o foco é processo de escolarização, não diagnóstico clínico.  
5. **Atualizar** a proposta [2026-02-27-proposta-pei-equipe-multidisciplinar.md](2026-02-27-proposta-pei-equipe-multidisciplinar.md) com um parágrafo que remeta a este plano (potencialidades, ZDR/ZDP, linguagem descritiva, coordenação mediadora).

---

## 7. Resumo

- O plano de 01/03 está **relevante e alinhado** ao SIMP: reforça foco pedagógico, rede e mediação; evita clinicalização.  
- A **proposta PEI (27/02)** e o **plano 01/03** se complementam: mesmo PEI/PDI elaborável, com potencialidades e ZDR/ZDP, e coordenação convertendo em intervenção.  
- O campo **“Potencialidades do Aluno”** no início da ficha **ajuda** a quebrar a tendência clínica e deve ser incluído.  
- **Prós** do plano: coerência teórica, papel ativo da coordenação, instrumentos nomeados, preparação para relatórios. **Contras**: escopo amplo, necessidade de formação e possível confusão PEI/PDI — mitigáveis com fases de implementação e unificação de conceitos na documentação e na UI.

---

## 8. Sugestão: aplicação simples, eficiente e inteligente

Proposta de implementação **enxuta** que mantém o SIMP alinhado à Psicologia Escolar Crítica e à OQE sem complexidade desnecessária.

### 8.1 Princípios da sugestão

| Critério | O que significa nesta aplicação |
|----------|----------------------------------|
| **Simples** | Poucos conceitos novos por tela; reutilizar formulários e componentes já existentes; um único artefato “PEI” (nome unificado), sem EOCA como módulo separado na v1. |
| **Eficiente** | Um lugar para potencialidades e ZDR/ZDP (entrada + avaliação); “converter em intervenção” = criar/vincular ao Kanban já existente; sem duplicar fluxos. |
| **Inteligente** | A UX guia: potencialidades antes da queixa; placeholders e textos de ajuda em linguagem descritiva; regras automáticas (ex.: contato familiar ao salvar avaliação inicial) sem exigir passos extras do usuário. |

### 8.2 Desenho em três camadas (mínimo viável)

**Camada 1 — Ficha do aluno (Psicologia): “Quem é esse aluno” antes do problema**

- **No topo da ficha** (`PsychStudentDetail`), logo após o cabeçalho e o relato do professor, um **único bloco**:
  - **“Potencialidades”** (obrigatório): texto livre, placeholder do tipo *“O que esse aluno já faz bem? (em sala, no intervalo, em casa)”*. Dica breve: *“Registre primeiro o que o aluno consegue (ZDR) para planejar os próximos passos (ZDP).”*
  - **“Objetivos de desenvolvimento (ZDP)”** (opcional na v1): uma linha ou textarea curta, ex. *“Próximos passos que a rede pode apoiar.”*
- **Regra:** Só liberar o botão “Nova Avaliação Psicopedagógica” (ou abrir o formulário completo) se “Potencialidades” estiver preenchido para aquele aluno naquela sessão — pode ser guardado em estado do aluno (ex.: `student.potencialidades` / `student.zdp`) para não repetir a cada vez.
- **Justificativa:** Simples = um bloco, dois campos. Eficiente = mesma tela, sem novo “mini-formulário” em modal. Inteligente = obrigatoriedade de potencialidades antes da avaliação quebra o foco só no problema.

**Camada 2 — Avaliação e PEI em um só fluxo**

- **Formulário de avaliação** já existente ganha:
  - Campos **Potencialidades** e **ZDP** (podem ser pré-preenchidos pelo bloco da Camada 1 ou preenchidos aqui).
  - **Observação / Queixa** com placeholder em linguagem descritiva: *“Descreva a situação (evite rótulos; ex.: ‘demonstra necessidade de apoio para manter a atenção em tarefas de leitura’).”*
  - **PEI (Plano de Desenvolvimento):** uma única seção no mesmo formulário (ou abas: Avaliação | PEI) com: objetivos de aprendizagem (texto), estratégias de mediação (texto), responsável, data de revisão. Não criar “PDI” como entidade separada — no domínio e na UI, tudo é **PEI** com esses campos.
- **Ao salvar avaliação inicial:** se não existir `familyContact` para o aluno, criar automaticamente (como já previsto no plano). Registrar evento na timeline (“Avaliação inicial”, “PEI atualizado”).
- **Justificativa:** Simples = um formulário, uma entidade PEI. Eficiente = não há dois fluxos (avaliação vs. PEI). Inteligente = placeholders e um único lugar para objetivos/estratégias evitam dispersão e linguagem diagnóstica.

**Camada 3 — Coordenação vê e age**

- Na **ficha do aluno na coordenação** (`CoordStudentDetail`): exibir um resumo **“Potencialidades e PEI”**: potencialidades (uma linha ou tooltip), objetivos e estratégias do PEI, data de revisão. Botão **“Converter em intervenção”**: abre o fluxo já existente de plano de contingência (ou cria um card no Kanban “Em Acompanhamento” com dados do PEI preenchidos). Não criar novo módulo — reutilizar `Intervention` e o Kanban.
- **Opcional (v1):** um indicador “Orientação da equipe multidisciplinar ainda não convertida em intervenção” (ex.: existe PEI com estratégias mas nenhuma intervenção vinculada ou concluída). Pode ser só um badge ou texto; “alertas” mais elaborados ficam para fase 2.
- **Justificativa:** Simples = mesma ficha e mesmo Kanban. Eficiente = um clique gera a intervenção a partir do PEI. Inteligente = coordenação vê potencialidades e plano antes de agir e tem como transformar orientação em ação rastreável.

### 8.3 O que fica de fora na primeira entrega (para manter simples)

- **EOCA como template separado:** não implementar roteiro EOCA completo na v1; o formulário de “escuta” já é a própria avaliação com potencialidades, queixa descritiva e PEI. EOCA pode entrar depois como checklist ou template de perguntas.
- **Notificações in-app** (sino, lista): postergar; eventualmente um toast ao salvar (“Coordenação poderá ver o PEI”) já ajuda.
- **Lembretes de reavaliação** com cronograma configurável: postergar ou fazer algo mínimo (ex.: data de revisão no PEI exibida na lista da psicologia como “Revisar até DD/MM”).
- **Filtros avançados** por instrumento/potencialidades: manter filtros atuais (turma, risco, profissional); filtro por “tem PEI” ou “pendente reavaliação” pode ser fase 2.

### 8.4 Modelo de dados (mínimo)

- **Aluno:** `potencialidades?: string`, `zdp?: string` (ou só um objeto `entradaMultidisciplinar?: { potencialidades: string; zdp?: string }` com data).
- **Avaliação psicopedagógica (PsychAssessment):** já existe; acrescentar `potencialidades?: string`, `zdp?: string`, `queixaDescritiva?: string`; e ou um `pei?: { objetivos: string; estrategias: string; responsavel: string; dataRevisao: string }` embutido, ou referência a uma entidade PEI por aluno (uma por aluno, atualizada a cada avaliação).
- **PEI:** uma estrutura por aluno (id, alunoId, objetivos, estrategias, responsavel, dataRevisao, createdAt, updatedAt); a última versão é exibida na coordenação e na ficha da psicologia. Upload de PDF de PEI externo continua como documento anexo (categoria “PEI”).
- **Timeline:** novos tipos de evento, ex. `potencialidades_registradas`, `pei_atualizado`, para manter histórico.

### 8.5 Resumo da sugestão

- **Simples:** Um bloco de potencialidades/ZDP no topo da ficha; um formulário de avaliação com PEI integrado; um nome (PEI) para o plano; coordenação reutiliza a ficha e o Kanban existentes.
- **Eficiente:** Dados em um lugar; “converter em intervenção” = uma ação sobre o fluxo atual; poucos campos novos no modelo.
- **Inteligente:** Obrigatoriedade de potencialidades antes da avaliação; placeholders em linguagem descritiva; criação automática de contato familiar; coordenação vê potencialidades e PEI e pode transformar em intervenção em um clique.

Essa aplicação coloca a aplicação dentro do SIMP mantendo o foco pedagógico, a rede e a mediação, sem transformar o sistema em ferramenta clínica e sem inflar o escopo na primeira entrega.
