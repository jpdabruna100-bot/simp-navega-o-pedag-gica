# Conversational AI Agents

*This document is **reference material** (originally from an n8n/automation context). The SIMP project is a Vite/React/Supabase app and does not use n8n workflows; the principles below can still inform prompt design or future AI-assisted features.*

## Overview (reference)

Multi-agent conversational AI systems (e.g. for e-commerce automation using n8n workflows) can follow the patterns below. The agents handle customer interactions, sales processes, and order management with advanced prompt engineering techniques.

## Agent Architecture

### Agent Types

| Agent | Role | Prompt File | Status |
|-------|------|-------------|--------|
| **Gloria** | Sales & Checkout | `agent-sales-gloria-v3.xml` | Production |
| **Julia** | SDR & Qualification | `agent-sdr-julia-v2.50.xml` | Production |
| **Maria** | Support & FAQ | `agent-support-maria-v2.xml` | Development |

### Core Principles (8 Pillars)

All agents follow the **8 Core Pillars** defined in [`INTELLIGENCE.md`](../../src/n8n/agents/INTELLIGENCE.md):

1. **Context First**: Never ask for data that exists in context
2. **Implicit Confirmation**: Avoid redundant confirmations
3. **Atomic Phases**: One task at a time
4. **Cognitive Process**: Think before speaking
5. **Dynamic Few-Shot**: Conditional examples only
6. **Sequential Flow**: One question per turn
7. **Negative Constraints**: Define what NOT to do
8. **Few-Shot Hygiene**: Audit examples for conflicts

## Prompt Engineering Standards

### Silent Fill Strategy

Agents use existing data from `<dados_cliente>` without asking for confirmation:

```xml
<dados_cliente>
  Nome: William David
  CPF: 001.705.453-26
  Email: william@exemplo.com
  Endereço: Rua X, 37, Bairro Y, Cidade - UF, CEP
</dados_cliente>
```

**Rule**: If data exists in context, use it silently. Only ask if missing.

### Slot Filling Algorithm

Agents collect data using a **checklist subtraction** method:

```
Checklist: [Qtd] [Método] [Endereço] [CPF] [Email]
1. Check context for each item
2. Skip items that exist
3. Ask ONLY for the first missing item
4. Re-validate after each collection
5. Show summary when ALL 5 items complete
```

### Anti-Verbosity Rules

**Prohibited during data collection:**
- ❌ Repeating quantity: "além dos 2 frascos"
- ❌ Mentioning price: "o total fica R$ 140"
- ❌ Mentioning method: "vamos com entrega"
- ❌ Composite questions: "além dos X, qual seu CPF?"

**Correct approach:**
- ✅ "Qual seu CPF?" (Simple, direct)
- ✅ "E o email?" (Next item only)

## Debugging Agents

### Common Issues

| Issue | Failure Mode | Fix |
|-------|--------------|-----|
| Agent asks for existing data | Context Blindness | Add "Check `<dados_cliente>` first" rule |
| Agent shows summary too early | Premature Summary | Add checklist validation before summary |
| Agent repeats information | Echo Chamber / Verbosity | Add explicit prohibition with examples |
| Agent asks compound questions | Question Stacking | Enforce "One Question Per Turn" |

### Investigation Tools

Use the **[Prompt Debugging Skill](../skills/prompt-debugging/SKILL.md)** for systematic investigation:

1. **10-Phase Protocol**: Comprehensive debugging framework
2. **Grep Commands**: Find conflicts in prompts
3. **Double-Check**: 5 mandatory audits before deployment

### Specialist Agents

For complex debugging, invoke:

- **[@ai-debug-specialist](../agents/ai-debug-specialist.md)**: Systematic bug investigation
- **[@ai-solutions-architect](../agents/ai-solutions-architect.md)**: Prompt design and refactoring

## Workflow Integration

### n8n Workflow Structure

```
Webhook (Message Received)
  ↓
Decision Engine (Route by Intent)
  ↓
Agent Node (Gloria/Julia/Maria)
  ↓
Tool Execution (consulta_user, criar_pedido, etc.)
  ↓
Response to Customer
```

### Tools Available

| Tool | Purpose | Required Data |
|------|---------|---------------|
| `consulta_user` | Fetch customer data from Supabase | Telefone |
| `atualiza_contato` | Update customer data | Email, CPF, Nome, etc. |
| `consulta_frete` | Calculate shipping | CEP |
| `criar_pedido` | Create order | All 5 checklist items |
| `Calculator` | Math operations | Expression (e.g., "150 - 10") |

## Testing Agents

### Test Scenarios

**Happy Path:**
1. User: "Quero comprar"
2. Agent: "Quantos frascos?"
3. User: "2"
4. Agent: "Entrega ou retirada?"
5. User: "Entrega"
6. Agent: [Calls consulta_frete silently]
7. Agent: "Qual seu CPF?"
8. User: "001.705.453-26"
9. Agent: "E o email?"
10. User: "william@exemplo.com"
11. Agent: [Shows summary]

**Edge Cases:**
- User changes mind mid-flow
- User provides partial data (CEP with missing digits)
- User asks unrelated question during checkout
- Tool returns empty/null

### Validation Checklist

Before deploying a prompt change:

- [ ] No hardcoded scripts contradict rules
- [ ] All examples are conditional (include context)
- [ ] No composite questions exist
- [ ] Tool instructions don't teach verbosity
- [ ] Grep validation passed for all 4 patterns

## Performance Metrics

### Key Metrics

- **Average Conversation Length**: 5-7 turns for simple purchase
- **Conversion Rate**: % of conversations ending in order
- **Drop-off Points**: Where users abandon conversation
- **Common Complaints**: Top 3 user issues

### Monitoring

Review logs for:
- Repeated questions (context blindness)
- Premature summaries (missing data)
- Verbosity (mini-resumos)
- Tool errors (missing parameters)

## Best Practices

### Do's ✅

- Use `<dados_cliente>` before asking
- Show summary only when ALL 5 items complete
- Ask one question at a time
- Add negative examples (❌) for clarity
- Run double-check before deployment

### Don'ts ❌

- Don't repeat user's input
- Don't mention price during data collection
- Don't ask for confirmation of existing data
- Don't show partial summaries
- Don't use hardcoded scripts without conditionals

## References

- [INTELLIGENCE.md](../../src/n8n/agents/INTELLIGENCE.md) - Core principles
- [Prompt Debugging Skill](../skills/prompt-debugging/SKILL.md) - Investigation framework
- [AI Debug Specialist](../agents/ai-debug-specialist.md) - Debugging playbook
- [AI Solutions Architect](../agents/ai-solutions-architect.md) - Design patterns

## Contributing

When modifying agent prompts:

1. Read [CONTRIBUTING.md](../../CONTRIBUTING.md) for coding standards
2. Follow the 8 Core Pillars
3. Add negative examples for new prohibitions
4. Run the Few-Shot Hygiene Protocol
5. Test with edge cases
6. Document changes in CHANGELOG
