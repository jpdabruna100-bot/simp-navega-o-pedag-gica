# Plano PREVC — [Nome da mudança]

**Data:** YYYY-MM-DD  
**Tipo:** Refatoração | Ajuste | Correção | Investigação  
**Status:** Rascunho | Em revisão | Aprovado | Executado | Validado

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

[Uma ou duas frases: o que esta mudança resolve ou entrega.]

---

## 2. Before vs After

| Aspecto | Antes | Depois |
|--------|--------|--------|
| [Ex.: comportamento da tela X] | [Estado atual] | [Estado desejado] |
| [Outro aspecto] | [Atual] | [Desejado] |

---

## 3. Consultation (referências usadas)

- [ ] [Doc ou arquivo 1] — [o que foi validado]
- [ ] [Doc ou arquivo 2] — [o que foi validado]

Ex.: README, arquitetura, tipos Supabase, componente existente.

---

## 4. Seções / arquivos a alterar (escopo estrito)

Liste **apenas** o que será modificado. Quem executa o plano **não** altera outros arquivos ou seções.

| Arquivo ou área | O que alterar |
|-----------------|----------------|
| `src/...` | [Descrição objetiva da alteração] |
| [Outro] | [Descrição] |

Regra: ver [metodologia-escopo-edicao.md](../../metodologia-escopo-edicao.md).

---

## 5. Risks

| Risk 1 | [Descrição] | **Mitigation:** [Ação] |
| Risk 2 | [Descrição] | **Mitigation:** [Ação] |

---

## 6. Execution Checklist (fase E)

Após aprovação (R):

- [ ] Tarefa 1
- [ ] Tarefa 2
- [ ] Tarefa 3

---

## 7. Validation Checklist (fase V)

- [ ] [Cenário 1]
- [ ] [Cenário 2]
- [ ] Build e lint ok (`npm run build`, `npm run lint`)

---

## 8. Approval

- **Revisado em:** _______________
- **Aprovado por:** _______________
- **Data de execução:** _______________

---

*Template baseado no ciclo PREVC do AI Solutions Architect e em práticas de planejamento do starter-kit. Use para mudanças que exigem revisão antes de implementar.*
