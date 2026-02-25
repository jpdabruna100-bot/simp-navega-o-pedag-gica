# Security & Compliance Notes — SIMP

This document captures security policies and guardrails for the SIMP project.

## Authentication & Authorization

- **Identity:** Supabase Auth is used for authentication and user management.
- **Session:** Handled by Supabase (e.g. localStorage or cookies as configured in the client).
- **Protected routes:** Implement route guards or layout-level checks so that only authorized profiles (e.g. professor, admin) can access the corresponding pages.
- **API / Data:** Supabase Row Level Security (RLS) and server-side rules should protect data; the client in `src/integrations/supabase/` should be used in line with those policies.

## Secrets & Sensitive Data

- **Storage:** API keys and secrets (e.g. Supabase anon key, service role if ever used in a backend) MUST be in environment variables (e.g. `.env`), not committed.
- **Build:** Vite exposes only `import.meta.env.VITE_*` to the client; do not put secrets in client-side code.
- **Data classification:** Treat user and institutional data as private; do not expose it in logs or public assets.

## API & Input Safety

- **Validation:** Validate and sanitize user input before sending to Supabase or storing.
- **Rate limiting:** If you add custom API routes or server logic later, consider rate limiting and abuse prevention.

## Incident Response

In case of a security concern:

1. Identify affected areas (e.g. auth, specific tables, routes).
2. Revoke or rotate compromised credentials.
3. Notify maintainers; document and fix the cause.
4. Update this doc or runbooks if new patterns are introduced.
