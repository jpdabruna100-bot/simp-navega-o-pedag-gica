---
slug: feature-breakdown
name: Feature Breakdown
description: Break down features into implementable tasks
---

# Feature Breakdown Guidelines

## Context

Breaking down features ensures accurate estimation and helps multiple agents/developers work in parallel.

## Decomposition Strategy

### 1. Vertical Slicing

Break features into end-to-end slices rather than layers (Frontend vs Backend).

- **Slice 1**: Core API + Basic UI + Database.
- **Slice 2**: Enhanced UI + Validation.
- **Slice 3**: Edge cases + Polish.

### 2. Task Categories

For each feature, identify tasks in:

- **Database**: Supabase schema / types (`src/integrations/supabase/`).
- **Backend / Data**: Supabase client, queries, and types in `src/integrations/supabase/`.
- **Frontend**: Components (`src/components/...`), Pages (`src/pages/...`).
- **Testing**: Unit and E2E tests.
- **Documentation**: Updates to docs.

## Example: "Add Monthly Reports"

1. **DB**: Add `Report` model to schema.
2. **Data/Logic**: Create report logic or hooks in `src/` (e.g. services or hooks).
3. **API**: Create `GET /api/reports` endpoint.
4. **Frontend**: Create `ReportCard` component.
5. **Frontend**: Create `ReportsPage` at `/dashboard/reports`.
6. **Test**: Write test for `generateReport`.

## Instructions for Agents

- When presented with a high-level requirement, output a numbered list of tasks.
- Identify dependencies between tasks (e.g., "DB schema must be updated before API").
- Estimate complexity (Small/Medium/Large) for each task.
