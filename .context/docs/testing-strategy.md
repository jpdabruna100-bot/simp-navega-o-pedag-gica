# Testing Strategy — SIMP

Quality is maintained in SIMP through unit and integration tests using **Vitest** and **React Testing Library** where applicable.

## Test Types

- **Unit tests:** Pure functions, utilities, and hooks. Use Vitest.
- **Component / integration tests:** React components with React Testing Library; test behavior and user interactions where valuable.
- **Convention:** Test files alongside source (e.g. `*.test.ts`, `*.test.tsx`) or in a `tests/` directory as preferred by the project.

## Running Tests

- **Run all tests:**
  ```bash
  npm run test
  ```
- **Watch mode (if configured):**
  ```bash
  npm run test:watch
  ```
  (Check `package.json` scripts.)

## Quality Gates

- **Linting:** `npm run lint` — ensure code follows ESLint rules.
- **Build:** `npm run build` — ensure the app builds without errors.
- **Types:** TypeScript is strict; fix type errors before merging.

## Tips

- Prefer testing behavior and critical paths over implementation details.
- Mock Supabase client or use test fixtures when testing code that depends on Supabase.
- Keep tests fast and focused; avoid unnecessary external calls in unit tests.
