---
name: Advanced Prompt Engineering
description: Advanced techniques for crafting robust, high-performance LLM prompts (Chain-of-Thought, Task Decomposition, Delimiters, etc.).
---

# Advanced Prompt Techniques

This skill documents proven strategies to refine agent behavior, prevent hallucinations, and handle complex scenarios. 
When creating or fixing an agent, the Architect MUST consult this library.

## 1. Technichal Pillars

### Chain-of-Thought (CoT) Prompting
- **Concept:** Force the model to "think" out loud before answering.
- **Why:** Reduces impulsive errors. The model "autocorrects" during the thought process.
- **Implementation:** Add a `<cognitive_process>` or `<thought_process>` block.
- **Example:**
```xml
<cognitive_process>
  1. Analyze user intent.
  2. Check if data is missing.
  3. Formulate response.
</cognitive_process>
```

### Task Decomposition
- **Concept:** Break complex tasks into smaller, manageable steps.
- **Why:** LLMs struggle with multi-part instructions in a single prompt.
- **Implementation:** Sequential Rules or "Atomic Phases".
- **Example:** Instead of "Collect all user data", use "Phase 1: Identify User -> Phase 2: Get Product -> Phase 3: Shipping".

### Delimiters (Structure)
- **Concept:** Use clear markers to separate distinct parts of the prompt.
- **Why:** Helps the model parse instructions vs data vs examples.
- **Implementation:** XML tags (`<system>`, `<rule>`, `<example>`) are superior to Markdown for complex prompts.

### Few-Shot Prompting (Advanced)
- **Concept:** Providing examples.
- **Risk:** Poor examples bias the model (e.g., teaching it to ask for data it already has).
- **Rule:** Use **Dynamic/Conditional Examples**.
  - ❌ `User: Buy -> AI: What is your name?`
  - ✅ `User: Buy (Context: Name unknown) -> AI: What is your name?`

## 2. The Iteration Cycle (The "Refinement Loop")

When creating a new prompt, follow this cycle:

1. **Draft:** Write the initial prompt using best guesses.
2. **Test:** Run against edge cases (Missing data, weird inputs).
3. **Analyze:** Did it hallucinate? Did it loop?
4. **Refine:**
   - **Add Context:** If it guessed wrong.
   - **Decompose:** If it ignored part of the instruction.
   - **Restrain:** If it was too creative.
5. **Repeat.**

## 3. Prompt Chaining (Modular Agents)
- **Concept:** Output of Agent A becomes Input of Agent B.
- **Usage:** Don't make one agent do everything (Support + Sales + Technical). Split them.
- **Benefit:** Specialized prompts are shorter, cheaper, and smarter.

## 4. Self-Correction & Optimization
- **Technique:** Ask the model to critique itself.
- **Prompt:** "Review your last answer. Did you violate rule X? If so, correct it."
- **Meta-Prompting:** Ask the model to optimize its own prompt. "How can I rewrite this instruction to be clearer?"

## 5. The High-Performance Prompt Checklist (Ingredients)

Every professional prompt MUST contain these 5 key elements. Treat them like a recipe:

### 1. Clear Instruction (The "Verb")
- **Do:** Use strong action verbs ("Summarize", "Classify", "Generate").
- **Don't:** Be vague ("Tell me about...").
- **Example:** "Explain Git commands to a beginner."

### 2. Context (The "Background")
- **Do:** Provide the 'Who', 'Where', and 'Why'.
- **Why:** Context reduces hallucination.
- **Example:** "You are an expert dev. The audience is non-technical."

### 3. Examples (The "Pattern")
- **Do:** Use Conditional Few-Shot (as defined in Pillar 1).
- **Why:** Demonstrates style and format better than instructions.

### 4. Output Format (The "Shape")
- **Do:** Specify structure (JSON, Bullet points, XML).
- **Example:** "Return a JSON object with keys: {sentiment, reason}."

### 5. Constraints (The "Guardrails")
- **Do:** Define negative constraints (What NOT to do).
- **Example:** "Do not use flowery language. Max 50 words. No emojis."
