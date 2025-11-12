---
trigger: always_on
---

## Project Overview

This is a Next.js 16 frontend application built using **Clean/Onion Architecture** principles. The project demonstrates a full-stack approach with Server Components, Client Components, MongoDB integration, Zustand state management, and Server Actions.

## Architecture

The codebase follows a strict layered architecture with clear separation of concerns:

### Core Layers

1. **Domain Layer** (`core/domain/`)
   - Contains pure business entities and types
   - No dependencies on other layers
   - Example: `post.ts` defines the `Post` entity

2. **Application Layer** (`core/application/`)
   - Contains use cases that orchestrate business logic
   - Depends only on domain layer
   - Use cases accept repository interfaces as dependencies (dependency injection)
   - Structure:
     - `usecases/` - Individual use case functions (get-posts, create-post, update-post, delete-post)
     - `interfaces/` - Interface definitions for repositories

3. **Infrastructure Layer** (`infrastructure/`)
   - Implements data access and external integrations
   - `db/mongo.ts` - MongoDB connection singleton
   - `repositories/` - Concrete implementations of repository interfaces
   - `http/` - HTTP client utilities

4. **UI Layer** (`app/`)
   - Next.js 16 App Router structure
   - Uses `(features)/` folder for route grouping without affecting URLs
   - Each feature contains:
     - `page.tsx` - Server Component that fetches data
     - `actions.ts` - Server Actions for mutations
     - `components/` - Client/Server Components
     - `store/` - Zustand stores for client-side state
     - `__tests__/` - Component and integration tests

### Key Architectural Principles

- **Dependency Inversion**: Use cases depend on abstractions (interfaces), not concrete implementations
- **No API Routes**: Uses Server Actions exclusively for mutations
- **Server Components First**: Fetch data in Server Components, pass to Client Components
- **Zustand for Client State**: Filter state, local UI state managed in Zustand stores
- **Test Coverage**: Each layer has its own tests (domain, use cases, repositories, components)

## Development Commands

```bash
# Install dependencies (run from root)
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Testing
npm test              # Run tests in watch mode
npm run test:ui       # Run tests with Vitest UI
npm run test:cov      # Run tests with coverage report
```

## Environment Variables

Required in `.env.local`:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=ClusterName
MONGODB_DB=database_name
```

## Working with Features

### Adding a New Feature

1. **Create domain entity** in `core/domain/[feature].ts`
2. **Define repository interface** in `core/application/services/[feature]-service.ts`
3. **Create use cases** in `core/application/usecases/` (one file per operation)
4. **Implement repository** in `infrastructure/repositories/[feature]-repo.ts`
5. **Create UI** in `app/(features)/[feature]/`:
   - `page.tsx` - Server Component
   - `actions.ts` - Server Actions with `revalidatePath()`
   - `components/` - React components
   - `store/` - Zustand stores if needed

### Testing Strategy

- **Domain tests**: Pure unit tests for entity validation
- **Use case tests**: Mock repositories using `vi.mock()`
- **Repository tests**: Integration tests using `mongodb-memory-server`
- **Component tests**: Use `@testing-library/react` with `happy-dom`
- All test files in `__tests__/` directories at each layer

### Server Actions Pattern

Server Actions must:
- Be marked with `"use server"`
- Call use cases (never call repositories directly)
- Use `revalidatePath()` or `revalidateTag()` after mutations
- Handle FormData for form submissions

Example:
```typescript
"use server"
import { revalidatePath } from "next/cache"
import { createPostUseCase } from "@/core/application/usecases/create-post"

export async function createPostAction(formData: FormData) {
  const title = formData.get("title")?.toString() || ""
  const body = formData.get("body")?.toString() || ""
  await createPostUseCase({ title, body })
  revalidatePath("/posts")
}
```

## File Organization Conventions

- Use `.ts` for logic/utilities, `.tsx` only for React components
- Path alias `@/` points to the root directory
- Test files named `*.spec.ts` or `*.spec.tsx`
- Client Components must have `"use client"` directive
- Server Actions must have `"use server"` directive

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19.2.0
- **Database**: MongoDB (via official `mongodb` driver)
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Testing**: Vitest + @testing-library/react + happy-dom
- **Type Safety**: TypeScript (strict mode)
- **UI Components**: Radix UI primitives (via shadcn/ui pattern)

## Important Notes

- **Never bypass the layering**: UI → Use Cases → Repositories
- **MongoDB connection**: Always use the singleton from `infrastructure/db/mongo.ts`
- **ObjectId handling**: Convert to string at repository boundary, use strings in domain
- **Vitest config**: Uses path alias, happy-dom environment, and global test utilities
