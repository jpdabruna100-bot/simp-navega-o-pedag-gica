---
slug: api-design
name: Api Design
description: Design RESTful APIs following best practices
---

# API Design Standards

## Context

The project uses Next.js App Router API Routes. We follow RESTful principles where possible.

## Naming Conventions

- **Resource-based URLs**: `/api/resources` (List), `/api/resources/[id]` (Detail).
- **Actions**: `/api/resources/[id]/action` (e.g., `/api/users/123/invite`).
- **Kebab-case**: Use hyphens for URLs (`/api/credit-usage`).

## Request/Response Format

- **JSON**: All payloads and responses must be JSON.
- **Success**: `{ success: true, data: { ... } }` (Standard wrapper recommended).
- **Error**: `{ success: false, error: { message: "...", code: "..." } }`.

## Status Codes

- `200`: OK.
- `201`: Created.
- `400`: Bad Request (Validation failure).
- `401`: Unauthorized (Not logged in).
- `403`: Forbidden (Logged in but no permission).
- `404`: Not Found.
- `500`: Internal Server Error.

## Best Practices

- **Validation**: Use Zod to parse and validate `req.json()`.
- **Auth**: Always check authentication at the top of the handler.
- **Types**: Export the Response type for the frontend to use.

## Example

```typescript
// e.g. Supabase RPC or Edge Functions; or future API in repo
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({ name: z.string() });

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return new NextResponse('Invalid input', { status: 400 });
  }

  // logic...
  return NextResponse.json({ success: true, data: result });
}
```

## Instructions for Agents

- Design the API interface before implementing.
- Ensure error handling is consistent.
- Consider rate limiting for public or expensive endpoints.
