# Prompt Engineering Best Practices

## Introduction

This guide documents advanced prompt engineering techniques used in our conversational AI agents. These practices ensure consistent, efficient, and user-friendly agent behavior.

## Core Concepts

### 1. Context-Aware Design

**Principle**: Agents should use available data before asking questions.

**Implementation**:
```xml
<dados_cliente>
  Nome: {{ $json.Nome }}
  CPF: {{ $json.CPF }}
  Email: {{ $json.Email }}
</dados_cliente>

**REGRA:**
- Antes de pedir QUALQUER dado, cheque `<dados_cliente>`.
- Se existe: USE silenciosamente.
- Se NÃO existe: Aí sim, pergunte.
```

**Anti-Pattern**:
```xml
<!-- BAD -->
AI: "Qual seu nome?"
(Context already has: Nome: "William")

<!-- GOOD -->
AI: "Oi William! Como posso ajudar?"
```

### 2. Implicit vs Explicit Confirmation

**Principle**: Confirm by using data, not by asking.

**Examples**:

| Scenario | ❌ Explicit (Avoid) | ✅ Implicit (Prefer) |
|----------|---------------------|----------------------|
| Name in context | "Seu nome é William?" | "Oi William!" |
| Address in context | "Confirma seu endereço?" | [Use in summary] |
| CPF in context | "Seu CPF é X?" | [Use in criar_pedido] |

**Exception**: Only ask for confirmation if data is **critical** and **potentially outdated** (e.g., shipping address after 6 months).

### 3. Atomic Phase Design

**Principle**: One task per conversational turn.

**Bad Flow** (Multiple tasks):
```
AI: "Quantos frascos? E qual seu CEP? E prefere entrega ou retirada?"
```

**Good Flow** (Atomic):
```
AI: "Quantos frascos?"
User: "2"
AI: "Entrega ou retirada?"
User: "Entrega"
AI: [Calls consulta_frete]
AI: "Qual seu CPF?"
```

### 4. Dynamic Few-Shot Learning

**Principle**: Examples must include conditional logic.

**Bad Example** (Unconditional):
```xml
<example>
  User: "Quero comprar"
  AI: "Qual seu nome?"
</example>
```

**Good Example** (Conditional):
```xml
<example>
  Context: Nome missing
  User: "Quero comprar"
  AI: "Qual seu nome?"
  
  Context: Nome = "William"
  User: "Quero comprar"
  AI: "Oi William! Quantos frascos?"
</example>
```

### 5. Negative Constraints

**Principle**: Define what NOT to do with concrete examples.

**Template**:
```xml
**PROIBIDO:**
- ❌ [Exact wrong behavior from logs]
- ❌ [Another variation]

**CORRETO:**
- ✅ [Right behavior]
- ✅ [Another variation]
```

**Real Example**:
```xml
**PROIBIÇÃO DE MINI-RESUMOS:**
- ❌ "Show! Para 2 frascos com retirada, o total fica R$ 140. Qual seu CPF?"
- ❌ "Perfeito! Além dos 2 frascos, qual seu email?"
- ✅ "Qual seu CPF?"
- ✅ "E o email?"
```

## Advanced Techniques

### Slot Filling with Re-Validation

**Problem**: Agent collects CPF, then shows summary without checking if Email is missing.

**Solution**: Re-validate checklist after EACH data collection.

```xml
**REGRA DE RE-VALIDAÇÃO:**
- APÓS COLETAR UM DADO (ex: CPF), VOLTE AO CHECKLIST.
- Verifique se TODOS os 5 itens estão completos.
- Se FALTAR algum: Pergunte o próximo.
- Se COMPLETO: Mostre o resumo.

**Fluxo Visual:**
Checklist: [✅ Qtd] [✅ Método] [✅ Endereço] [❌ CPF] [❌ Email]
AI: "Qual seu CPF?"
User: "001.705.453-26"
AI: [Salva CPF]
AI: [RE-VALIDA: ✅ Qtd, ✅ Método, ✅ Endereço, ✅ CPF, ❌ Email]
AI: "E o email?"
```

### Guard Clauses for Exceptions

**Problem**: General rule triggers even when exception applies.

**Solution**: Add "FILTRO DE EXCEÇÃO" before main rule.

```xml
<rule id="temporal_awareness">
  **FILTRO DE EXCEÇÃO (AVALIE PRIMEIRO):**
  - **INTENÇÃO FUTURA:** Se cliente disse "Para amanhã": PARE. Regra não se aplica.
  - **VENDA ONLINE:** Se for Envio Correios: PARE. Regra não se aplica.
  
  **REGRA PRINCIPAL (SÓ SE NÃO FOR EXCEÇÃO):**
  - Se cliente pedir "Agora" E hora atual entre 16h-17h:
    -> "Ainda dá tempo! Mas corre! 🏃‍♀️"
</rule>
```

### Ambiguity Resolution

**Problem**: Words like "Confirme" can mean "Ask for confirmation" or "Present directly".

**Solution**: Use unambiguous action verbs.

| ❌ Ambiguous | ✅ Clear |
|--------------|----------|
| "Confirme o valor" | "Apresente o valor" |
| "Valide o endereço" | "Use o endereço silenciosamente" |
| "Verifique o CPF" | "Chame criar_pedido com o CPF" |

### Tool Instruction Clarity

**Bad** (Verbose post-action):
```xml
<tool name="consulta_frete">
  APÓS RETORNO: Confirme com o cliente se o endereço está correto, 
  pergunte se prefere essa opção de frete, e então peça o CPF para 
  finalizar o pedido.
</tool>
```

**Good** (Concise):
```xml
<tool name="consulta_frete">
  APÓS RETORNO: Use logradouro + bairro na mensagem. 
  Pergunte APENAS o próximo dado faltante do checklist.
</tool>
```

## Debugging Patterns

### Pattern 1: Context Blindness

**Symptom**: Agent asks for data in `<dados_cliente>`.

**Diagnosis**:
```bash
grep -in "cpf\|email" agent-prompt.xml
# Check if there's a rule saying "Check context first"
```

**Fix**:
```xml
**ANTES DE PEDIR CPF:**
1. Cheque `<dados_cliente>`.
2. Se CPF existe: USE silenciosamente.
3. Se NÃO existe: Pergunte.
```

### Pattern 2: Premature Summary

**Symptom**: Agent shows summary before collecting all required data.

**Diagnosis**:
```bash
grep -in "resumo\|summary" agent-prompt.xml
# Check if there's a checklist validation
```

**Fix**:
```xml
**PRÉ-REQUISITO OBRIGATÓRIO:**
Antes de mostrar resumo, VALIDE que TODOS os 5 itens estão completos:
- [ ] Quantidade
- [ ] Método
- [ ] Endereço
- [ ] CPF
- [ ] Email

SE FALTAR ALGUM: Pergunte APENAS o primeiro faltante.
```

### Pattern 3: Verbosity

**Symptom**: Agent repeats information unnecessarily.

**Diagnosis**:
```bash
grep -in "além\|para os\|vamos com" agent-prompt.xml
# Check for mini-resumos in examples
```

**Fix**:
```xml
**PROIBIÇÃO DE MINI-RESUMOS:**
Durante coleta de dados, é PROIBIDO:
- ❌ Repetir quantidade: "além dos 2 frascos"
- ❌ Mencionar preço: "o total fica R$ 140"
- ❌ Mencionar método: "vamos com entrega"
```

### Pattern 4: Conflicting Rules

**Symptom**: Agent behavior is inconsistent.

**Diagnosis**:
```bash
# Find all rules about the same topic
grep -in "cpf" agent-prompt.xml | awk -F: '{print $1}'
# Check which appears LAST (recency bias)
```

**Fix**: Consolidate into ONE authoritative rule or use Guard Clauses.

## Validation Checklist

Before deploying a prompt:

### 1. Hardcoded Scripts
```bash
grep -in "script:" agent-prompt.xml | grep -v "^#"
```
- [ ] All scripts have conditionals (IF context missing → THEN ask)

### 2. Example Consistency
```bash
grep -in "exemplo\|example" agent-prompt.xml
```
- [ ] All examples show context check before asking
- [ ] Examples use ❌/✅ to show wrong vs right

### 3. Composite Questions
```bash
grep -in "?" agent-prompt.xml | grep -E "\?.*\?"
```
- [ ] No questions asking for multiple data points

### 4. Tool Verbosity
```bash
grep -in "após retorno\|after.*return" agent-prompt.xml
```
- [ ] Post-action instructions are concise (1-2 lines max)

### 5. Imperative Commands
```bash
grep -in "peça\|diga\|ask for\|say" agent-prompt.xml
```
- [ ] All commands are conditional or prohibitions

## Performance Optimization

### Token Budget

**Principle**: Minimize prompt size without losing clarity.

**Techniques**:
1. **Semantic Compression**: Say in 1 line what takes 10
2. **Remove Redundancy**: Consolidate duplicate rules
3. **Use References**: Link to external docs instead of repeating

**Example**:
```xml
<!-- BEFORE (50 lines) -->
<regra_de_preco>
  O preço de 1 frasco é R$ 100.
  O preço de 2 frascos é R$ 150 (desconto de R$ 50).
  O preço de 3 frascos é R$ 200 (desconto de R$ 100).
  ...
</regra_de_preco>

<!-- AFTER (10 lines) -->
<tabela_precos>
  1un: R$ 100 | 2un: R$ 150 | 3un: R$ 200 | 4+: R$ 60/un
  **DESCONTO RETIRADA:** Use Calculator para subtrair R$ 10.
</tabela_precos>
```

### Recency Bias Management

**Principle**: LLMs give more weight to recent instructions.

**Strategy**: Place critical rules LAST in the prompt.

```xml
<!-- Structure -->
1. Context (dados_cliente)
2. Tools definitions
3. General rules
4. Specific rules
5. CRITICAL PROHIBITIONS (LAST) ← Most important
```

## Testing Strategies

### Edge Case Matrix

| Scenario | Expected Behavior |
|----------|-------------------|
| User says "não sei" | Agent offers alternatives or skips optional field |
| User provides partial data | Agent validates format and asks for correction |
| User changes mind | Agent updates internal state and continues |
| Tool returns empty | Agent has fallback message |
| User asks unrelated question | Agent answers briefly and returns to flow |

### Regression Prevention

**Maintain a test suite** of "golden conversations":

```markdown
## Test Case: Happy Path Purchase
1. User: "Quero comprar"
2. Expected: "Quantos frascos?"
3. User: "2"
4. Expected: "Entrega ou retirada?"
...
```

**After each prompt change**, re-run all test cases.

## References

- [Conversational AI Agents](./conversational-ai-agents.md) - Agent architecture
- [Prompt Debugging Skill](../skills/prompt-debugging/SKILL.md) - Investigation framework
- [INTELLIGENCE.md](../../src/n8n/agents/INTELLIGENCE.md) - Core principles
- [AI Solutions Architect](../agents/ai-solutions-architect.md) - Design patterns
