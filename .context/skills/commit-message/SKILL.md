---
slug: commit-message
name: Commit Message
description: Generate commit messages following conventional commits with scope detection
---

# Commit Message Guidelines

## Context

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification to ensure readable and automated release processes.

## Convention

Format: `<type>(<scope>): <description>`

### Types

- `feat`: A new feature (e.g., adding a new page or API route).
- `fix`: A bug fix (e.g., fixing a UI glitch or API error).
- `docs`: Documentation only changes.
- `style`: Changes that do not affect the meaning of the code (white-space, formatting).
- `refactor`: A code change that neither fixes a bug nor adds a feature.
- `perf`: A code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Changes to the build process or auxiliary tools and libraries.

### Scopes

Detect the scope based on the modified files:

- **Global**: `src/index.css`, `tailwind.config.ts`, `package.json` -> `(global)` or root.
- **Admin**: `src/pages/admin/*`, admin components -> `(admin)`
- **Auth**: `src/integrations/supabase/` (auth) -> `(auth)`
- **Pages**: `src/pages/professor/*`, `src/pages/psychology/*`, etc. -> scope by profile
- **Components**: `src/components/*` -> `(components)` or specific area
- **UI**: `src/components/ui/*` -> `(ui)`

## Examples

**Good:**

```
feat(ai): add streaming support for chat completions
fix(admin): resolve credit renewal date calculation
docs(readme): update deployment instructions
refactor(auth): simplify user verification logic in middleware
```

**Bad:**

```
update code
fix bug
added new feature
```

## Instructions for Agents

1. Analyze the staged changes to identify the primary module affected.
2. Determine the most appropriate type (`feat`, `fix`, etc.).
3. Formulate a concise description (imperative mood, e.g., "add", "fix", not "added", "fixed").
4. Combine into the conventional format.
