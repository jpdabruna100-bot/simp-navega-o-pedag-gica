# Preservar regras funcionais ao executar um plano

**Regra:** Ao executar um plano, altere **apenas** o que o plano define. Não “melhore” ou reescreva outras partes do código ou da doc no mesmo escopo.

## Por quê?

- Evita regressões: o que já funciona continua funcionando.
- Mantém o plano como contrato: quem revisou aprovou aquele escopo, não um escopo ampliado.
- Facilita revisão: mudanças menores e delimitadas são mais fáceis de validar.

## Como aplicar

1. **No plano:** defina explicitamente **Seções a alterar** ou **Arquivos / áreas a alterar** (como nos templates [feature-plan-template.md](templates/feature-plan-template.md) e [prevc-template.md](templates/prevc-template.md)).
2. **Na execução:** mexa somente nesses arquivos/seções. Fora disso = não editar neste plano.
3. **Mudança de escopo:** se precisar alterar algo que não estava no plano, crie um novo plano ou atualize o plano e passe por revisão de novo.

## Exemplo

- **Plano:** “Alterar apenas o texto do botão em `ProfileSelection.tsx` e a cor em `src/index.css` para o tema da página.”
- **Correto:** alterar só esse botão e essa variável de cor.
- **Incorreto:** refatorar todo o `ProfileSelection.tsx` ou “melhorar” outros componentes na mesma tarefa.

Esta metodologia é inspirada na preservação de regras funcionais ao corrigir prompts/agentes no starter-kit-n8n, adaptada para o desenvolvimento de features no SIMP.
