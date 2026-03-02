# Proposta: PEI no SIMP — elaboração colaborativa (equipe multidisciplinar e professor)

**Data:** 2026-02-27  
**Contexto:** O PEI (Plano Educacional Especializado/Individual) hoje aparece na rota da equipe multidisciplinar apenas como **upload de documento**. A proposta é alinhar o SIMP à prática real: PEI como **documento vivo**, elaborado de forma **colaborativa** por professor e/ou equipe multidisciplinar.

---

## 1. O que a literatura e a prática dizem

### 1.1 Papel da equipe multidisciplinar na escola

- **Objetivo:** Apoiar a inclusão e o desenvolvimento do aluno por meio de avaliação, planejamento e acompanhamento integrados (pedagógico, psicopedagógico, psicológico, familiar).
- **Composição típica:** Professor de AEE, professor regente, coordenador pedagógico, psicólogo escolar, psicopedagogo, assistente social, gestão, família e, quando possível, o próprio aluno.
- **Funções relevantes ao SIMP:**
  - Triagem e priorização de casos (alunos em risco, encaminhamentos).
  - Avaliação psicopedagógica/psicológica (classificação, necessita acompanhamento, observações).
  - Construção e revisão do **PEI** em parceria com o professor e a coordenação.
  - Registro de laudos, acompanhamento externo, medicação, contato com a família.
  - Acompanhamento contínuo (reavaliações, ajustes de estratégias).

Ou seja: a equipe **não só recebe** documentos — ela **elabora** planejamentos (como o PEI) junto com o professor e a coordenação.

### 1.2 O que é o PEI e quem elabora

- **PEI (Plano Educacional Individualizado/Especializado):** instrumento de **planejamento e acompanhamento** das necessidades, potencialidades e estratégias do estudante (deficiência, TEA, altas habilidades). Não é laudo médico; é ferramenta **pedagógica**.
- **Elaboração:** Deve ser **coletiva e colaborativa**:
  - Professor do AEE costuma **coordenar** a escrita.
  - Professor regente/sala comum contribui com o dia a dia em sala, objetivos e dificuldades.
  - Equipe multidisciplinar (psicologia, psicopedagogia) traz avaliações, metas e orientações.
  - Coordenação e gestão acompanham; família (e aluno) participam.
- **Característica importante:** PEI é documento **em constante revisão** (“feito a lápis, não a caneta”), revisto ao longo do ano conforme o desenvolvimento do aluno.

Conclusão: o SIMP faz mais sentido tratar o PEI como **artefato elaborado dentro do sistema** (com contribuições do professor e da equipe), e não apenas como “arquivo anexado”.

---

## 2. Problema atual no SIMP

- Na rota **Psicologia** (`/psicologia/aluno/:id`), o PEI aparece apenas como:
  - Opção de **categoria** no upload (“Laudo”, “PEI”, “Outro”).
  - Campo **possuiPEI** na avaliação psicopedagógica (Sim / Não / Em elaboração).
- Não há:
  - Formulário ou fluxo para **elaborar** o PEI (metas, estratégias, responsáveis, prazos).
  - Diferenciação entre “PEI elaborado pela equipe” e “PEI elaborado pelo professor” (ou em conjunto).
  - Histórico de **versões/revisões** do PEI.
  - Integração com a **avaliação pedagógica** (professor) e com o **plano de contingência** (coordenação) para alimentar o PEI.

Ou seja: o modelo atual reforça a ideia de “anexar um PEI pronto”, e não de “construir e atualizar o PEI no SIMP”.

---

## 3. Proposta de alto nível

Tratar o PEI no SIMP como **recurso elaborável e editável** no sistema, com dois cenários de origem (e combinação deles):

| Cenário | Quem inicia / lidera | Onde no SIMP |
|--------|----------------------|--------------|
| **A**  | Professor (sala comum) | Professor: “Iniciar / Editar PEI” na ficha do aluno (com base na avaliação pedagógica e plano de ação). |
| **B**  | Equipe multidisciplinar (AEE, psicologia, psicopedagogia) | Psicologia: além de “Upload (Simulado)”, opção “Elaborar PEI” ou “Abrir PEI” que leva a um formulário/editor de PEI. |
| **A + B** | Colaborativo | Mesmo “PEI do aluno” acessível e editável (com permissões) por professor e equipe; histórico de contribuições e versões. |

Assim, **substitui-se (ou complementa-se) o “apenas upload”** por:

1. **Elaboração no sistema:** formulário/estrutura de PEI (metas, estratégias, responsáveis, prazos, observações) preenchido por professor e/ou equipe.
2. **Upload opcional:** manter upload para casos em que o PEI foi feito fora do SIMP (ex.: documento externo, rede).
3. **Rastreio de autoria/revisão:** saber quem criou, quem alterou e quando (timeline do aluno).
4. **Integração com fluxos existentes:** avaliação pedagógica e plano de contingência podem alimentar ou ser referenciados no PEI.

---

## 4. Sugestão de funcionalidades (para um plano de feature)

- **Modelo de dados**
  - Entidade (ou estrutura) **PEI** por aluno: identificador, versão, data criação/atualização, autor(es), status (rascunho, em elaboração, vigente, arquivado).
  - Campos sugeridos (alinhados à prática): objetivos de aprendizagem/desenvolvimento; estratégias pedagógicas e de AEE; adequações de currículo; participação da família; prazos de revisão; observações.
  - Opcional: manter **documentos anexos** (upload de PDF/Word do PEI) vinculados ao PEI do aluno, em vez de “só” documento solto.

- **Professor**
  - Na ficha do aluno: botão “Iniciar PEI” ou “Ver / Editar PEI” (se já existir).
  - Formulário de PEI (ou abas: objetivos, estratégias, observações) preenchível pelo professor; salvar como “contribuição do professor” ou “rascunho”.

- **Equipe multidisciplinar (Psicologia / AEE)**
  - Na ficha do aluno: em vez de **apenas** “Upload (Simulado)” para PEI, opção **“Elaborar PEI”** ou **“Abrir PEI”** que abre o mesmo recurso de PEI (formulário/estrutura).
  - Se já existir PEI: “Ver / Editar PEI” com indicação de quem já contribuiu (professor, psicologia, etc.).
  - Campo “Possui PEI?” na avaliação psicopedagógica pode ser alimentado automaticamente (Sim / Em elaboração) conforme existência e status do PEI no sistema.

- **Coordenação**
  - Visualização do PEI na ficha do aluno (somente leitura ou com permissão de edição, conforme regra de negócio).
  - Timeline: eventos “PEI criado”, “PEI atualizado por X”.

- **Documentos**
  - Seção “Documentos do Aluno” continua com Laudo, PEI (upload), Outro.
  - Quando houver **PEI elaborado no SIMP**, exibir link/aba “PEI (elaborado)” e, se houver, “PEI (anexo)” para o arquivo enviado.

---

## 5. Resumo

- **Equipe multidisciplinar** na escola atua na avaliação, no planejamento e na construção do PEI junto com o professor e a coordenação; não só “recebe” laudos e PEIs prontos.
- **PEI** deve ser tratado no SIMP como **documento elaborável** por professor e/ou equipe, com histórico e, se desejado, upload como complemento.
- **Melhor proposta** para atender aos cenários: introduzir **recurso “PEI” elaborável** (formulário/estrutura) acessível ao professor e à equipe multidisciplinar, manter upload como opção e integrar ao fluxo de avaliação pedagógica e de plano de contingência.

Este documento pode ser usado como base para um **plano de feature** (template em `plans/templates/feature-plan-template.md`) e para refinamento de requisitos e fases de implementação.
