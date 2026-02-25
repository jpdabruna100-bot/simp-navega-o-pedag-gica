---
slug: documentation
name: Documentation
description: Generate and update technical documentation
---

# Documentation Standards

## Context

Documentation is the source of truth for the project. It resides in `.context/docs/` and `src/` (as code comments).

## Doc Types

1. **Core Guides**: Markdown files in `.context/docs/` (e.g., `architecture.md`).
2. **Code Comments**: TSDoc/JSDoc for functions and classes.
3. **README**: Project entry point.

## TSDoc Conventions

Use JSDoc/TSDoc for all exported functions and interfaces.

**Example:**

```typescript
/**
 * Deducts credits from a user's balance.
 *
 * @param userId - The Clerk user ID.
 * @param amount - The amount of credits to deduct.
 * @throws {InsufficientCreditsError} If balance is too low.
 * @returns The updated credit balance.
 */
export async function deductCredits(userId: string, amount: number): Promise<number> { ... }
```

## Markdown Structure

- Use clear H1 (`#`) for titles and H2 (`##`) for sections.
- Use lists for steps or features.
- Use code blocks with language tags (e.g., `typescript`) for snippets.

## README Expectations

- **Title**: Project Name.
- **Description**: Value prop.
- **Quick Start**: minimal steps to run.
- **Tech Stack**: Key technologies.

## Instructions for Agents

- When adding a new feature, update `project-overview.md` if high-level, or specific feature docs.
- If a new environment variable is added, update `.env.example` (not the doc files directly, but note it).
- Ensure links between documents are relative (`./architecture.md`).
