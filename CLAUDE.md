# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
   - Handles business validation (domain rules, permissions)
   - Structure:
     - `usecases/` - Individual use case classes with Request/Response interfaces
     - `interfaces/` - Interface definitions for repositories with payload types extending domain

3. **Infrastructure Layer** (`infrastructure/`)
   - Implements data access and external integrations
   - `db/mongo.ts` - MongoDB connection singleton
   - `repositories/` - Concrete implementations of repository interfaces
   - Handles data integrity validation (required fields, schema compliance)
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

1. **Create domain entity** in `core/domain/[feature].ts` - Define the business entity with validation logic
2. **Define repository interface** in `core/application/interfaces/[feature]-service.ts` - Create service interface with payload types that extend from domain (`extends Partial<DomainEntity>`)
3. **Create use cases** in `core/application/usecases/[feature]/` (one file per operation, class-based pattern) - Implement use case classes with Request/Response interfaces that extend payload types
4. **Implement repository** in `infrastructure/repositories/[feature]-repo.ts` - Create concrete repository extending BaseRepository:
   ```typescript
   export class FeatureRepository extends BaseRepository<Feature, number> implements FeatureService {
     protected collectionName = "features";
     
     // BaseRepository tự động getClient() từ clientPromise
   }
   ```
5. **Create dependencies** in `app/api/[feature]/depends.ts` - Factory functions for use cases:
   ```typescript
   import { FeatureRepository } from '@/infrastructure/repositories/feature-repo';
   import { CreateFeatureUseCase } from '@/core/application/usecases/feature/create-feature';
   
   const createFeatureRepository = async (): Promise<FeatureService> => {
     return new FeatureRepository();
   };
   
   export const createFeatureUseCase = async () => {
     const service = await createFeatureRepository();
     return new CreateFeatureUseCase(service);
   };
   ```
6. **Create API routes** in `app/api/[feature]/route.ts` - Use depends.ts instead of container:
   ```typescript
   import { createFeatureUseCase } from "./depends";
   
   export async function POST(request: NextRequest) {
     const useCase = await createFeatureUseCase();
     const result = await useCase.execute(await request.json());
     return NextResponse.json(result.feature);
   }
   ```
7. **Create UI** in `app/(features)/[feature]/`:
   - `page.tsx` - Server Component that fetches data
   - `actions.ts` - Server Actions calling use cases from depends.ts
   - `components/` - React components
   - `store/` - Zustand stores if needed
   - **Requirement**: Use https://ui.shadcn.com/docs/components when creating UI components

### Testing Strategy

- **Domain tests**: Pure unit tests for entity validation
- **Use case tests**: Mock repositories using `vi.mock()`
- **Repository tests**: Integration tests using `mongodb-memory-server`
- **Component tests**: Use `@testing-library/react` with `happy-dom`
- All test files in `__tests__/` directories at each layer

### Server Actions Pattern

Server Actions must:
- Be marked with `"use server"`
- Call use cases from `depends.ts` (never call repositories directly)
- Use `revalidatePath()` or `revalidateTag()` after mutations
- Handle FormData for form submissions

Example:
```typescript
"use server"
import { revalidatePath } from "next/cache"
import { createCategoryUseCase } from "../../api/categories/depends"

export async function createCategoryAction(formData: FormData) {
  const useCase = await createCategoryUseCase()
  await useCase.execute({
    name: formData.get("name")?.toString() || "",
    image: formData.get("image")?.toString() || ""
  })
  revalidatePath("/categories")
}
```

## Use Case Pattern

Use cases must follow the **class-based architecture pattern** with Request/Response interfaces:

### ✅ Correct Pattern (Class-based):
```typescript
// core/application/interfaces/feature-service.ts
export interface FeaturePayload extends Partial<Feature> {}

export interface FeatureService {
  create(payload: FeaturePayload): Promise<Feature>
  update(payload: FeaturePayload): Promise<Feature | null>
}

// core/application/usecases/feature/create-feature.ts
import type { FeatureService, FeaturePayload } from "@/core/application/interfaces/feature-service"

export interface CreateFeatureRequest extends FeaturePayload {}

export interface CreateFeatureResponse {
  feature: Feature
}

export class CreateFeatureUseCase {
  constructor(private featureService: FeatureService) {}

  async execute(request: CreateFeatureRequest): Promise<CreateFeatureResponse> {
    // Business logic and validation here
    const feature = await this.featureService.create(request);
    return { feature };
  }
}
```

### Key Requirements:
- **Domain as Single Source of Truth**: Payload interfaces must extend from domain entities (`extends Partial<DomainEntity>`)
- **Class-based architecture** with constructor injection
- **Request/Response interfaces** for type safety
- **Single responsibility** per use case
- **Validation** at use case level (call domain validation)
- **Error handling** with descriptive messages

Example:
```typescript
// ✅ CORRECT: Use case with validation
export interface CreateCustomerRequest extends CustomerPayload {}

export interface CreateCustomerResponse {
  customer: Customer
}

export class CreateCustomerUseCase {
  constructor(private customerService: CustomerService) {}

  async execute(request: CreateCustomerRequest): Promise<CreateCustomerResponse> {
    // Validate at use case level
    const errors = validateCustomer(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const customer = await this.customerService.create(request);
    return { customer };
  }
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

- **Never bypass the layering**: UI → Server Actions → Use Cases → Repositories
- **Repository pattern**: Extend `BaseRepository<T, ID>` - nó tự động quản lý MongoDB client
- **Dependency injection**: Sử dụng `depends.ts` thay vì `lib/container` cho API routes
- **ObjectId handling**: Convert to number/string at repository boundary dựa trên domain entity type
- **ID types**: Category dùng `number`, User có thể dùng `string`, etc.
- **BaseRepository methods**: `getClient()`, `getCollection()`, `convertId()`, `toDomain()`, `toDocument()`
- **Vitest config**: Uses path alias, happy-dom environment, and global test utilities
