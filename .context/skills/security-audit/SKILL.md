---
slug: security-audit
name: Security Audit
description: Security review checklist for code and infrastructure
---

# Security Audit Checklist

## Context

Security is paramount. This checklist guides the audit of code changes and infrastructure configurations.

## Code Audit

- [ ] **Injection**: Are SQL queries using Prisma properly? (Prisma prevents most SQLi, but check `queryRaw`).
- [ ] **XSS**: Is user input rendered safely? (React handles most, but check `dangerouslySetInnerHTML`).
- [ ] **CSRF**: Are mutations protected? (Next.js Server Actions/API routes usually handle this, but verify headers).
- [ ] **Broken Access Control**: Can User A access User B's data? (Verify `where: { userId }` clauses).

## Dependency Audit

- [ ] **Versions**: Are dependencies up to date? (`npm audit`).
- [ ] **Secrets**: Are `.env` files committed? (They should NOT be).

## Infrastructure/Config

- [ ] **Middleware**: Is `src/middleware.ts` correctly protecting routes?
- [ ] **Headers**: Are security headers (HSTS, Content-Security-Policy) configured in `next.config.ts`?

## Feature-Specific Checks

- **AI Chat**: Is there a rate limit? Are prompts sanitized?
- **Credits**: Are transactions atomic to prevent double-spending?
- **File Uploads**: Are file types and sizes validated on the server?

## Instructions for Agents

- When auditing, assume the attacker is motivated.
- Check every API route for the "Triple A": Authentication, Authorization, Audit (Logging).
- Report any findings immediately with a severity level (Critical/High/Medium/Low).
