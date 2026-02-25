---
slug: test-generation
name: Test Generation
description: Generate comprehensive test cases for code
---

# Test Generation Guidelines

## Context

This project uses **Vitest** for unit tests and **Playwright** for E2E tests.

## Frameworks

- **Unit**: Vitest + React Testing Library (for components).
- **E2E**: Playwright.

## File Organization

- Unit tests: Located in `tests/unit/` or co-located with source files as `*.test.ts`.
- E2E tests: Located in `tests/e2e/` and named `*.spec.ts`.

## Unit Test Strategy

Focus on testing pure functions and hooks in `src/` (e.g. context, utilities).

**Example (Utility):**

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCredits } from '@/lib/credits/utils';

describe('calculateCredits', () => {
  it('should return 0 for free plan', () => {
    expect(calculateCredits('free')).toBe(0);
  });
});
```

**Mocking:**
Use `vi.mock()` to mock external modules (e.g. Supabase client).

## E2E Test Strategy

Test critical user journeys: Sign Up, Login, Credit Usage, Admin Dashboard.

**Example (Playwright):**

```typescript
import { test, expect } from '@playwright/test';

test('admin dashboard loads', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL('/sign-in'); // Redirects if not logged in
});
```

## Coverage Requirements

- **High**: Auth and data logic in `src/integrations/supabase/` and sensitive flows.
- **Medium**: `src/hooks/`, `src/components/ui/` (Core logic/UI).
- **Low**: Simple presentational pages.

## Instructions for Agents

1. Determine the type of code (UI component vs. Business Logic).
2. Choose the appropriate framework (Playwright vs. Vitest).
3. Generate positive cases (happy path).
4. Generate negative cases (error handling, invalid input).
5. Ensure mocks are used for external services (OpenRouter, Stripe, Clerk).
