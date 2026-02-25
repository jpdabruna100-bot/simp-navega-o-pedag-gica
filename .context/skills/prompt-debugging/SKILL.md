---
slug: prompt-debugging
name: Prompt Debugging
description: Advanced investigation techniques for conversational AI agent prompts (LLM behavior debugging)
phases: [E, V]
---

# Prompt Debugging Workflow

## Context

Debugging conversational AI agents requires specialized techniques beyond traditional code debugging. This skill provides systematic investigation methods for identifying and fixing prompt-related issues like verbosity, context blindness, premature actions, and conflicting instructions.

## When to Use

- Agent repeats information unnecessarily
- Agent asks for data it already has
- Agent shows summaries before collecting all required data
- Agent ignores context or rules
- Agent behavior is inconsistent across similar scenarios

## Investigation Framework (10-Phase Protocol)

### Phase 1: Symptom Classification

Identify which failure mode is active:

1. **Greeting Loop**: Agent repeats greetings or introductions
2. **Echo Chamber**: Agent repeats user's input verbatim
3. **Context Blindness**: Agent asks for data in `<context>` tags
4. **Prompt Bloat**: Agent provides excessive explanations
5. **Premature Summary**: Agent shows results before collecting all data
6. **Example Trap**: Agent follows examples literally, ignoring conditionals
7. **Question Stacking**: Agent asks multiple questions in one turn
8. **Validation Loop**: Agent asks for confirmation of existing data

### Phase 2: Context Awareness Check

**Questions:**
1. Does `<dados_cliente>` or context contain the data the agent asked for?
2. Is there a "Context First" rule in the prompt?
3. Where is the conflicting instruction that overrides it?

**Grep Commands:**
```bash
# Find all references to the problematic data
grep -in "cpf\|email\|endereço" [prompt-file]

# Find context-related rules
grep -in "context\|dados_cliente\|silent fill" [prompt-file]
```

### Phase 3: Rule Conflict Detection

**Questions:**
4. Are there multiple rules addressing the same scenario?
5. Which rule has higher priority in the prompt structure?
6. Are there keywords like "validate", "confirm", "verify" that contradict "silent" or "implicit"?

**Method:**
- Create a mental map of rule coverage
- Identify overlapping sections
- Check which appears LAST (recency bias)

### Phase 4: Example Hygiene Audit

**Questions:**
7. Do examples show the agent asking for data WITHOUT checking context first?
8. Are there hardcoded scripts that bypass conditional logic?

**Bad Example:**
```xml
User: "I want X" -> AI: "What is your Y?"
```

**Good Example:**
```xml
User: "I want X" (Context: Y missing) -> AI: "What is your Y?"
```

**Grep Commands:**
```bash
# Find all examples
grep -in "exemplo\|example" [prompt-file]

# Find hardcoded scripts
grep -in "script:\|diga:\|peça:" [prompt-file]
```

### Phase 5: Few-Shot Conflict Detection (MANDATORY)

**Questions:**
12. Are there hardcoded scripts that contradict behavioral rules?
13. Do examples show unconditional behavior?
14. Are there composite questions in examples/scripts?
15. Do tool definitions have "APÓS RETORNO" instructions that teach verbosity?

**Double-Check Procedure:**
```bash
# 1. Find all hardcoded scripts
grep -in "script:" [file] | grep -v "^#"

# 2. Find all examples
grep -in "exemplo\|example" [file]

# 3. Find post-action instructions
grep -in "após retorno\|after.*return" [file]

# 4. Find imperative commands
grep -in "peça\|diga\|ask for\|say" [file]
```

### Phase 6: Instruction Density Analysis

**Questions:**
16. Are there multiple rules addressing the same scenario in different sections?
17. Which section appears LAST in the prompt?

**Method:**
```bash
# Find density of mentions
grep -in "cpf\|email\|endereço" [file] | awk -F: '{print $1}' | uniq -c
```

**Action:** If conflict exists, the LAST instruction wins (recency bias).

### Phase 7: Dependency Chain Validation

**Questions:**
18. Does Tool A require data from Tool B?
19. Are there circular dependencies?

**Visual Map Example:**
```
consulta_user → dados_cliente → consulta_frete → criar_pedido
                      ↓
                atualiza_contato (optional)
```

**Check:** Is there a rule ensuring B is called before A?

### Phase 8: Pre-Mortem Analysis

**Questions:**
20. What happens if the user provides PARTIAL data?
21. What happens if a tool returns empty/null?
22. What happens if the user changes their mind mid-flow?

**Test Scenarios:**
- User says "não sei" to every question
- User provides data in wrong format (CPF with letters)
- User asks unrelated question mid-checkout

### Phase 9: Semantic Redundancy Detection

**Questions:**
23. Are there rules that say the same thing with different words?

**Examples:**
- "Use context" = "Check dados_cliente" = "Don't ask if you have it"
- "Be brief" = "Don't repeat" = "One question per turn"

**Action:** Consolidate into ONE authoritative rule.

### Phase 10: Metrics-Driven Investigation

**Questions:**
24. What is the MOST common user complaint?
25. What is the average conversation length?
26. What percentage of conversations end without conversion?

**Data Sources:**
- Logs, support tickets, user feedback
- Conversation analytics
- Drop-off points

## Correction Protocol

### 1. Locate the Conflict

- **Line Number:** Identify exact line in XML/prompt
- **Section:** Which `<rule>` or `<tool>` is causing the issue
- **Type:** Hardcoded script, example, or rule conflict

### 2. Apply Surgical Fix

**Priority Order:**
1. Remove conflicting hardcoded scripts
2. Add explicit prohibitions with examples
3. Strengthen conditional logic in examples
4. Add Guard Clauses (exceptions before triggers)

### 3. Add Negative Examples

**Template:**
```xml
**PROIBIÇÃO DE [BEHAVIOR]:**
- ❌ "[Exact wrong behavior from logs]"
- ❌ "[Another variation]"

**AÇÃO CORRETA:**
- ✅ "[Correct behavior]"
- ✅ "[Another correct variation]"
```

### 4. Validate with Double-Check

Run the 5 audits from Few-Shot Hygiene Protocol:
1. Hardcoded Scripts
2. Example Consistency
3. Composite Questions
4. Tool Instruction Verbosity
5. Grep-Based Validation

## Common Fixes

### Fix 1: Context Blindness
```xml
<!-- BEFORE -->
AI: "Qual seu CPF?"

<!-- AFTER -->
**REGRA:**
- Antes de pedir CPF, cheque `<dados_cliente>`.
- Se CPF existe: USE silenciosamente.
- Se NÃO existe: Aí sim, pergunte.
```

### Fix 2: Premature Summary
```xml
<!-- BEFORE -->
Checklist: [✅ Qtd] [✅ Método] [❌ CPF] [❌ Email]
AI: [Shows summary]

<!-- AFTER -->
**PRÉ-REQUISITO OBRIGATÓRIO:**
Antes de mostrar resumo, VALIDE que TODOS os 5 itens estão completos:
- [ ] Quantidade
- [ ] Método
- [ ] Endereço
- [ ] CPF
- [ ] Email

SE FALTAR ALGUM: Pergunte APENAS o primeiro faltante.
```

### Fix 3: Verbosity / Mini-Resumos
```xml
<!-- BEFORE -->
AI: "Show! Para 2 frascos com retirada, o total fica R$ 140. Qual seu CPF?"

<!-- AFTER -->
**PROIBIÇÃO DE MINI-RESUMOS:**
Durante coleta de dados, é PROIBIDO:
- ❌ Repetir quantidade: "para os 2 frascos"
- ❌ Mencionar preço: "o total fica R$ 140"
- ❌ Mencionar método: "com retirada"

**AÇÃO CORRETA:**
- ✅ "Qual seu CPF?" (Simples, direto)
```

### Fix 4: Ambiguous Words
```xml
<!-- BEFORE -->
"Confirme o valor direto" → LLM interprets as "Ask for confirmation"

<!-- AFTER -->
"Apresente o valor diretamente" → Clear action verb
```

## Output Format

When investigating a prompt issue, provide:

```markdown
## 🎯 Failure Mode
[Name of failure mode from Phase 1]

## 🔍 Root Cause
**Location:** Line X-Y in [section]
**Problem:** [Exact issue]
**Conflict:** [Rule A says X, but Rule B says Y]

## 🔧 Proposed Fix
**Action:** [Remove/Add/Modify]
**Target:** [Specific lines or section]
**Rationale:** [Why this fixes the root cause]

## ✅ Validation
- [ ] Double-check passed (5 audits)
- [ ] No new conflicts introduced
- [ ] Negative examples added
```

## Best Practices

1. **Always use grep commands** - Don't rely on memory
2. **Check LAST occurrence** - Recency bias matters
3. **Add concrete examples** - LLMs follow examples > rules
4. **Test edge cases** - Pre-mortem analysis prevents regressions
5. **Document changes** - Maintain a changelog

## References

- [AI Debug Specialist](../../agents/ai-debug-specialist.md)
- [AI Solutions Architect](../../agents/ai-solutions-architect.md)
- [INTELLIGENCE.md](../../../src/n8n/agents/INTELLIGENCE.md)
