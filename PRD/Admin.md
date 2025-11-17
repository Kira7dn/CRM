Dưới đây là **PRD hoàn chỉnh – Admin Page "Ngày Mới – Cô Tô"** được viết theo chuẩn product document: gồm *mục tiêu, user role, luồng nghiệp vụ, mô tả chi tiết từng module, yêu cầu chức năng – phi chức năng, dữ liệu, API gợi ý, permission, kiến trúc kỹ thuật…*

Document này tuân thủ **Clean/Onion Architecture** của dự án và phản ánh đúng các module đã được implement.

---

# 🧭 **PRODUCT REQUIREMENT DOCUMENT (PRD)**

# **Admin Dashboard – Hải sản Ngày Mới – Cô Tô**

**Version:** 2.0
**Last Updated:** 2025-11-17
**Status:** In Development

---

## **1. Mục tiêu sản phẩm**

Xây dựng hệ thống Admin CRM để:

* **Quản lý toàn bộ tài nguyên**: sản phẩm, danh mục, banner, bài viết, đơn hàng, khách hàng, chi nhánh.
* **Tích hợp thanh toán**: Zalo Payment, VNPay với xử lý callback và IPN.
* **Đảm bảo bảo mật**: Phân quyền rõ ràng theo vai trò *Admin – Sale – Warehouse*.
* **Mở rộng dễ dàng**: Hỗ trợ thêm chiến dịch marketing, affiliate, quản lý kho, analytics.

---

## **2. User Role (Quyền người dùng)**

| Role          | Quyền                                                                     | Status          |
| ------------- | ------------------------------------------------------------------------- | --------------- |
| **Admin**     | Toàn quyền: CRUD mọi module, phân quyền thành viên, cài đặt hệ thống      | ✅ Implemented |
| **Sale**      | Xem đơn hàng, khách hàng, sản phẩm. Tạo đơn hàng mới.                     | ✅ Implemented |
| **Warehouse** | Xem & chỉnh sửa tồn kho, trạng thái đơn hàng (shipping/completed)         | ✅ Implemented |

> **✅ COMPLETE:** Authentication & authorization system fully implemented with RBAC, session management, and route protection.

---

## **3. Kiến trúc Technical Stack**

### **3.1 Clean/Onion Architecture**

```
┌─────────────────────────────────────────┐
│         UI Layer (app/)                 │
│  - Server Components (page.tsx)        │
│  - Client Components (components/)     │
│  - Server Actions (actions.ts)         │
│  - Zustand Stores (store/)             │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│    Application Layer (core/application/)│
│  - Use Cases (usecases/)               │
│  - Service Interfaces (interfaces/)    │
│  - Request/Response DTOs               │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│   Infrastructure Layer (infrastructure/)│
│  - Repositories (repositories/)        │
│  - MongoDB Connection (db/mongo.ts)    │
│  - HTTP Clients (http/)                │
└────────────┬────────────────────────────┘
             │
┌────────────▼────────────────────────────┐
│      Domain Layer (core/domain/)       │
│  - Entities (pure business logic)      │
│  - Validation Rules                    │
│  - Type Definitions                    │
└─────────────────────────────────────────┘
```

### **3.2 Technology Stack**

- **Framework:** Next.js 16 (App Router) + React 19.2.0
- **Database:** MongoDB 6.20.0
- **State Management:** Zustand 5.0.8
- **UI Components:** Radix UI (shadcn/ui pattern)
- **Styling:** Tailwind CSS v4
- **Queue/Jobs:** BullMQ 5.63.0 + Redis 5.9.0
- **Payment:** Zalo Payment SDK + VNPay Gateway
- **Testing:** Vitest 4.0.7 + @testing-library/react
- **Icons:** Lucide React 0.552.0

---

## **4. Modules Overview & Implementation Status**

| Module         | Domain | Use Cases | Repository | API Routes | UI Page | Status |
| -------------- | ------ | --------- | ---------- | ---------- | ------- | ------ |
| **Auth**       | ✅     | ✅ (7)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Categories** | ✅     | ✅ (5)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Posts**      | ✅     | ✅ (4)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Products**   | ✅     | ✅ (5)    | ✅         | ✅         | 🔴     | 🟡 **Backend Ready** |
| **Orders**     | ✅     | ✅ (9)    | ✅         | ✅         | 🔴     | 🟡 **Backend Ready** |
| **Customers**  | ✅     | ✅ (6)    | ✅         | ✅         | 🔴     | 🟡 **Backend Ready** |
| **Banners**    | ✅     | ✅ (5)    | ✅         | ✅         | 🔴     | 🟡 **Backend Ready** |
| **Stations**   | ✅     | ✅ (5)    | ✅         | ✅         | 🔴     | 🟡 **Backend Ready** |
| **Users**      | ✅     | ✅ (2)    | ✅         | ✅         | 🔴     | 🟡 **API Only** |
| **Campaigns**  | 🔴     | 🔴        | 🔴         | 🔴         | 🔴     | 🔴 **Not Started** |
| **Dashboard**  | N/A    | 🔴        | N/A        | 🔴         | 🔴     | 🔴 **Not Started** |

**Legend:**
- ✅ Implemented
- 🟡 Partially Implemented
- 🔴 Not Implemented
- N/A: Not Applicable

---

# 🔥 **5. Chi tiết từng Module**

---

## **5.0 ✅ Authentication & Authorization Module**

### **Status:** ✅ **COMPLETE** (Backend + UI)

> ✅ **Phase 1 Complete**: Full authentication system implemented with RBAC, session management, and route protection.

### **5.0.1 Implementation Details**

**Domain Entity:** [core/domain/admin-user.ts](core/domain/admin-user.ts)
```typescript
interface AdminUser {
  id: string          // MongoDB ObjectId as string
  email: string
  passwordHash: string
  name: string
  role: "admin" | "sale" | "warehouse"
  status: "active" | "inactive"
  avatar?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** [core/application/usecases/admin-user/](core/application/usecases/admin-user/)
1. ✅ `LoginUseCase` - Xác thực email/password với bcrypt
2. ✅ `RegisterAdminUserUseCase` - Tạo tài khoản (admin only)
3. ✅ `GetCurrentUserUseCase` - Lấy thông tin user hiện tại
4. ✅ `ChangePasswordUseCase` - Đổi mật khẩu
5. ✅ `GetAllUsersUseCase` - List users với filter
6. ✅ `UpdateAdminUserUseCase` - Cập nhật user
7. ✅ `DeleteAdminUserUseCase` - Xóa user (admin only)

**Repository:** [infrastructure/repositories/admin-user-repo.ts](infrastructure/repositories/admin-user-repo.ts)
- Extends `BaseRepository<AdminUser, string>`
- Password hashing với bcrypt (salt rounds = 10)
- Methods: CRUD + verifyCredentials(), changePassword(), search/filter

**API Endpoints:** [app/api/auth/](app/api/auth/)
- ✅ `POST /api/auth/login` - Login
- ✅ `POST /api/auth/logout` - Logout
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/register` - Register (admin only)
- ✅ `POST /api/auth/change-password` - Change password
- ✅ `GET /api/auth/users` - Get all users (admin only)
- ✅ `PATCH /api/auth/users/[id]` - Update user (admin only)
- ✅ `DELETE /api/auth/users/[id]` - Delete user (admin only)

**UI Pages:** [app/(features)/admin/](app/(features)/admin/)
- ✅ `/admin/login` - Beautiful login page với error handling
- ✅ `/admin/dashboard` - Dashboard với role-based visibility
- ✅ `/admin/users` - User management (admin only)

**Security Features:**
- ✅ Password hashing với bcrypt (salt rounds = 10)
- ✅ HTTP-only cookies với secure flag (production)
- ✅ Session management (7-day lifetime)
- ✅ Route protection middleware [middleware.ts](middleware.ts)
- ✅ Role-based access control (RBAC)
- ✅ Password validation (8+ chars, uppercase, lowercase, number)
- ✅ Email validation
- ⚠️ TODO: Rate limiting on login
- ⚠️ TODO: Password reset via email
- ⚠️ TODO: 2FA

**Getting Started:**
```bash
# Seed first admin user
npm run seed-admin

# Output:
# Email: admin@haisanngaymoi.com
# Password: Admin@123456 (⚠️ CHANGE THIS!)

# Login at: http://localhost:3000/admin/login
```

**Documentation:** See [AUTH_README.md](AUTH_README.md) for complete guide.

### **5.0.2 Authorization Matrix**

| Module         | Admin | Sale       | Warehouse  |
| -------------- | ----- | ---------- | ---------- |
| **Dashboard**  | Full  | Read       | Read       |
| **Products**   | Full  | Read       | Read/Write (stock) |
| **Categories** | Full  | Read       | No         |
| **Orders**     | Full  | Read/Write | Read/Write (status) |
| **Customers**  | Full  | Read       | No         |
| **Banners**    | Full  | Read       | No         |
| **Posts**      | Full  | Read       | No         |
| **Stations**   | Full  | Read       | No         |
| **Users**      | Full  | No         | No         |
| **Campaigns**  | Full  | Read       | No         |

---

## **5.1 ✅ Categories Module**

### **Status:** ✅ **COMPLETE** (Backend + UI)

### **Implementation Details**

**Domain:** [core/domain/category.ts](core/domain/category.ts)
```typescript
interface Category {
  id: number          // Auto-increment
  name: string
  image: string
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** [core/application/usecases/category/](core/application/usecases/category/)
1. ✅ `CreateCategoryUseCase`
2. ✅ `GetCategoriesUseCase`
3. ✅ `GetCategoryByIdUseCase`
4. ✅ `UpdateCategoryUseCase`
5. ✅ `DeleteCategoryUseCase`

**Repository:** [infrastructure/repositories/category-repo.ts](infrastructure/repositories/category-repo.ts)
- Extends `BaseRepository<Category, number>`
- Auto-increment ID strategy

**API Endpoints:** [app/api/categories/](app/api/categories/)
- `GET /api/categories` - Get all
- `POST /api/categories` - Create new
- `GET /api/categories/[id]` - Get by ID
- `PATCH /api/categories/[id]` - Update
- `DELETE /api/categories/[id]` - Delete

**UI Page:** [app/(features)/categories/page.tsx](app/(features)/categories/page.tsx)
- ✅ List view with inline editing
- ✅ Create form
- ✅ Update form
- ✅ Delete action
- ✅ Server Actions in `actions.ts`

**Features:**
- Inline editing interface
- Image upload support
- Real-time updates with `revalidatePath()`

---

## **5.2 🟡 Products Module**

### **Status:** 🟡 **Backend Ready, UI Needed**

### **Implementation Details**

**Domain:** [core/domain/product.ts](core/domain/product.ts)
```typescript
interface Product {
  id: number              // Auto-increment
  categoryId: number
  name: string
  price: number
  originalPrice: number
  image: string
  detail: string
  sizes?: ProductSize[]   // Multiple size options
  colors?: string[]       // Color variants
  createdAt: Date
  updatedAt: Date
}

interface ProductSize {
  name: string    // e.g., "500g", "1kg", "2kg"
  price: number
}
```

**Use Cases:** [core/application/usecases/product/](core/application/usecases/product/)
1. ✅ `CreateProductUseCase`
2. ✅ `FilterProductsUseCase` - With categoryId & search
3. ✅ `GetProductByIdUseCase`
4. ✅ `UpdateProductUseCase`
5. ✅ `DeleteProductUseCase`

**Repository:** [infrastructure/repositories/product-repo.ts](infrastructure/repositories/product-repo.ts)
- Auto-increment ID
- Size normalization logic

**API Endpoints:** [app/api/products/](app/api/products/)
- `GET /api/products?categoryId=1&search=tom` - Filter with params
- `POST /api/products` - Create
- `GET /api/products/[id]` - Get by ID
- `PATCH /api/products/[id]` - Update
- `DELETE /api/products/[id]` - Delete

**UI Page:** 🔴 **NEEDED**
- Location: `app/(features)/products/page.tsx`
- Required components:
  - ProductList with filtering
  - ProductForm (create/edit)
  - ProductCard with image preview
  - Size/Color variant manager
  - Category selector
- Required actions: `app/(features)/products/actions.ts`

**UI Requirements:**
- Grid/list view toggle
- Filter by category dropdown
- Search by name
- Sort by price (low to high, high to low)
- Bulk actions (activate/deactivate)
- Image upload with preview
- Dynamic size input (add/remove sizes)
- Color picker for variants
- Rich text editor for detail description

## **5.3 🟡 Orders Module**

### **Status:** 🟡 **Backend Complete + Payment Integration, UI Needed**

### **Implementation Details**

**Domain:** [core/domain/order.ts](core/domain/order.ts)
```typescript
interface Order {
  id: number                    // Auto-increment
  zaloUserId: string            // Customer Zalo ID
  checkoutSdkOrderId?: string   // Payment gateway order ID
  status: "pending" | "shipping" | "completed"
  paymentStatus: "pending" | "success" | "failed"
  items: OrderItem[]
  delivery: DeliveryInfo
  total: number
  note?: string
  createdAt: Date
  updatedAt: Date
}

interface OrderItem {
  productId: number
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
}

interface DeliveryInfo {
  name: string
  phone: string
  address: string
  location?: { lat: number; lng: number }
}
```

**Use Cases:** [core/application/usecases/order/](core/application/usecases/order/)
1. ✅ `CreateOrderUseCase`
2. ✅ `GetOrdersUseCase` - Filter by status, zaloUserId
3. ✅ `GetOrderByIdUseCase`
4. ✅ `UpdateOrderUseCase`
5. ✅ `DeleteOrderUseCase`
6. ✅ `LinkOrderUseCase` - Link to payment gateway
7. ✅ `CheckPaymentStatusUseCase`
8. ✅ `PaymentCallbackUseCase` - Handle payment callback
9. ✅ `CheckOrderStatusUseCase`
10. ✅ `MacRequestUseCase` - Generate MAC for payment

**Payment Integration:**
- ✅ Zalo Payment SDK
- ✅ VNPay Gateway
- ✅ IPN (Instant Payment Notification) handler

**API Endpoints:** [app/api/orders/](app/api/orders/)
- `GET /api/orders?status=pending&zaloUserId=xxx` - Get with filters
- `POST /api/orders` - Create order
- `GET /api/orders/[id]` - Get by ID
- `PATCH /api/orders/[id]` - Update
- `DELETE /api/orders/[id]` - Delete
- `POST /api/orders/link` - Link to payment
- `POST /api/orders/callback` - Payment callback
- `GET /api/orders/status` - Check payment status
- `POST /api/orders/mac` - MAC request
- `POST /api/orders/ipn` - VNPay IPN webhook

**UI Page:** 🔴 **NEEDED**
- Location: `app/(features)/orders/page.tsx`
- Required components:
  - OrderList with status filters
  - OrderDetail modal/page
  - OrderStatusUpdater
  - PaymentStatusBadge
  - DeliveryInfoCard
  - OrderTimeline (pending → shipping → completed)
- Required actions: `app/(features)/orders/actions.ts`

**UI Requirements:**
- Status filter tabs (All, Pending, Shipping, Completed)
- Payment status badges (color-coded)
- Quick actions: Update status, View details
- Search by customer name/phone
- Date range filter
- Export to CSV/Excel
- Print order details
- Order timeline visualization
- Real-time status updates

## **5.4 🟡 Customers Module**

### **Status:** 🟡 **Backend Ready, UI Needed**

**Domain:** [core/domain/customer.ts](core/domain/customer.ts)
```typescript
interface Customer {
  id: string              // External platform ID (Zalo/FB/Telegram)
  name: string
  avatar?: string
  phone?: string
  email?: string
  foundation: "Zalo" | "Facebook" | "Telegram"
  address?: string
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** [core/application/usecases/customer/](core/application/usecases/customer/)
1. ✅ `CreateCustomerUseCase`
2. ✅ `GetAllCustomersUseCase`
3. ✅ `GetCustomerByIdUseCase`
4. ✅ `UpdateCustomerUseCase`
5. ✅ `DeleteCustomerUseCase`
6. ✅ `SearchCustomersByNameUseCase`

**API Endpoints:** ✅ Full CRUD available

**UI Page:** 🔴 **NEEDED**
- Customer list with search
- Customer detail view
- Filter by platform (Zalo/Facebook/Telegram)
- Order history per customer
- Contact information display

---

## **5.5 🟡 Banners Module**

### **Status:** 🟡 **Backend Ready, UI Needed**

**Domain:** [core/domain/banner.ts](core/domain/banner.ts)
```typescript
interface Banner {
  id: number          // Auto-increment
  url: string         // Image URL
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** ✅ Full CRUD (5 use cases)

**API Endpoints:** [app/api/banners/](app/api/banners/)
- `GET /api/banners?detailed=true`
- Full CRUD support

**UI Page:** 🔴 **NEEDED**
- Banner list with preview
- Drag-drop reordering
- Image upload
- Active/Inactive toggle
- Link destination input

---

## **5.6 ✅ Posts Module**

### **Status:** ✅ **COMPLETE** (Backend + UI)

**Domain:** [core/domain/post.ts](core/domain/post.ts)
```typescript
interface Post {
  id: string          // MongoDB ObjectId
  title: string
  body: string
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** ✅ 4 use cases (Create, Get, Update, Delete)

**UI Page:** [app/(features)/posts/page.tsx](app/(features)/posts/page.tsx)
- ✅ PostForm component
- ✅ PostList component
- ✅ PostFilter component
- ✅ Zustand store (usePostStore)
- ✅ Server Actions

**Features:**
- Create/edit posts
- Delete posts
- Search/filter posts
- Client-side state management

---

## **5.7 🟡 Stations Module**

### **Status:** 🟡 **Backend Ready, UI Needed**

**Domain:** [core/domain/station.ts](core/domain/station.ts)
```typescript
interface Station {
  id: number              // Auto-increment
  name: string
  image: string
  address: string
  location: {
    lat: number
    lng: number
  }
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** ✅ Full CRUD (5 use cases)

**API Endpoints:** ✅ Full CRUD available

**UI Page:** 🔴 **NEEDED**
- Station list
- Map integration (Google Maps/Mapbox)
- Location picker
- Image upload
- Address autocomplete

---

## **5.8 🔴 Campaigns Module**

### **Status:** 🔴 **NOT IMPLEMENTED**

**Proposed Domain:** `core/domain/campaign.ts`
```typescript
interface Campaign {
  id: number
  name: string
  description: string
  image: string
  startDate: Date
  endDate: Date
  status: "upcoming" | "active" | "ended"
  type: "discount" | "branding" | "kol"
  products: number[]        // Product IDs
  platforms: CampaignPlatform[]
  createdAt: Date
  updatedAt: Date
}

interface CampaignPlatform {
  platform: "facebook" | "tiktok" | "zalo" | "shopee"
  campaignId: string        // External platform campaign ID
  utmParams: {
    source: string
    medium: string
    campaign: string
  }
  metrics?: {
    impressions?: number
    clicks?: number
    ctr?: number
  }
}
```

**Required Implementation:**
1. Domain entity
2. 5 CRUD use cases
3. Repository with BaseRepository
4. API endpoints
5. UI pages:
   - Campaign list with status filters
   - Campaign form (create/edit)
   - Platform link manager
   - Analytics dashboard (future)

---

## **5.9 🔴 Dashboard Module**

### **Status:** 🔴 **NOT IMPLEMENTED**

**Purpose:** Admin overview and analytics

**Proposed Features:**
- Total sales chart (daily/weekly/monthly)
- Order status breakdown
- Top selling products
- Recent orders table
- Customer growth chart
- Revenue by category
- Payment method breakdown
- Quick actions (Create order, Add product)

**Technical Requirements:**
- Use Cases for analytics:
  - `GetDashboardStatsUseCase`
  - `GetSalesChartDataUseCase`
  - `GetTopProductsUseCase`
  - `GetRecentOrdersUseCase`
- Chart library: Recharts or Chart.js
- Real-time updates using Server-Sent Events or polling

**UI Page:** `app/(features)/dashboard/page.tsx` (Needs creation)

---

# **6. API Documentation**

## **6.1 API Design Principles**

All APIs follow RESTful conventions:

- **GET** - Retrieve resources
- **POST** - Create new resources
- **PATCH** - Update existing resources
- **DELETE** - Remove resources

## **6.2 Response Format**

**Success Response:**
```json
{
  "id": 1,
  "name": "Tôm hùm Alaska",
  "price": 850000,
  "createdAt": "2025-01-17T10:00:00.000Z"
}
```

**Error Response:**
```json
{
  "error": "Resource not found",
  "message": "Category with ID 999 does not exist",
  "statusCode": 404
}
```

## **6.3 Common Query Parameters**

- `?categoryId=1` - Filter by category
- `?search=tom` - Search by name
- `?status=pending` - Filter by status
- `?detailed=true` - Include related data
- `?zaloUserId=xxx` - Filter by user ID

## **6.4 Authentication Headers** (Future)

```
Authorization: Bearer <jwt_token>
X-Admin-Role: admin|sale|warehouse
```

---

# **7. Development Guidelines**

## **7.1 Adding a New Feature**

Follow this exact sequence based on Clean/Onion Architecture:

### **Step 1: Domain Layer**
```bash
# Create domain entity
touch core/domain/feature.ts
```

Example:
```typescript
// core/domain/feature.ts
export interface Feature {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

export function validateFeature(feature: Partial<Feature>): string[] {
  const errors: string[] = []
  if (!feature.name) errors.push("Name is required")
  return errors
}
```

### **Step 2: Service Interface**
```bash
# Create service interface
touch core/application/interfaces/feature-service.ts
```

Example:
```typescript
// core/application/interfaces/feature-service.ts
import type { Feature } from "@/core/domain/feature"

export interface FeaturePayload extends Partial<Feature> {}

export interface FeatureService {
  getAll(): Promise<Feature[]>
  getById(id: number): Promise<Feature | null>
  create(payload: FeaturePayload): Promise<Feature>
  update(payload: FeaturePayload): Promise<Feature | null>
  delete(id: number): Promise<boolean>
}
```

### **Step 3: Use Cases**
```bash
# Create use case directory
mkdir -p core/application/usecases/feature
touch core/application/usecases/feature/create-feature.ts
```

Example:
```typescript
// core/application/usecases/feature/create-feature.ts
import type { Feature } from "@/core/domain/feature"
import type { FeatureService, FeaturePayload } from "@/core/application/interfaces/feature-service"
import { validateFeature } from "@/core/domain/feature"

export interface CreateFeatureRequest extends FeaturePayload {}

export interface CreateFeatureResponse {
  feature: Feature
}

export class CreateFeatureUseCase {
  constructor(private featureService: FeatureService) {}

  async execute(request: CreateFeatureRequest): Promise<CreateFeatureResponse> {
    const errors = validateFeature(request)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`)
    }

    const feature = await this.featureService.create(request)
    return { feature }
  }
}
```

### **Step 4: Repository**
```bash
touch infrastructure/repositories/feature-repo.ts
```

Example:
```typescript
// infrastructure/repositories/feature-repo.ts
import { BaseRepository } from "./base-repo"
import type { Feature } from "@/core/domain/feature"
import type { FeatureService, FeaturePayload } from "@/core/application/interfaces/feature-service"

export class FeatureRepository extends BaseRepository<Feature, number> implements FeatureService {
  protected collectionName = "features"

  async create(payload: FeaturePayload): Promise<Feature> {
    const client = await this.getClient()
    const collection = this.getCollection(client)
    const id = await this.getNextId()

    const doc = {
      ...payload,
      _id: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await collection.insertOne(doc)
    return this.toDomain(doc)
  }

  // Implement other methods...
}
```

### **Step 5: Dependency Factory**
```bash
mkdir -p app/api/features
touch app/api/features/depends.ts
```

Example:
```typescript
// app/api/features/depends.ts
import { FeatureRepository } from "@/infrastructure/repositories/feature-repo"
import { CreateFeatureUseCase } from "@/core/application/usecases/feature/create-feature"
import type { FeatureService } from "@/core/application/interfaces/feature-service"

const createFeatureRepository = async (): Promise<FeatureService> => {
  return new FeatureRepository()
}

export const createFeatureUseCase = async () => {
  const service = await createFeatureRepository()
  return new CreateFeatureUseCase(service)
}
```

### **Step 6: API Routes**
```bash
touch app/api/features/route.ts
```

Example:
```typescript
// app/api/features/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createFeatureUseCase } from "./depends"

export async function POST(request: NextRequest) {
  try {
    const useCase = await createFeatureUseCase()
    const result = await useCase.execute(await request.json())
    return NextResponse.json(result.feature, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
```

### **Step 7: UI Page**
```bash
mkdir -p app/\(features\)/features
touch app/\(features\)/features/page.tsx
touch app/\(features\)/features/actions.ts
```

Example Server Action:
```typescript
// app/(features)/features/actions.ts
"use server"
import { revalidatePath } from "next/cache"
import { createFeatureUseCase } from "@/app/api/features/depends"

export async function createFeatureAction(formData: FormData) {
  const useCase = await createFeatureUseCase()
  await useCase.execute({
    name: formData.get("name")?.toString() || "",
  })
  revalidatePath("/features")
}
```

## **7.2 Testing Strategy**

### **Domain Tests**
```typescript
// core/domain/__tests__/feature.spec.ts
import { describe, it, expect } from 'vitest'
import { validateFeature } from '../feature'

describe('Feature Domain', () => {
  it('should validate required fields', () => {
    const errors = validateFeature({})
    expect(errors).toContain('Name is required')
  })
})
```

### **Use Case Tests**
```typescript
// core/application/usecases/feature/__tests__/create-feature.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { CreateFeatureUseCase } from '../create-feature'

describe('CreateFeatureUseCase', () => {
  it('should create feature successfully', async () => {
    const mockService = {
      create: vi.fn().mockResolvedValue({ id: 1, name: 'Test' })
    }
    const useCase = new CreateFeatureUseCase(mockService as any)
    const result = await useCase.execute({ name: 'Test' })
    expect(result.feature.id).toBe(1)
  })
})
```

---

# **8. Implementation Roadmap**

## **Phase 1: Critical - Authentication & Authorization** ✅ **COMPLETE**

**Priority:** ✅ **DONE**

- [x] Implement AdminUser domain entity
- [x] Create authentication use cases (7 use cases)
- [x] Add session-based auth with bcrypt
- [x] Create login page UI
- [x] Implement middleware for route protection
- [x] Add RBAC (Role-Based Access Control)
- [x] Create user management UI (admin only)
- [x] Create dashboard UI
- [x] Add seed script for first admin user

## **Phase 2: Core Admin UI** (Weeks 3-4)

**Priority:** 🟡 **HIGH**

- [ ] Products management UI (`/admin/products`)
- [ ] Orders management UI (`/admin/orders`)
- [ ] Customers management UI (`/admin/customers`)
- [ ] Banners management UI (`/admin/banners`)
- [ ] Stations management UI (`/admin/stations`)

## **Phase 3: Dashboard & Analytics** (Week 5)

**Priority:** 🟢 **MEDIUM**

- [ ] Create dashboard page
- [ ] Implement analytics use cases
- [ ] Sales charts (Recharts)
- [ ] Order statistics
- [ ] Top products widget
- [ ] Recent activities feed

## **Phase 4: Campaigns Module** (Week 6)

**Priority:** 🟢 **MEDIUM**

- [ ] Campaign domain entity
- [ ] Campaign use cases
- [ ] Campaign repository
- [ ] Campaign API endpoints
- [ ] Campaign UI pages
- [ ] Platform integration (Facebook/TikTok/Zalo)

## **Phase 5: Advanced Features** (Weeks 7-8)

**Priority:** 🔵 **LOW**

- [ ] Image optimization and CDN integration
- [ ] Bulk import/export (CSV/Excel)
- [ ] Advanced filtering and search
- [ ] Activity audit logs
- [ ] Email notifications
- [ ] Inventory management
- [ ] Reports generation (PDF/Excel)

## **Phase 6: Performance & Production** (Week 9)

- [ ] Performance optimization
- [ ] Caching strategy (Redis)
- [ ] Database indexing
- [ ] Security audit
- [ ] Load testing
- [ ] Production deployment

---

# **9. Technical Debt & Improvements**

## **9.1 Current Technical Debt**

1. ~~**No Authentication System**~~ - ✅ **RESOLVED** (Phase 1 complete)
2. **Incomplete UI Coverage** - 5/8 modules không có UI (Products, Orders, Customers, Banners, Stations)
3. **Missing Tests** - Test coverage thấp cho authentication module
4. **No Error Monitoring** - Cần Sentry hoặc tương tự
5. **No Logging System** - Cần centralized logging
6. **Banner Module Too Simple** - Thiếu fields: title, link, position, ordering
7. **Auth Enhancements Needed**:
   - Rate limiting on login endpoint
   - Password reset via email
   - 2FA (Two-Factor Authentication)
   - Activity audit logs

## **9.2 Proposed Improvements**

### **Banner Module Enhancement**
```typescript
// Enhanced Banner domain
interface Banner {
  id: number
  title: string              // NEW
  url: string
  link?: string              // NEW - Click destination
  position: "home_hero" | "home_slider" | "campaign"  // NEW
  ordering: number           // NEW - Display order
  isActive: boolean          // NEW
  createdAt: Date
  updatedAt: Date
}
```

### **Product Module Enhancement**
```typescript
// Add inventory tracking
interface Product {
  // ... existing fields
  stock?: number
  lowStockThreshold?: number
  sku: string
  isActive: boolean
}
```

### **Order Module Enhancement**
```typescript
// Add shipping tracking
interface Order {
  // ... existing fields
  trackingNumber?: string
  shippingProvider?: "GHN" | "GHTK" | "VNPost"
  estimatedDelivery?: Date
}
```

---

# **10. Security Considerations**

## **10.1 Authentication Security**

- Use bcrypt with salt rounds ≥ 10 for password hashing
- Implement rate limiting on login endpoint (max 5 attempts/minute)
- JWT tokens expire after 24 hours
- Refresh token rotation
- Secure cookie settings (httpOnly, secure, sameSite)

## **10.2 Authorization Security**

- Middleware checks on ALL `/admin/*` routes
- API endpoints validate user role before processing
- Use cases check permissions at business logic level
- Database queries filter by user permissions

## **10.3 Data Security**

- Input validation on all user inputs
- SQL/NoSQL injection prevention (using MongoDB driver properly)
- XSS protection (sanitize HTML in rich text)
- CSRF protection (Next.js built-in)
- File upload validation (type, size, malware scan)

## **10.4 API Security**

- Rate limiting per IP/user
- Request size limits
- CORS configuration for production
- API versioning strategy
- Sensitive data masking in logs

---

# **11. Deployment Checklist**

## **11.1 Environment Variables**

```env
# Database
MONGODB_URI=mongodb+srv://...
MONGODB_DB=haisanngaymoi_crm

# Authentication
NEXTAUTH_URL=https://admin.haisanngaymoi.com
NEXTAUTH_SECRET=<strong-secret>
JWT_SECRET=<strong-secret>

# Payment Gateways
ZALO_APP_ID=...
ZALO_SECRET_KEY=...
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=...

# Email (for password reset)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...

# Redis (for queues)
REDIS_URL=redis://...

# File Storage (if using cloud)
AWS_S3_BUCKET=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## **11.2 Pre-Production Checklist**

- [ ] All environment variables configured
- [ ] Database indexes created
- [ ] Redis configured and connected
- [ ] Authentication system tested
- [ ] All API endpoints tested
- [ ] UI components responsive on mobile
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics (Google Analytics) configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit completed

---

# **12. Support & Maintenance**

## **12.1 Monitoring**

- **Uptime Monitoring:** UptimeRobot or Pingdom
- **Error Tracking:** Sentry
- **Performance Monitoring:** Vercel Analytics or New Relic
- **Database Monitoring:** MongoDB Atlas monitoring

## **12.2 Backup Strategy**

- **Database:** Daily automated backups (MongoDB Atlas)
- **File Storage:** Versioned backups in S3
- **Retention:** Keep backups for 30 days

## **12.3 Update Cycle**

- **Security Updates:** Immediate
- **Bug Fixes:** Weekly release cycle
- **New Features:** Bi-weekly release cycle
- **Major Versions:** Quarterly

---

# **13. Conclusion**

Hệ thống Admin Dashboard cho Hải sản Ngày Mới được thiết kế theo **Clean/Onion Architecture** với sự phân tách rõ ràng giữa các layer. Hiện tại backend đã hoàn thiện 80%, với các module chính đã có API đầy đủ.

**Progress Summary:**
- ✅ **Authentication/Authorization** - COMPLETE (Phase 1)
- ✅ **Categories Module** - COMPLETE (Backend + UI)
- ✅ **Posts Module** - COMPLETE (Backend + UI)
- 🟡 **Backend Modules** - 70% complete (Products, Orders, Customers, Banners, Stations)

**Ưu tiên triển khai tiếp theo:**
1. ~~**Authentication/Authorization**~~ - ✅ **COMPLETE**
2. **Admin UI cho Products, Orders, Customers** - HIGH (Phase 2)
3. **Dashboard Analytics** - MEDIUM (Phase 3)
4. **Campaign Module** - LOW (Phase 4)

Với roadmap chi tiết và hướng dẫn kỹ thuật đầy đủ, team development có thể bắt đầu implement ngay các module còn thiếu theo đúng kiến trúc đã định sẵn.

---

**Document Version:** 2.0
**Last Updated:** 2025-11-17
**Maintained By:** Development Team
**Next Review:** 2025-12-01