---
slug: bug-investigation
name: Bug Investigation
description: Systematic bug investigation and root cause analysis
---

# Bug Investigation Workflow

## Context

Efficient debugging requires a structured approach to identify the root cause in the Next.js/Prisma/Clerk stack.

## Investigation Steps

### 1. Reproduction

- Can it be reproduced locally?
- Is it specific to a user role (Admin vs User)?
- Does it happen in Dev or Prod only?

### 2. Log Analysis

- Check server logs for `[Error]` tags (using console or project logging).
- Check browser console for React/Network errors.
- Look for API error responses (4xx, 5xx).

### 3. Isolation

- **Frontend**: Is the state correct? Use React DevTools.
- **API**: Is the payload correct? Use Network tab or Postman.
- **Database**: Is the data correct? Use Supabase dashboard or client queries to verify data.

### 4. Root Cause Analysis (RCA)

- Trace the data flow: Component -> Hook -> API Route -> Controller -> Database.
- Identify where the expectation diverges from reality.

## Common Patterns

- **Auth Errors**: Token expired or missing. Check `middleware.ts`.
- **Credit Errors**: Race conditions in deduction. Check credit/balance logic where implemented in the codebase.
- **Hydration Errors**: HTML mismatch. Check for random values/dates used during SSR.

## Instructions for Agents

- Start by creating a reproduction test case if possible.
- Use `logError` to capture context if the bug is intermittent.
- Fix the root cause, not just the symptom.
- Add a regression test to prevent recurrence.
