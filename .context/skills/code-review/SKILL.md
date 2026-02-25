---
slug: code-review
name: Code Review
description: Review code quality, patterns, and best practices
---

# Code Review Guidelines

## Context

These guidelines define the coding standards for the SIMP project. Agents should apply these rules when generating or reviewing code.

## General Principles

- **DRY (Don't Repeat Yourself)**: Extract common logic into `src/` (shared modules or hooks).
- **KISS (Keep It Simple, Stupid)**: Prefer simple, readable code over clever one-liners.
- **Composition**: Use React composition patterns (children prop) over excessively complex prop drilling.

## Specific Conventions

### TypeScript & React

- Use `interface` for public API definitions and `type` for unions/intersections.
- explicit return types for API handlers and complex hooks are recommended.
- Use `lucide-react` for icons.
- Use `shadcn/ui` components from `src/components/ui/` instead of building from scratch.

### API Routes (Next.js App Router)

- Always use `NextResponse` for standard responses.
- Wrap handlers in `try/catch` blocks and use `project error-handling patterns (e.g. Supabase errors).
- Validate body payload using Zod.

### Database (Prisma)

- Use the Supabase client from `src/integrations/supabase/client.ts`.
- Prefer `findUnique` over `findFirst` when querying by ID.
- Avoid N+1 queries by using `include` or performing aggregation where possible.

## Security Checks

- Verify `auth().userId` is checked before accessing user-specific data.
- Ensure `isAdmin` check is present for admin routes.

## Performance

- Check for unnecessary `await` in loops; use `Promise.all` for parallel operations.
- Ensure images use `next/image` with appropriate sizing.

## Instructions for Agents

- When suggesting changes, cite the specific guideline being applied.
- Prioritize "Blocker" issues (bugs, security) over "Nitpicks" (formatting).
