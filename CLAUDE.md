# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **production-ready CRM and E-commerce platform** for Hải Sản Ngày Mới (Fresh Seafood from Cô Tô Island) built with **Next.js 16** using **Clean/Onion Architecture** principles.

The system includes:
- **Admin CRM**: Complete order, customer, product, and campaign management
- **Multi-platform Integration**: Zalo, Facebook, TikTok, YouTube social media publishing
- **Payment Gateways**: VNPay & ZaloPay with webhook/IPN support
- **Queue System**: BullMQ + Redis for background job processing
- **Cloud Storage**: AWS S3 for image uploads
- **Role-based Access**: Admin, Sales, and Warehouse user roles
- **Real-time Analytics**: Dashboard with business metrics and visualizations

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

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=ClusterName
MONGODB_DB=crm_db

# AWS S3 (Image Storage)
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=haisanngaymoi
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payment Gateways
VNP_HASH_SECRET=your_vnpay_secret
CHECKOUT_SDK_PRIVATE_KEY=your_zalopay_key

# Zalo Integration
ZALO_APP_SECRET=your_app_secret
ZALO_APP_ID=your_app_id
ZALO_OA_ID=your_oa_id

# Queue System
REDIS_URL=redis://default:password@host:port
ENABLE_ORDER_WORKER=true

# Social Media APIs (Optional)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_secret
TIKTOK_CLIENT_KEY=your_tiktok_key
YOUTUBE_API_KEY=your_youtube_key

# Webhook
NGROK_TUNNEL=https://your-ngrok-url.ngrok.io
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/haisan-webhook
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

### Core Framework
- **Framework**: Next.js 16.0.1 (App Router)
- **Runtime**: React 19.2.0
- **TypeScript**: 5.0 (strict mode)

### Backend & Data
- **Database**: MongoDB 6.20.0 (official driver)
- **Queue System**: BullMQ 5.63.0 + Redis 5.9.0
- **Storage**: AWS S3 (@aws-sdk/client-s3 ^3.932.0)
- **Authentication**: bcryptjs 3.0.3 (cookie-based sessions)

### UI & Styling
- **UI Components**: Radix UI primitives (@radix-ui/react-*)
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Icons**: Lucide React 0.552.0
- **Carousel**: embla-carousel-react 8.6.0
- **Utilities**: class-variance-authority, clsx, tailwind-merge

### State Management
- **Client State**: Zustand 5.0.8
- **Server State**: Server Components + Server Actions

### Testing
- **Test Runner**: Vitest 4.0.7
- **UI Testing**: @testing-library/react 16.3.0
- **Environment**: happy-dom 20.0.10
- **Integration**: mongodb-memory-server 10.3.0

### Payment & Integration
- **Payment Gateways**: VNPay, ZaloPay (custom implementations)
- **Social Media**: Facebook Graph API, TikTok API, Zalo OA API, YouTube Data API
- **Webhooks**: n8n integration

## Important Notes

- **Never bypass the layering**: UI → Server Actions → Use Cases → Repositories
- **Repository pattern**: Extend `BaseRepository<T, ID>` - nó tự động quản lý MongoDB client
- **Dependency injection**: Sử dụng `depends.ts` thay vì `lib/container` cho API routes
- **ObjectId handling**: Convert to number/string at repository boundary dựa trên domain entity type
- **ID types**: Category dùng `number`, User có thể dùng `string`, etc.
- **BaseRepository methods**: `getClient()`, `getCollection()`, `convertId()`, `toDomain()`, `toDocument()`
- **Vitest config**: Uses path alias, happy-dom environment, and global test utilities

## Implemented Modules

### ✅ Complete Modules

All modules below are **fully implemented** with domain entities, use cases, repositories, API routes, and UI:

1. **Authentication & Authorization** (`app/(auth)/`, `core/application/usecases/admin-user/`)
   - Cookie-based sessions with bcrypt password hashing
   - Role-based access control (Admin, Sales, Warehouse)
   - User management UI (admin only)
   - 7 use cases: Login, Register, GetCurrentUser, ChangePassword, GetAllUsers, UpdateUser, DeleteUser

2. **Products** (`app/(features)/admin/products/`, `core/application/usecases/product/`)
   - Product catalog with categories
   - Size and color variants
   - AWS S3 image uploads
   - 5 use cases: Filter, GetById, Create, Update, Delete

3. **Orders** (`app/(features)/admin/orders/`, `core/application/usecases/order/`)
   - Full order lifecycle management
   - Payment gateway integration (VNPay, ZaloPay)
   - Status tracking (pending → confirmed → processing → shipping → delivered → completed)
   - 11 use cases: CRUD + Link, PaymentCallback, CheckPaymentStatus, CheckOrderStatus, MacRequest, HandleVNPayIPN

4. **Customers** (`app/(features)/admin/customers/`, `core/application/usecases/customer/`)
   - Multi-platform customer tracking (Zalo, Facebook, TikTok, Telegram, Website)
   - Customer tier system (new, regular, vip, premium)
   - Customer statistics and search
   - 6 use cases: GetAll, GetById, SearchByName, Create, Update, Delete

5. **Categories** (`app/(features)/admin/categories/`, `core/application/usecases/category/`)
   - Product category management
   - Image support
   - 5 use cases: Get, GetById, Create, Update, Delete

6. **Banners** (`app/(features)/admin/banners/`, `core/application/usecases/banner/`)
   - Promotional banner system
   - Image URL management
   - 5 use cases: Get, GetById, Create, Update, Delete

7. **Posts** (`app/(features)/admin/posts/`, `core/application/usecases/post/`)
   - Multi-platform social media content management
   - Content types: post, feed, reel, short, video, story
   - Platform integrations: Facebook, TikTok, Zalo, YouTube
   - Media attachments and engagement metrics
   - 4 use cases: Get, Create, Update, Delete

8. **Campaigns** (`app/(features)/admin/campaigns/`, `core/application/usecases/campaign/`)
   - Marketing campaign management
   - Multi-platform tracking (Facebook, TikTok, Zalo, Shopee)
   - UTM parameters and metrics
   - 6 use cases: GetAll, GetById, GetByStatus, Create, Update, Delete

9. **Stations** (`app/api/stations/`, `core/application/usecases/station/`)
   - Physical location management
   - GPS coordinates and addresses
   - 5 use cases: Get, GetById, Create, Update, Delete

10. **Dashboard** (`app/(features)/admin/dashboard/`)
    - Real-time analytics and KPIs
    - Order status breakdown
    - Revenue tracking
    - Recent activity feed

### Module Organization Pattern

All modules follow this structure:
- **Domain**: `core/domain/[module].ts`
- **Use Cases**: `core/application/usecases/[module]/`
- **Repository**: `infrastructure/repositories/[module]-repo.ts`
- **API Routes**: `app/api/[module]/route.ts` + `depends.ts`
- **UI**: `app/(features)/admin/[module]/page.tsx` + `actions.ts` + `components/`

**Important**: always update current implementation for provided plan when implementing a new feature