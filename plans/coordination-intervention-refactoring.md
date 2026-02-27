# Plano PREVC — Refatoração do Fluxo Pedagógico e Encaminhamentos (Coordenação)

**Data:** 2026-02-26  
**Tipo:** Refatoração | Ajuste   
**Status:** Rascunho

---

## O que é o ciclo PREVC?

- **P – Plan:** Documentar o que será feito, consultar referências, listar riscos.
- **R – Review:** Revisão humana do plano (aprovar ou ajustar).
- **E – Execute:** Implementar somente após aprovação.
- **V – Validate:** Validar resultado (testes, smoke test, checklist).
- **C – Confirm:** Consolidar (merge, docs, limpeza de rascunhos).

Nunca executar mudanças estruturais ou de regra de negócio sem passar por P e R.

---

## 1. Objetivo

Transformar a interface da Coordenação de um formato de "registros/prontuários genéricos" para uma visão de "Gerência Analítica". O plano visa conectar de forma fluida os Cenários reais da escola: alinhamentos com o professor, orientação à família, e os encaminhamentos contextualizados para a equipe multidisciplinar (Psicopedagogia), resolvendo ambiguidades semânticas ("Intervenção").

---

## 2. Before vs After

| Aspecto | Antes | Depois |
|--------|--------|--------|
| **Nomenclatura (Ação Coordenador)** | Botão genérico "Intervenção". Sensação clínica. | "Registrar Ação" ou "Acompanhamento". Transmite o real papel de alinhar plano professor/família. |
| **Encaminhamento P/ Psicologia** | Botão `[Psicologia]` marca risco, cria tag, mas envia a demanda "às cegas". A Psicóloga tem que caçar o motivo. | Botão `[Acionar Psicologia]` abre Modal dinâmico para a Coord. escrever o **motivo/queixa**, empacotando o histórico para a Psicóloga. |
| **Status de Solução do Aluno** | Aluno entra em Alerta. A Intervenção quando concluída some do radar, aluno segue em alerta sem clareza do impacto ("Vida que segue"). | Ao abrir um Acompanhamento, o Painel de Alerta marca explicitamente `Família Acionada / Em Acompanhamento`. Reduz ansiedade. |
| **Formulário de "Intervenções"** | Opções engessadas (Ex: Adaptação Curricular). | Traz as opções para a realidade escolar (Ex: *Conversa com Família*, *Orientação de Reforço Externo*, *Acompanhamento Interno*). |

---

## 3. Consultation (referências usadas)

- [x] Contexto da evolução arquitetural e realidades da Coordenação: `AlertsPanel.tsx` e `InterventionManagement.tsx`.
- [x] Ocorrências e Modelagem (`mockData.ts`): análise dos tipos de `INTERVENTION_TYPES` existentes e atributos dos Estudantes.

---

## 4. Seções / arquivos a alterar (escopo estrito)

Liste **apenas** o que será modificado. Quem executa o plano **não** altera outros arquivos ou seções.

| Arquivo ou área | O que alterar |
|-----------------|----------------|
| `src/data/mockData.ts` | Adicionar suporte ao histórico de *encaminhamento* (ex: novo atributo `psychReferralReason`) no `Student` ou no payload de envio; Alterar a array `INTERVENTION_TYPES`. |
| `src/pages/coordination/AlertsPanel.tsx` | Ajustar rótulos (Labels/Tags). Implementar Modal (Dialog) no botão de envio p/ psicologia exigindo 1 string de Motivo para continuar. Mostrar tag "Em acompanhamento". |
| `src/pages/psychology/PsychStudentDetail.tsx`<br>(ou na tela de recepção) | Ler e exibir no topo da Ficha ou na seção de Triagem a "Queixa Relatada pela Coordenação" vinda do mock. |
| `src/pages/coordination/InterventionManagement.tsx` | (Opcional, em momento posterior) Refatorar headers e colunas da tabela "Gestão de Intervenções" para a ideia de Planos de Ação, atualizando com os novos mock types. |

---

## 5. Risks

| Risk 1 | Poluição na interface primária de Alertas. | **Mitigation:** O input do motivo do encaminhamento à psico deve acontecer via Dialog/Modal leve, apenas sob intenção de clique. |
| Risk 2 | Quebra das dependências de mock e tipagem das intervenções pre-existentes no `InterventionManagement.tsx` e `AppMap`. | **Mitigation:** Manter compatibilidade com os arrays do `students`, apenas ampliando ou alterando strings sem mexer estruturalmente nos ID/Relations. |

---

## 6. Execution Checklist (fase E)

Após aprovação (R):

- [ ] Fase 1: Atualizar Tipos e Arrays no `mockData.ts` (Adicionar field "Motivo Reencaminhamento" e Tipos de Ação).
- [ ] Fase 2: Implementar Modal com input ("Queixa Inicial / Motivo") no momento do encadeamento no `AlertsPanel.tsx` (Botão "Acionar Psico").
- [ ] Fase 3: Exibir a Queixa Principal destacada na Triagem da Psicologia (`PsychStudentDetail.tsx`).
- [ ] Fase 4: Limpar rótulos de "Intervenção" nos Painéis de Coordenação para "Ação/Acompanhamento".

---

## 7. Validation Checklist (fase V)

- [ ] Clicar em encaminhar Pscicologia; um Modal deve impedir a confirmação sem descrever a queixa.
- [ ] Garantir que o painel de alertas não confunda "Intervenções" com registros médicos/comportamentais.
- [ ] Build e lint ok (`npm run build`, `npm run lint`)

---

## 8. Approval

- **Revisado em:** _______________
- **Aprovado por:** _______________
- **Data de execução:** _______________

---

*Template baseado no ciclo PREVC do AI Solutions Architect e em práticas de planejamento do starter-kit. Use para mudanças que exigem revisão antes de implementar.*
