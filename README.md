# 🧭 Hải Sản Ngày Mới - CRM & E-commerce Platform

**A comprehensive CRM and e-commerce management system for Hải Sản Ngày Mới (Fresh Seafood from Cô Tô Island)**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.0-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.20.0-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

### Business Modules
- **🛒 Order Management**: Full e-commerce order lifecycle with multi-status tracking
- **💳 Payment Integration**: VNPay & ZaloPay with webhook/IPN support
- **👥 Customer Management**: Multi-platform customer tracking (Zalo, Facebook, TikTok, Telegram, Website)
- **📦 Product Catalog**: Product management with categories, variants (sizes, colors), and image uploads
- **📢 Marketing Campaigns**: Multi-platform campaign tracking with UTM parameters and analytics
- **📱 Social Media Marketing**: Multi-platform content publishing (Facebook, TikTok, Zalo, YouTube)
- **🎨 Banner Management**: Promotional banner system
- **🏪 Station Management**: Physical location management
- **📊 Analytics Dashboard**: Real-time business metrics and visualizations
- **👤 Admin Panel**: Role-based access control (Admin, Sales, Warehouse)

### Technical Features
- **🏗️ Clean/Onion Architecture**: Strict layered architecture with dependency inversion
- **⚡ Next.js 16**: App Router with Server Components and Server Actions
- **🔐 Authentication**: Cookie-based session with bcrypt password hashing
- **🎯 Type Safety**: Full TypeScript coverage with strict mode
- **🧪 Testing**: Comprehensive unit, integration, and UI tests with Vitest
- **📦 Queue System**: Background job processing with BullMQ + Redis
- **☁️ Cloud Storage**: AWS S3 integration for image uploads
- **🌐 External APIs**: Zalo Mini App integration (location, phone decoding)
- **🎨 Modern UI**: Radix UI primitives with Tailwind CSS v4

---

## 📁 Cấu trúc thư mục tổng thể

```
.
├─ app/
│  ├─ api/
│  │  ├─ banners/           # CRUD banners + depends.ts
│  │  ├─ orders/            # CRUD orders + payment operations
│  │  │  ├─ [id]/          # Get/Update/Delete order by ID
│  │  │  ├─ callback/       # Payment callback
│  │  │  ├─ link/           # Link order to payment
│  │  │  ├─ mac/            # Generate payment MAC
│  │  │  ├─ status/         # Check payment status
│  │  │  ├─ route.ts        # GET/POST orders
│  │  │  └─ depends.ts      # Consolidated dependencies
│  │  ├─ products/          # CRUD products + depends.ts
│  │  ├─ stations/          # CRUD stations + depends.ts
│  │  ├─ user/              # User management + depends.ts
│  │  ├─ ipn/               # VNPay IPN webhook + depends.ts
│  │  └─ utils/             # Utility APIs (location, phone)
│  │     ├─ location/       # Decode location + depends.ts
│  │     └─ phone/          # Decode phone + depends.ts
│  ├─ (features)/
│  │  └─ posts/             # Demo posts feature (Server Components + Actions)
│  │     ├─ page.tsx        # Server Component
│  │     ├─ actions.ts      # Server Actions
│  │     └─ components/     # Client Components
│  └─ (policies)/
│     ├─ cookies/
│     ├─ privacy/
│     └─ terms/
│
├─ core/
│  ├─ domain/
│  │  ├─ banner.ts
│  │  ├─ category.ts
│  │  ├─ order.ts
│  │  ├─ post.ts
│  │  ├─ station.ts
│  │  ├─ user.ts
│  │  └─ __tests__/
│  ├─ application/
│  │   ├─ interfaces/
│  │   │  ├─ location-service.ts
│  │   │  ├─ order-service.ts
│  │   │  ├─ payment-gateway.ts
│  │   │  ├─ phone-service.ts
│  │   │  ├─ queue-service.ts
│  │   │  └─ vnpay-gateway.ts
│  │   └─ usecases/
│  │       ├─ banner/        # get-banners, create-banner, update-banner, delete-banner
│  │       ├─ location/      # decode-location (Zalo API)
│  │       ├─ order/         # CRUD + payment operations
│  │       │  ├─ get-orders.ts
│  │       │  ├─ create-order.ts
│  │       │  ├─ get-order-by-id.ts
│  │       │  ├─ update-order.ts
│  │       │  ├─ delete-order.ts
│  │       │  ├─ link-order.ts           # Link order to payment
│  │       │  ├─ payment-callback.ts     # Handle payment callback
│  │       │  ├─ mac-request.ts          # Generate MAC for payment
│  │       │  └─ check-order-status.ts   # Check payment status
│  │       ├─ phone/         # decode-phone (Zalo API)
│  │       ├─ post/          # Demo: CRUD posts
│  │       ├─ product/       # get-products, create-product, update-product, delete-product
│  │       ├─ station/       # get-stations, create-station, update-station, delete-station
│  │       ├─ user/          # upsert-user, get-user-by-id
│  │       └─ vnpay/         # handle-vnpay-ipn
│
├─ infrastructure/
│  ├─ db/
│  │  ├─ mongo.ts
│  │  └─ __tests__/
│  ├─ gateways/
│  │  ├─ zalopay-gateway.ts
│  │  ├─ zalo-location-gateway.ts
│  │  ├─ zalo-phone-gateway.ts
│  │  ├─ vnpay-gateway.ts
│  │  └─ __tests__/
│  ├─ queue/
│  │  ├─ bullmq-adapter.ts
│  │  ├─ order-worker.ts
│  │  └─ __tests__/
│  └─ repositories/
│     ├─ base-repo.ts        # Base repository class with MongoDB client
│     ├─ banner-repo.ts
│     ├─ order-repo.ts
│     ├─ post-repo.ts
│     ├─ product-repo.ts
│     ├─ station-repo.ts
│     └─ user-repo.ts
│
├─ lib/
│  ├─ webhook.ts            # Webhook utilities
│  └─ utils.ts              # Common utilities
│
├─ @shared/
│  └─ ui/
│     ├─ button.tsx
│     ├─ carousel.tsx
│     └─ tabs.tsx
│
├─ __tests__/
│  ├─ integration/
│  │  ├─ check-out.test.ts
│  │  ├─ location.test.ts
│  │  ├─ payment-worker.test.ts
│  │  └─ ...
│  └─ unit/
│
└─ vitest.config.ts
```

---

## ⚙️ Quick Start

### Prerequisites
- Node.js 20+ and npm
- MongoDB Atlas account (or local MongoDB instance)
- Redis instance (Upstash or local)
- AWS S3 bucket (for image uploads)
- Optional: VNPay/ZaloPay merchant accounts

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/haisanngaymoi-crm.git
cd haisanngaymoi-crm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Seed initial admin user
npm run seed-admin
# Default: admin@haisanngaymoi.com / Admin@123456

# Run development server
npm run dev
```

Visit `http://localhost:3000/crm/login` to access the admin panel.

### Environment Variables

Create `.env.local` with the following variables:

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
ZALO_APP_SECRET=your_zalo_app_secret
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

---

## 🧱 3. Domain Layer - Core Entities

### **Order Entity**
- **Định nghĩa**: Đại diện cho đơn hàng trong hệ thống e-commerce
- **Mục đích**: Quản lý thông tin đơn hàng, thanh toán, giao hàng
- **File**: `core/domain/order.ts`

### **Banner Entity**
- **Định nghĩa**: Đại diện cho banner quảng cáo trên website
- **Mục đích**: Hiển thị thông tin quảng cáo, khuyến mãi
- **File**: `core/domain/banner.ts`

### **Category Entity**
- **Định nghĩa**: Đại diện cho danh mục sản phẩm
- **Mục đích**: Phân loại và tổ chức sản phẩm
- **File**: `core/domain/category.ts`

### **Product Entity**
- **Định nghĩa**: Đại diện cho sản phẩm trong catalog
- **Mục đích**: Lưu trữ thông tin chi tiết sản phẩm
- **File**: `core/domain/product.ts`

### **Station Entity**
- **Định nghĩa**: Đại diện cho điểm bán/trạm trong hệ thống
- **Mục đích**: Quản lý các địa điểm kinh doanh
- **File**: `core/domain/station.ts`

### **User Entity**
- **Định nghĩa**: Đại diện cho người dùng hệ thống
- **Mục đích**: Quản lý thông tin tài khoản và profile
- **File**: `core/domain/user.ts`

### **Post Entity (Demo)**
- **Định nghĩa**: Entity demo cho bài viết blog
- **Mục đích**: Minh họa Clean Architecture pattern
- **File**: `core/domain/post.ts`

---

## ⚙️ 4. Application Layer

### **Use Cases** (Business Logic):

#### **Order Management** (`core/application/usecases/order/`)
All order-related functionality including payment operations:
- **CRUD**: `get-orders.ts`, `create-order.ts`, `get-order-by-id.ts`, `update-order.ts`, `delete-order.ts`
- **Payment**: `link-order.ts`, `payment-callback.ts`, `mac-request.ts`, `check-order-status.ts`
- Note: Payment is part of order lifecycle, not a separate module

#### **External Integrations**:
- `decode-location.ts` - Decode location from Zalo
- `decode-phone.ts` - Decode phone from Zalo
- `handle-vnpay-ipn.ts` - Process VNPay IPN

#### **CRUD Operations**:
- **Banner**: `get-banners`, `create-banner`, `update-banner`, `delete-banner`
- **Product**: `get-products`, `create-product`, `update-product`, `delete-product`
- **Station**: `get-stations`, `create-station`, `update-station`, `delete-station`
- **User**: `upsert-user`, `get-user-by-id`
- **Post**: `get-posts`, `create-post`, `update-post`, `delete-post`

### **Interfaces** (Dependency Inversion):
```typescript
// core/application/interfaces/payment-gateway.ts
export interface PaymentGateway {
  processPaymentUpdate(orderId: number, sdkOrderId: string, miniAppId?: string): Promise<void>;
}

// core/application/interfaces/order-service.ts
export interface OrderService {
  getById(id: number): Promise<Order | null>;
  update(id: number, data: Partial<Order>): Promise<Order | null>;
  // ... more methods
}
```

---

## 🏗️ 5. Infrastructure Layer

### **Payment Gateways**:

#### **ZaloPay Gateway** (`infrastructure/gateways/zalopay-gateway.ts`)
```typescript
export class ZaloPayGateway implements PaymentGateway {
  async processPaymentUpdate(orderId: number, sdkOrderId: string, miniAppId?: string): Promise<void> {
    // Check payment status via ZaloPay API
    // Update order payment status in database
  }
}
```
- **Mục đích**: Xử lý thanh toán qua ZaloPay
- **Chức năng**: Query payment status, update order status

#### **VNPay Gateway** (`infrastructure/gateways/vnpay-gateway.ts`)
```typescript
export class VnpayGatewayImpl implements VnpayGateway {
  async validateSignature(params: VnpayIpnParams): Promise<boolean> {
    // HMAC SHA512 signature validation
  }

  parsePaymentResult(params: VnpayIpnParams): VnpayIpnResult {
    // Parse payment response from VNPay
  }
}
```
- **Mục đích**: Xử lý thanh toán qua VNPay
- **Chức năng**: IPN signature validation, payment result parsing

### **External API Integrations**:

#### **Zalo Location Gateway** (`infrastructure/gateways/zalo-location-gateway.ts`)
```typescript
export class ZaloLocationGateway implements LocationService {
  async decodeLocation(token: string, accessToken: string): Promise<{location: {lat: number, lng: number}, address: string | null}> {
    // Call Zalo Open API for location data
    // Perform reverse geocoding with Nominatim
    // Return coordinates and address
  }
}
```
- **Mục đích**: Decode location từ Zalo Mini App tokens
- **Chức năng**: Zalo API call + reverse geocoding

#### **Zalo Phone Gateway** (`infrastructure/gateways/zalo-phone-gateway.ts`)
```typescript
export class ZaloPhoneGateway implements PhoneService {
  async decodePhone(token: string, accessToken: string): Promise<string> {
    // Call Zalo Open API for phone number
    // Parse and return phone number
  }
}
```
- **Mục đích**: Decode phone number từ Zalo Mini App tokens
- **Chức năng**: Zalo API call, phone number extraction

### **Queue System**:

#### **BullMQ Adapter** (`infrastructure/queue/bullmq-adapter.ts`)
```typescript
export class BullMQAdapter implements QueueService {
  async addJob(queueName: string, jobName: string, data: any, options: { delay?: number }): Promise<string> {
    // Add job to Redis queue with BullMQ
  }
}
```
- **Mục đích**: Background job processing với Redis
- **Chức năng**: Queue management, delayed job execution

#### **Order Worker** (`infrastructure/queue/order-worker.ts`)
```typescript
export const createOrderWorker = (paymentGateway: PaymentGateway) => {
  // BullMQ Worker processing payment status check jobs
  // Calls payment gateway to update order status
};
```
- **Mục đích**: Process background jobs cho order payments
- **Chức năng**: Payment status checking, order updates

### **Data Access Layer**:

#### **MongoDB Repositories** (`infrastructure/repositories/`)
All repositories extend `BaseRepository<T, ID>`:
```typescript
// infrastructure/repositories/base-repo.ts
export abstract class BaseRepository<T, ID> {
  protected abstract collectionName: string;
  protected clientPromise = mongoClientPromise;

  protected async getClient(): Promise<MongoClient> { /* ... */ }
  protected async getCollection(): Promise<Collection<Document>> { /* ... */ }
  protected abstract convertId(id: ID): ObjectId | ID;
  protected abstract toDomain(doc: Document): T;
  protected abstract toDocument(entity: T | Partial<T>): Document;
}

// infrastructure/repositories/order-repo.ts
export class OrderRepository extends BaseRepository<Order, number> implements OrderService {
  protected collectionName = "orders";

  async create(payload: OrderPayload): Promise<Order> {
    const collection = await this.getCollection();
    // Implementation with automatic client management
  }
}
```
- **Mục đích**: Data access abstraction with automatic MongoDB client management
- **Chức năng**: CRUD operations for all entities with type-safe ID conversion

---

## 🔗 6. Dependency Injection Pattern

### **Factory Functions Pattern** (`depends.ts`)
Each API module has a `depends.ts` file that creates use cases with their dependencies:

```typescript
// app/api/orders/depends.ts
import { OrderRepository } from '@/infrastructure/repositories/order-repo';
import { BullMQAdapter } from '@/infrastructure/queue/bullmq-adapter';
import { ZaloPayGateway } from '@/infrastructure/gateways/zalopay-gateway';
import { CreateOrderUseCase } from '@/core/application/usecases/order/create-order';
import { LinkOrderUseCase } from '@/core/application/usecases/order/link-order';

// Repository factory
const createOrderRepository = async (): Promise<OrderService> => {
  return new OrderRepository();
};

// Use case factories
export const createOrderUseCase = async () => {
  const service = await createOrderRepository();
  return new CreateOrderUseCase(service);
};

export const linkOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  const queueService = new BullMQAdapter();
  return new LinkOrderUseCase(orderService, queueService);
};
```

### **Worker Initialization** (`instrumentation.node.ts`)
Background workers are initialized at startup:
```typescript
// instrumentation.node.ts
export async function register() {
  if (process.env.ENABLE_ORDER_WORKER === 'true') {
    const { ZaloPayGateway } = await import('@/infrastructure/gateways/zalopay-gateway');
    const { createOrderWorker } = await import('@/infrastructure/queue/order-worker');
    const paymentGateway = new ZaloPayGateway();
    createOrderWorker(paymentGateway);
  }
}
```

**Key Principles**:
- ✅ Single `depends.ts` file per API module
- ✅ Factory functions create fresh instances for each request
- ✅ No global singleton container
- ✅ Type-safe dependency injection

---

## 🌐 7. API Routes with Clean Architecture

### **Order Management** (CRUD + Payment):
```typescript
// app/api/orders/route.ts
import { getOrdersUseCase, createOrderUseCase } from "./depends";

export async function GET(request: NextRequest) {
  const useCase = await getOrdersUseCase();
  const result = await useCase.execute({ status, zaloUserId });
  return NextResponse.json(result.orders);
}

export async function POST(request: NextRequest) {
  const useCase = await createOrderUseCase();
  const result = await useCase.execute(await request.json());
  return NextResponse.json(result.order, { status: 201 });
}
```

### **Payment Operations** (Consolidated in Orders Module):
```typescript
// app/api/orders/callback/route.ts
import { paymentCallbackUseCase } from "../depends";

export async function POST(request: NextRequest) {
  const useCase = await paymentCallbackUseCase();
  const result = await useCase.execute(await request.json());
  return NextResponse.json({
    returnCode: result.returnCode,
    returnMessage: result.returnMessage
  });
}
```

### **Webhook Handling** (VNPay IPN):
```typescript
// app/api/ipn/route.ts
import { handleVnpayIpnUseCase } from "./depends";

export async function POST(request: NextRequest) {
  const useCase = await handleVnpayIpnUseCase();
  const { result, order } = await useCase.execute({ body: await request.json() });

  if (result.isSuccess && order) {
    void notifyOrderWebhook(order);
  }

  return NextResponse.json({
    returnCode: result.returnCode,
    returnMessage: result.returnMessage
  });
}
```

### **External API Integration**:
```typescript
// app/api/utils/location/route.ts
import { decodeLocationUseCase } from "./depends";

export async function POST(request: NextRequest) {
  const useCase = await decodeLocationUseCase();
  const result = await useCase.execute(await request.json());
  return NextResponse.json(result);
}
```

### **Server Actions for UI** (Alternative Pattern):
```typescript
// app/(features)/posts/actions.ts
"use server"
import { revalidatePath } from "next/cache";
import { createPostUseCase } from "@/app/api/posts/depends";

export async function createPostAction(formData: FormData) {
  const useCase = await createPostUseCase();
  await useCase.execute({
    title: formData.get("title")?.toString() || "",
    content: formData.get("content")?.toString() || ""
  });
  revalidatePath("/posts");
}
```

**Key Patterns**:
- ✅ API Routes for external integrations (webhooks, third-party APIs)
- ✅ Server Actions for UI-driven mutations (forms, user interactions)
- ✅ Both patterns call use cases from `depends.ts`
- ✅ Never call repositories directly from routes/actions

---

## 📦 8. Module Organization

### **Order & Payment Module Consolidation**
All order-related functionality (CRUD + checkout/payment) is in the **orders** module:

```
app/api/orders/
├── route.ts           # GET (list), POST (create)
├── [id]/route.ts      # GET (by ID), PATCH (update), DELETE
├── callback/route.ts  # Payment callback
├── link/route.ts      # Link order to payment
├── mac/route.ts       # Generate payment MAC
├── status/route.ts    # Check payment status
└── depends.ts         # ✅ Single consolidated dependencies file
```

**Principles**:
- ✅ Payment is part of the order lifecycle
- ✅ Single `depends.ts` manages all order/payment use cases
- ❌ Do NOT create separate `checkout/` or `payment/` modules

### **BaseRepository Pattern**
All repositories extend `BaseRepository<T, ID>` for consistent data access:

```typescript
// Automatic MongoDB client management
export class ProductRepository extends BaseRepository<Product, number> {
  protected collectionName = "products";
  // BaseRepository handles getClient(), getCollection(), etc.
}
```

**Benefits**:
- ✅ Automatic MongoDB client lifecycle
- ✅ Type-safe ID conversion (ObjectId ↔ number/string)
- ✅ Consistent domain/document mapping
- ✅ Less boilerplate code

---

## 🎯 9. Key Features Implemented

| Feature | Implementation | Description |
|---------|----------------|-------------|
| **Payment Processing** | ZaloPay + VNPay | Multiple payment gateways |
| **Webhook Handling** | VNPay IPN | Secure payment notifications |
| **Queue System** | BullMQ + Redis | Background job processing |
| **External APIs** | Zalo Location/Phone | Social login integration |
| **CRUD Operations** | All entities | Full data management |
| **Clean Architecture** | Dependency Injection | Testable, maintainable code |
| **Error Handling** | Structured responses | Proper HTTP status codes |
| **Type Safety** | TypeScript | Full type coverage |

---

## 🧪 10. Testing Strategy

### **Unit Tests**:
```typescript
// Domain tests
describe("Order", () => {
  it("validates order data", () => { /* ... */ });
});

// Use case tests
describe("CreateOrderUseCase", () => {
  it("calls repository correctly", async () => {
    vi.mock("@/infrastructure/repositories/order-repo");
    // ...
  });
});
```

### **Integration Tests**:
```typescript
// Repository integration with MongoDB Memory Server
describe("OrderRepository", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
  });

  it("creates and retrieves orders", async () => {
    // Test actual database operations
  });
});
```

### **API Integration Tests**:
```typescript
// Test complete API flows
describe("Order API", () => {
  it("creates order via API", async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    expect(response.status).toBe(201);
  });
});
```

---

## 🚀 Development Scripts

```bash
# Development
npm run dev                 # Start dev server (http://localhost:3000)

# Production
npm run build              # Build for production
npm start                  # Start production server

# Testing
npm test                   # Run tests in watch mode
npm run test:ui            # Open Vitest UI
npm run test:unit          # Run unit tests once
npm run test:cov           # Generate coverage report
npm run test:integration   # Run integration tests

# Database
npm run seed-admin         # Create initial admin user

# Code Quality
npm run lint               # Run ESLint
```

## 📊 Admin Panel Overview

After logging in at `/crm/login`, you'll have access to:

### Dashboard (`/crm/dashboard`)
- **KPI Cards**: Total revenue, orders, customers, products
- **Charts**: Order status breakdown, payment analytics
- **Recent Activity**: Last 5 orders with details
- **Quick Actions**: Navigate to all modules

### Module Pages
- **Products** (`/crm/products`): Product catalog with variants and images
- **Orders** (`/crm/orders`): Order management with status tracking
- **Customers** (`/crm/customers`): Customer database with platform tracking
- **Categories** (`/crm/categories`): Product category management
- **Banners** (`/crm/banners`): Promotional banner system
- **Posts** (`/crm/posts`): Social media content management
- **Campaigns** (`/crm/campaigns`): Marketing campaign tracking
- **Users** (`/crm/users`): Admin user management (Admin only)

### Role-Based Access
- **Admin**: Full access to all features
- **Sales**: View/manage orders, customers, products
- **Warehouse**: Update order status, view inventory

---

## 🔄 12. Migration from Container to Factory Pattern

### **Before (lib/container.ts - Deprecated)**
```typescript
// ❌ Global singleton container
import { OrderRepository } from '@/infrastructure/repositories/order-repo';

export const orderService: OrderService = orderRepository;
export const linkOrderUseCase = new LinkOrderUseCase(orderService, queueService);

// API routes imported from container
import { linkOrderUseCase } from '@/lib/container';
```

**Problems**:
- ❌ Global state causes issues in serverless environments
- ❌ Hard to test (need to mock entire container)
- ❌ All dependencies initialized at startup
- ❌ Difficult to swap implementations per request

### **After (depends.ts - Current)**
```typescript
// ✅ Factory functions per module
// app/api/orders/depends.ts
const createOrderRepository = async (): Promise<OrderService> => {
  return new OrderRepository();
};

export const linkOrderUseCase = async () => {
  const orderService = await createOrderRepository();
  const queueService = new BullMQAdapter();
  return new LinkOrderUseCase(orderService, queueService);
};

// API routes call factory functions
import { linkOrderUseCase } from "./depends";
const useCase = await linkOrderUseCase();
```

**Benefits**:
- ✅ Fresh instances per request (serverless-friendly)
- ✅ Easy to test (mock individual dependencies)
- ✅ Lazy initialization (only create what's needed)
- ✅ Per-module organization (better code locality)

---

## 📐 13. Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (Next.js App Router)                              │
├─────────────────────────────────────────────────────────────┤
│  • Server Components: Fetch data, pass to Client Components │
│  • Client Components: User interactions, Zustand state      │
│  • Server Actions: UI mutations with revalidation           │
│  • API Routes: External webhooks, third-party integrations  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Dependency Injection (depends.ts)                          │
├─────────────────────────────────────────────────────────────┤
│  • Factory functions create use cases with dependencies     │
│  • Fresh instances per request (no global state)            │
│  • Type-safe dependency injection                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Application Layer (Use Cases)                              │
├─────────────────────────────────────────────────────────────┤
│  • Business logic orchestration                             │
│  • Request/Response interfaces                              │
│  • Domain validation                                        │
│  • Depends on repository interfaces (not implementations)   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Domain Layer (Entities)                                    │
├─────────────────────────────────────────────────────────────┤
│  • Pure business entities and types                         │
│  • Validation rules                                         │
│  • No dependencies on other layers                          │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│  Infrastructure Layer (Repositories, Gateways)              │
├─────────────────────────────────────────────────────────────┤
│  • MongoDB repositories (extend BaseRepository)             │
│  • Payment gateways (ZaloPay, VNPay)                        │
│  • External APIs (Zalo Location/Phone)                      │
│  • Queue system (BullMQ + Redis)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

- **[PRD/Admin.md](PRD/Admin.md)** - Complete product requirements and implementation status
- **[CLAUDE.md](CLAUDE.md)** - Developer guide for working with this codebase
- **[AUTH_README.md](AUTH_README.md)** - Authentication system documentation
- **[docs/S3_INTEGRATION_GUIDE.md](docs/S3_INTEGRATION_GUIDE.md)** - AWS S3 integration guide
- **[docs/DOMAIN_MIGRATION_GUIDE.md](docs/DOMAIN_MIGRATION_GUIDE.md)** - Domain entity migration guide

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Clean Architecture principles
- Write tests for all new features
- Use TypeScript strict mode
- Follow the established code patterns
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styled with [Tailwind CSS v4](https://tailwindcss.com/)

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Contact: admin@haisanngaymoi.com

---

## ✅ Technology Stack Summary

| Thành phần | Công nghệ | Vai trò |
|-----------|-----------|---------|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework |
| **Architecture** | Clean/Onion Architecture | Separation of concerns |
| **Dependency Injection** | Factory Pattern (`depends.ts`) | Type-safe, per-request instances |
| **Data Access** | BaseRepository<T, ID> | Automatic MongoDB client management |
| **Database** | MongoDB 6.20.0 | Document-based data persistence |
| **Payment** | VNPay + ZaloPay | Multi-gateway payment processing |
| **Queue** | BullMQ 5.63.0 + Redis | Background job processing |
| **External APIs** | Zalo Open API | Social media integration |
| **Storage** | AWS S3 | Cloud file storage |
| **State** | Zustand 5.0.8 | Client state management |
| **UI Components** | Radix UI + Tailwind CSS v4 | Accessible, customizable components |
| **Testing** | Vitest 4.0.7 + RTL + MongoDB Memory Server | Comprehensive testing suite |
| **Type Safety** | TypeScript 5.0 (strict) | Full type coverage |
| **Authentication** | Cookie-based + bcrypt | Secure session management |

### **🎯 Key Architectural Decisions**

1. **Consolidated Modules**: Payment operations are part of order module (not separate)
2. **Factory Pattern**: `depends.ts` files replace global DI container for serverless compatibility
3. **BaseRepository**: All repositories extend base class for MongoDB client management
4. **Hybrid Approach**: API Routes for webhooks + Server Actions for UI mutations
5. **Domain-First**: Payload interfaces extend from domain entities (single source of truth)
6. **Class-based Use Cases**: Request/Response interfaces with dependency injection
7. **Multi-platform**: Unified customer entity across Zalo, Facebook, TikTok, Telegram, Website
8. **Role-based Access**: Granular permissions (Admin, Sales, Warehouse)

---

**🎉 A production-ready CRM & E-commerce platform built with Clean Architecture principles!**

**Made with ❤️ for Hải Sản Ngày Mới - Fresh Seafood from Cô Tô Island**
