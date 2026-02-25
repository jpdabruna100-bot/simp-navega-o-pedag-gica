---
slug: refactoring
name: Refactoring
description: Safe code refactoring with step-by-step approach
---

# Refactoring Guidelines

## Context

Refactoring aims to improve code structure without altering behavior. This is critical for maintaining the long-term health of the SIMP.

## Common Code Smells to Watch

- **Long Components**: React components > 200 lines. -> Extract sub-components.
- **Prop Drilling**: Passing props through > 3 layers. -> Use Context or Composition.
- **Duplicate Logic**: Same validation or formatting logic in multiple places. -> Extract to shared util or hook in `src/`.
- **Hardcoded Strings**: Magic strings for API routes or keys. -> Use constants.

## Safe Refactoring Workflow

1. **Verify Tests**: Ensure current tests pass. If none, write a characterization test.
2. **Atomic Changes**: Make small, reversible changes.
3. **Verify**: Run tests after each small change.
4. **Cleanup**: Remove unused imports or dead code immediately.

## Specific Patterns

- **API Routes**: Keep business logic in `src/` (hooks, context, or services), not only in UI.
- **Hooks**: Extract stateful logic from UI components into custom hooks in `src/hooks/`.

## Instructions for Agents

- Identify the scope of refactoring before starting.
- Create a backup plan (git branch) if the refactor is complex.
- Do not change functionality while refactoring.
- If you find a bug during refactoring, document it or fix it in a separate step/commit.
