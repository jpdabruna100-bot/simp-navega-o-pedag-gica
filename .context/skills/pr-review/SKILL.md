---
slug: pr-review
name: Pr Review
description: Review pull requests against team standards and best practices
---

# PR Review Checklist

## Context

This checklist ensures all Pull Requests meet the quality, security, and functionality standards of the SIMP project before merging.

## Core Checklist

### 1. Functionality & Logic

- [ ] **Requirements**: Does the code meet the ticket/issue requirements?
- [ ] **Edge Cases**: Are empty states, loading states, and error states handled?
- [ ] **Logic**: Is the business logic sound? (e.g., check balance/credit logic in the codebase for balance checks).

### 2. Code Quality & Style

- [ ] **Consistency**: Does the code follow the project's style (ESLint/Prettier)?
- [ ] **Naming**: Are variable and function names descriptive (e.g., `useCredits` vs `getData`)?
- [ ] **Typing**: Is strict TypeScript used? Avoid `any` where possible.
- [ ] **Modularity**: Are large components broken down? (e.g., splitting `ChatMessages.tsx` if it gets too large).

### 3. Security (Critical)

- [ ] **Auth**: Are API routes protected with `auth()` from Clerk?
- [ ] **Input**: Is user input validated using Zod schemas?
- [ ] **Secrets**: Are no API keys or secrets hardcoded?

### 4. Performance

- [ ] **Rendering**: Are `use client` directives used only where necessary?
- [ ] **Queries**: Are database queries optimized (e.g., selecting only needed fields in Prisma)?

### 5. Testing

- [ ] **Coverage**: Are there unit tests for new utility functions?
- [ ] **E2E**: Do major flows pass Playwright tests?

## Documentation

- [ ] **Glossary**: Are new terms added to `docs/glossary.md`?
- [ ] **Comments**: Is complex logic explained with "Why" comments?

## Instructions for Agents

When reviewing a PR:

1. Fetch the diff of the changes.
2. Step through the checklist above.
3. If an issue is found, provide a snippet showing the improved version.
4. Be constructive and specific.
