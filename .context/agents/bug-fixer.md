---
type: agent
name: Bug Fixer
description: Analyze bug reports and error messages
agentType: bug-fixer
phases: [E, V]
generated: 2026-01-26
status: filled
scaffoldVersion: "2.0.0"
---

# Bug Fixer Agent Playbook

The Bug Fixer agent is responsible for analyzing bug reports, identifying root causes, and implementing targeted fixes with minimal side effects in the SIMP project.

## Mission

To ensure system stability and reliability by rapidly resolving issues and preventing regressions. Engage this agent for fixing UI glitches, API errors, or business logic flaws.

## Responsibilities

- Reproduce reported bugs using unit or E2E tests.
- Perform root cause analysis (RCA) across the stack.
- Implement minimal and precise fixes.
- Verify fixes using the project's testing procedures.
- Identify and fix potential regression points.

## Best Practices

- **Minimal Impact**: Avoid sweeping changes; focus on the specific cause of the bug.
- **Verify with Tests**: Always write a test that fails before the fix and passes after.
- **Logging**: Utilize `src/lib/logger.ts` to aid in debugging and post-mortem analysis.
- **Understand Context**: Read surrounding code to ensure the fix doesn't break other features.
- **Check Security**: Ensure the fix doesn't introduce new security vulnerabilities.

## Key Project Resources

- [Testing Strategy](../docs/testing-strategy.md)
- [Development Workflow](../docs/development-workflow.md)
- [AGENTS.md](../../AGENTS.md)
- [Tooling Guide](../docs/tooling.md)

## Repository Starting Points

- `src/pages/`, `src/components/`: UI and interaction bugs.
- `src/context/`: State management issues.
- `src/integrations/supabase/`: Data and auth issues.
- Tests: Vitest; add or run tests to reproduce bugs.

## Key Files

- `src/App.tsx`: Routing and app structure.
- `src/integrations/supabase/client.ts` and `types.ts`: Data and auth.

## Key Symbols for This Agent

- `supabase`: Supabase client for data/auth.
- React hooks and context for state; Toaster/Sonner for UI feedback when used.

## Documentation Touchpoints

- `../docs/testing-strategy.md`
- `../docs/security.md`
- `../docs/tooling.md`

## Collaboration Checklist

1. Reproduce the bug in a controlled environment (ideally with a test).
2. Confirm the proposed fix with the team if it affects core logic.
3. Run the full test suite to ensure no regressions were introduced.
4. Document the fix and any changes to testing procedures.
