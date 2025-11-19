# I. Implementation Status

| Module         | Domain | Use Cases | Repository | API Routes | UI Page | Status |
| -------------- | ------ | --------- | ---------- | ---------- | ------- | ------ |
| **Auth**       | ✅     | ✅ (7)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Categories** | ✅     | ✅ (5)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Posts**      | ✅     | ✅ (4)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Products**   | ✅     | ✅ (5)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Banners**    | ✅     | ✅ (5)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Customers**  | ✅     | ✅ (6)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Orders**     | ✅     | ✅ (11)   | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Dashboard**  | N/A    | ✅        | N/A        | ✅         | ✅      | ✅ **Complete** |
| **Campaigns**  | ✅     | ✅ (6)    | ✅         | ✅         | ✅      | ✅ **Complete** |
| **Stations**   | ✅     | ✅ (5)    | ✅         | ✅         | ✅      | ✅ **Complete** |




## Domain Entity: [core/domain/admin-user.ts](core/domain/admin-user.ts)
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


## Domain: [core/domain/category.ts](core/domain/category.ts)
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

**UI Page:** [app/(features)/admin/dashboard/categories/page.tsx](app/(features)/admin/dashboard/categories/page.tsx)
- ✅ List view with inline editing
- ✅ Create form
- ✅ Update form
- ✅ Delete action
- ✅ Server Actions in `actions.ts`


## Domain: [core/domain/product.ts](core/domain/product.ts)
```typescript
interface Product {
  id: number              // Auto-increment
  categoryId: number
  name: string
  price: number
  originalPrice: number
  image: string
  detail: string
  sizes?: SizeOption[]    // Multiple size options
  colors?: string[]       // Color variants
  createdAt: Date
  updatedAt: Date
}

interface SizeOption {
  label: string           // e.g., "500g", "1kg", "2kg"
  price: number
  originalPrice?: number
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

**UI Pages:** [app/(features)/admin/dashboard/products/](app/(features)/admin/dashboard/products/)
- ✅ `page.tsx` - Main products page with grid layout
- ✅ `actions.ts` - Server Actions for CRUD operations
- ✅ `components/ProductList.tsx` - Product grid with filtering
- ✅ `components/ProductForm.tsx` - Create/Edit modal form


## Domain: [core/domain/order.ts](core/domain/order.ts)
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

**UI Implementation:** ✅ **COMPLETE**

**Server Actions:** [app/(features)/admin/dashboard/orders/actions.ts](app/(features)/admin/dashboard/orders/actions.ts)
- ✅ `getOrdersAction()` - Get orders with filters
- ✅ `createOrderAction()` - Create new order
- ✅ `updateOrderAction()` - Update order status/payment
- ✅ `deleteOrderAction()` - Delete order
- ✅ Uses injected use cases from `depends.ts`
- ✅ Proper `revalidatePath()` after mutations

**Main Page:** [app/(features)/admin/dashboard/orders/page.tsx](app/(features)/admin/dashboard/orders/page.tsx)
- ✅ Server Component with data fetching
- ✅ Uses `getOrdersUseCase()` for initial data
- ✅ JSON serialization for Date objects
- ✅ Passes data to OrderList component

**Components:** [app/(features)/admin/dashboard/orders/components/](app/(features)/admin/dashboard/orders/components/)

1. **OrderList.tsx** - Main table component with:
   - ✅ Status filter (All, Pending, Shipping, Completed) with counts
   - ✅ Payment status filter (All, Pending, Success, Failed)
   - ✅ Inline status updates via dropdown
   - ✅ Color-coded status badges (order & payment)
   - ✅ Customer info display (name, phone)
   - ✅ Total price with currency formatting
   - ✅ Actions: View details, Delete
   - ✅ Empty state handling
   - ✅ Dark mode support

2. **OrderDetailModal.tsx** - Detailed order view with:
   - ✅ Order header (ID, created date, status badges)
   - ✅ Customer information section (name, phone, address, Zalo ID, location)
   - ✅ Order items table (product names, quantities, prices, subtotals)
   - ✅ Total price calculation
   - ✅ Payment information (Checkout SDK Order ID)
   - ✅ Notes section (if available)
   - ✅ Modal overlay with close button
   - ✅ Responsive design
   - ✅ Dark mode support

## Domain [core/domain/customer.ts](core/domain/customer.ts)
```typescript
interface Customer {
  id: string              // External platform ID (Zalo/FB/Telegram)
  name?: string
  avatar?: string
  phone?: string
  email?: string
  foundation: string      // "Zalo" | "Facebook" | "Telegram"
  address?: string
  createdAt?: Date
  updatedAt?: Date
}
```

**Use Cases:** [core/application/usecases/customer/](core/application/usecases/customer/)
1. ✅ `CreateCustomerUseCase`
2. ✅ `GetAllCustomersUseCase`
3. ✅ `GetCustomerByIdUseCase`
4. ✅ `UpdateCustomerUseCase`
5. ✅ `DeleteCustomerUseCase`
6. ✅ `SearchCustomersByNameUseCase`

**API Endpoints:** [app/api/customers/](app/api/customers/)
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `GET /api/customers/[id]` - Get by ID
- `PATCH /api/customers/[id]` - Update
- `DELETE /api/customers/[id]` - Delete
- `GET /api/customers/search?name=...` - Search by name

**UI Pages:** [app/(features)/admin/dashboard/customers/](app/(features)/admin/dashboard/customers/)
- ✅ `page.tsx` - Main customers page with table layout
- ✅ `actions.ts` - Server Actions for CRUD operations
- ✅ `components/CustomerList.tsx` - Customer table with filtering
- ✅ `components/CustomerForm.tsx` - Create/Edit modal form

## Domain [core/domain/banner.ts](core/domain/banner.ts)
```typescript
interface Banner {
  id: number          // Auto-increment
  url: string         // Image URL
  createdAt: Date
  updatedAt: Date
}
```

**Use Cases:** ✅ Full CRUD (5 use cases)
1. ✅ `GetBannersUseCase`
2. ✅ `CreateBannerUseCase`
3. ✅ `GetBannerByIdUseCase`
4. ✅ `UpdateBannerUseCase`
5. ✅ `DeleteBannerUseCase`

**API Endpoints:** [app/api/banners/](app/api/banners/)
- `GET /api/banners` - Get all banners
- `POST /api/banners` - Create banner
- `GET /api/banners/[id]` - Get by ID
- `PATCH /api/banners/[id]` - Update
- `DELETE /api/banners/[id]` - Delete

**UI Pages:** [app/(features)/admin/dashboard/banners/](app/(features)/admin/dashboard/banners/)
- ✅ `page.tsx` - Main banners page with grid layout
- ✅ `actions.ts` - Server Actions for CRUD operations
- ✅ `components/BannerList.tsx` - Banner grid with previews
- ✅ `components/BannerForm.tsx` - Create/Edit modal form

## Domain [core/domain/post.ts](core/domain/post.ts)
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

**UI Page:** [app/(features)/admin/dashboard/posts/page.tsx](app/(features)/admin/dashboard/posts/page.tsx)
- ✅ PostForm component
- ✅ PostList component
- ✅ PostFilter component
- ✅ Zustand store (usePostStore)
- ✅ Server Actions


## Domain [core/domain/campaign.ts](core/domain/campaign.ts)
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

**Use Cases:** [core/application/usecases/campaign/](core/application/usecases/campaign/)
1. ✅ `GetAllCampaignsUseCase`
2. ✅ `GetCampaignByIdUseCase`
3. ✅ `GetCampaignsByStatusUseCase`
4. ✅ `CreateCampaignUseCase`
5. ✅ `UpdateCampaignUseCase`
6. ✅ `DeleteCampaignUseCase`

**Repository:** [infrastructure/repositories/campaign-repo.ts](infrastructure/repositories/campaign-repo.ts)
- Extends `BaseRepository<Campaign, number>`
- Methods: CRUD + filter by status, active campaigns

**API Endpoints:** [app/api/campaigns/](app/api/campaigns/)
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns?status=active` - Filter by status
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get by ID
- `PATCH /api/campaigns/[id]` - Update
- `DELETE /api/campaigns/[id]` - Delete

**UI Pages:** [app/(features)/admin/dashboard/campaigns/](app/(features)/admin/dashboard/campaigns/)
- ✅ `page.tsx` - Main campaigns page
- ✅ `actions.ts` - Server Actions for CRUD
- ✅ `components/CampaignList.tsx` - Campaign listing
- ✅ `components/CampaignForm.tsx` - Create/Edit form


## Components [app/(features)/admin/dashboard/components/](app/(features)/admin/dashboard/components/)

1. **DashboardStats.tsx** - KPI Cards:
   - ✅ Total Revenue (with currency formatting)
   - ✅ Total Orders (with pending count)
   - ✅ Total Customers
   - ✅ Total Products
   - ✅ Color-coded icon backgrounds
   - ✅ Optional trend indicators
   - ✅ Responsive grid layout

2. **OrdersChart.tsx** - Visual Analytics:
   - ✅ Order Status chart (horizontal progress bars)
   - ✅ Payment Status chart (horizontal progress bars)
   - ✅ Percentage calculations
   - ✅ Animated transitions
   - ✅ Color-coded indicators (yellow/blue/green for status)
   - ✅ Dark mode support

3. **RecentOrders.tsx** - Activity Feed:
   - ✅ Last 5 orders display
   - ✅ Order ID, status, and payment badges
   - ✅ Customer name and timestamp
   - ✅ Total amount with currency formatting
   - ✅ Link to full orders page
   - ✅ Hover effects and transitions

**Features Implemented:**
- ✅ Real-time data aggregation from existing modules
- ✅ No additional database queries needed
- ✅ Clean Architecture (uses existing use cases)
- ✅ Statistics cards with key business metrics
- ✅ Visual analytics with progress bars
- ✅ Recent activity feed
- ✅ Quick action cards for all modules
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Dark mode support throughout
- ✅ Currency formatting (VND)
- ✅ Empty state handling
- ✅ Error handling with fallbacks

**Analytics Metrics:**
- Revenue: Total from successful payments
- Orders: Total, pending, completed counts
- Order Status: Percentage breakdown
- Payment Status: Success/pending/failed distribution
- Recent Activity: Last 5 orders with details



💡 **Tóm gọn:**

* **Analytics & Insights:** Dashboard tổng quan, phân tích chi tiết, dự đoán AI.
* **Trợ lý AI:** Chatbot nội bộ giúp truy vấn dữ liệu & gợi ý hành động.
* **Customer Care:** Tích hợp ticket, gửi tin nhắn/email, lịch sử chăm sóc, đánh giá hài lòng, template AI.


# II. Next Steps - Detailed Implementation Plan

This section provides a **step-by-step technical implementation plan** following the project's **Clean/Onion Architecture** principles. Each module follows the standard layering: Domain → Use Cases → Repository → API Routes → UI.

---

## **📊 Phase 1: Advanced Analytics & Insights**

### **Module 1.1: Revenue Analytics**

**Business Goals:**
- Provide comprehensive revenue insights across time periods
- Enable comparison with previous periods
- Identify top-performing products and customers
- Track order metrics and cancellation rates

**Technical Implementation:**

#### **Domain Entity:** `core/domain/analytics/revenue-metrics.ts`
```typescript
interface RevenueMetrics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  cancelRate: number
  returnRate: number
  period: DateRange
  comparisonPeriod?: {
    revenue: number
    orders: number
    changePercent: number
  }
}

interface TopProduct {
  productId: number
  productName: string
  revenue: number
  orderCount: number
  quantity: number
}

interface TopCustomer {
  customerId: string
  customerName: string
  totalRevenue: number
  orderCount: number
  tier: CustomerTier
}

interface RevenueTimeSeries {
  date: Date
  revenue: number
  orderCount: number
  averageOrderValue: number
}

type DateRange = {
  startDate: Date
  endDate: Date
}

type TimeGranularity = "day" | "week" | "month" | "quarter" | "year"
```

#### **Use Cases:** `core/application/usecases/analytics/revenue/`
1. **GetRevenueMetricsUseCase** - Calculate KPIs for a given period
   - Input: `{ startDate, endDate, comparisonStartDate?, comparisonEndDate? }`
   - Output: `RevenueMetrics`
   - Logic: Aggregate orders, calculate totals, compare periods

2. **GetRevenueTimeSeriesUseCase** - Get revenue trend over time
   - Input: `{ startDate, endDate, granularity: TimeGranularity }`
   - Output: `RevenueTimeSeries[]`
   - Logic: Group orders by time interval, calculate aggregates

3. **GetTopProductsUseCase** - Top-selling products by revenue
   - Input: `{ startDate, endDate, limit: number }`
   - Output: `TopProduct[]`
   - Logic: Join orders with products, aggregate, sort by revenue

4. **GetTopCustomersUseCase** - Top customers by revenue
   - Input: `{ startDate, endDate, limit: number }`
   - Output: `TopCustomer[]`
   - Logic: Aggregate orders by customer, sort by revenue

5. **GetOrderStatusDistributionUseCase** - Order status breakdown
   - Input: `{ startDate, endDate }`
   - Output: `{ status: OrderStatus, count: number, percentage: number }[]`

#### **Repository Extensions:** `infrastructure/repositories/analytics/`
- **RevenueAnalyticsRepository** (extends existing OrderRepository)
  - Methods:
    - `getRevenueMetrics(dateRange: DateRange): Promise<RevenueMetrics>`
    - `getRevenueTimeSeries(dateRange: DateRange, granularity: TimeGranularity): Promise<RevenueTimeSeries[]>`
    - `getTopProducts(dateRange: DateRange, limit: number): Promise<TopProduct[]>`
    - `getTopCustomers(dateRange: DateRange, limit: number): Promise<TopCustomer[]>`
  - Uses MongoDB aggregation pipeline for complex queries

#### **API Endpoints:** `app/api/analytics/revenue/`
- `GET /api/analytics/revenue/metrics?startDate=...&endDate=...&compareWith=...`
- `GET /api/analytics/revenue/time-series?startDate=...&endDate=...&granularity=day`
- `GET /api/analytics/revenue/top-products?startDate=...&endDate=...&limit=10`
- `GET /api/analytics/revenue/top-customers?startDate=...&endDate=...&limit=10`
- `GET /api/analytics/revenue/order-status?startDate=...&endDate=...`

#### **UI Implementation:** `app/(features)/admin/dashboard/analytics/revenue/`

**Components:**
1. **page.tsx** - Server Component
   - Fetch initial metrics using use cases
   - Date range selector (Today, Last 7 days, Last 30 days, This month, Last month, Custom)
   - Pass data to client components

2. **components/RevenueMetricsCards.tsx** - KPI cards
   - Total Revenue (with % change vs previous period)
   - Total Orders (with % change)
   - Average Order Value (with % change)
   - Cancel/Return Rates
   - Color-coded trend indicators (green ↑, red ↓)

3. **components/RevenueTimeSeriesChart.tsx** - Line chart
   - Uses Recharts or Chart.js
   - Revenue over time with granularity selector
   - Comparison overlay (current vs previous period)
   - Tooltips with detailed data

4. **components/TopProductsTable.tsx** - Data table
   - Product name, revenue, order count, quantity
   - Sortable columns
   - Product images
   - Link to product detail

5. **components/TopCustomersTable.tsx** - Data table
   - Customer name, tier badge, total revenue, order count
   - Link to customer profile

6. **components/OrderStatusPieChart.tsx** - Pie/Doughnut chart
   - Visual breakdown of order statuses
   - Interactive legend

**UI Libraries:**
- **Charts**: `recharts` (React-based charting library)
- **Tables**: Shadcn UI Data Table components
- **Date Picker**: Shadcn UI Calendar + Date Range Picker

**Store (Optional):** `store/useRevenueAnalyticsStore.ts`
- Client-side state for:
  - Selected date range
  - Granularity preference
  - Chart display options (show/hide comparison)

---

### **Module 1.2: Customer Behavior Analytics**

**Business Goals:**
- Track customer acquisition and retention
- Identify customer segments and their value
- Analyze purchasing patterns
- Predict churn risk

#### **Domain Entity:** `core/domain/analytics/customer-metrics.ts`
```typescript
interface CustomerMetrics {
  totalCustomers: number
  newCustomers: number
  returningCustomers: number
  churnRate: number
  period: DateRange
  segmentDistribution: CustomerSegmentStats[]
}

interface CustomerSegmentStats {
  tier: CustomerTier // "new" | "regular" | "vip" | "premium"
  count: number
  percentage: number
  averageRevenue: number
  averageOrderFrequency: number
}

interface PurchasePattern {
  customerId: string
  firstPurchaseDate: Date
  lastPurchaseDate: Date
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  daysSinceLastPurchase: number
  favoriteCategories: { categoryId: number; categoryName: string; orderCount: number }[]
  averageDaysBetweenOrders: number
  churnRisk: "low" | "medium" | "high" // Based on recency
}

interface CustomerRetention {
  period: string // "Month 1", "Month 2", etc.
  cohortSize: number
  retainedCustomers: number
  retentionRate: number
}
```

#### **Use Cases:** `core/application/usecases/analytics/customer/`
1. **GetCustomerMetricsUseCase**
   - Input: `{ startDate, endDate }`
   - Output: `CustomerMetrics`
   - Logic: Count new vs returning, calculate churn, segment distribution

2. **GetCustomerSegmentationUseCase**
   - Input: `{ dateRange }`
   - Output: `CustomerSegmentStats[]`
   - Logic: Group customers by tier, calculate stats

3. **GetPurchasePatternsUseCase**
   - Input: `{ customerId? }` (optional - returns all if not specified)
   - Output: `PurchasePattern[]`
   - Logic: Analyze order history, calculate frequencies, identify favorites

4. **GetChurnRiskCustomersUseCase**
   - Input: `{ riskLevel: "high" | "medium", limit: number }`
   - Output: `PurchasePattern[]`
   - Logic: Identify customers who haven't purchased recently (configurable thresholds)

5. **GetCohortRetentionUseCase**
   - Input: `{ cohortStartDate, periods: number }`
   - Output: `CustomerRetention[]`
   - Logic: Cohort analysis - track customers from signup over time

#### **Repository:** `infrastructure/repositories/analytics/customer-analytics-repo.ts`
- Extends CustomerRepository and OrderRepository
- Complex aggregations for customer behavior patterns

#### **API Endpoints:** `app/api/analytics/customer/`
- `GET /api/analytics/customer/metrics?startDate=...&endDate=...`
- `GET /api/analytics/customer/segmentation?startDate=...&endDate=...`
- `GET /api/analytics/customer/purchase-patterns?customerId=...`
- `GET /api/analytics/customer/churn-risk?level=high&limit=50`
- `GET /api/analytics/customer/retention?cohortStart=...&periods=12`

#### **UI Implementation:** `app/(features)/admin/dashboard/analytics/customer/`

**Components:**
1. **CustomerMetricsCards.tsx** - KPI overview
2. **CustomerSegmentationChart.tsx** - Pie/Bar chart for tier distribution
3. **PurchasePatternsHeatmap.tsx** - Heatmap showing purchase frequency by day/hour
4. **ChurnRiskList.tsx** - Table of at-risk customers with action buttons (send care message)
5. **CohortRetentionChart.tsx** - Cohort retention matrix visualization

---

### **Module 1.3: Staff Performance Analytics**

**Business Goals:**
- Track individual and team performance
- Identify top performers
- Monitor follow-up effectiveness
- Support commission calculations

#### **Domain Entity:** `core/domain/analytics/staff-performance.ts`
```typescript
interface StaffPerformance {
  staffId: string
  staffName: string
  role: "admin" | "sale" | "warehouse"
  period: DateRange
  metrics: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    conversionRate: number // Orders / Total customer interactions
    followUpSuccessRate: number // Successful follow-ups / Total follow-ups
  }
  ranking: number
}

interface StaffActivity {
  staffId: string
  date: Date
  ordersProcessed: number
  customersContacted: number
  followUps: number
  notes: string[]
}

interface TeamPerformance {
  period: DateRange
  totalRevenue: number
  topPerformers: StaffPerformance[]
  averageMetrics: {
    ordersPerStaff: number
    revenuePerStaff: number
    conversionRate: number
  }
}
```

#### **Use Cases:** `core/application/usecases/analytics/staff/`
1. **GetStaffPerformanceUseCase** - Individual staff metrics
2. **GetTeamPerformanceUseCase** - Team-level aggregates
3. **GetStaffRankingUseCase** - Leaderboard
4. **GetStaffActivityLogUseCase** - Daily activity tracking

**Note:** This requires enhancing the Order and Customer Care modules to track which staff member handled each interaction.

#### **Schema Changes Required:**
- Add `assignedTo: string` (staff ID) to Order entity
- Add `handledBy: string` to CustomerCareTicket entity (Module 3.1)

#### **UI Implementation:** `app/(features)/admin/dashboard/analytics/staff/`
- Staff performance dashboard (admin-only)
- Leaderboard with rankings
- Individual staff detail view

---

### **Module 1.4: Campaign Performance Analytics**

**Business Goals:**
- Measure campaign ROI
- Compare performance across platforms
- Track UTM parameters
- Optimize marketing spend

#### **Domain Enhancement:** Extend `core/domain/campaign.ts`
```typescript
// Add to existing Campaign interface
interface CampaignAnalytics {
  campaignId: number
  period: DateRange
  totalSpend?: number // Manual input or from platform APIs
  totalRevenue: number // From orders with UTM params
  totalOrders: number
  roi: number // (Revenue - Spend) / Spend
  metrics: {
    impressions: number
    clicks: number
    ctr: number // Click-through rate
    conversionRate: number
    costPerAcquisition?: number
  }
  platformBreakdown: {
    platform: "facebook" | "tiktok" | "zalo" | "shopee"
    revenue: number
    orders: number
    clicks: number
  }[]
}
```

#### **Use Cases:** `core/application/usecases/analytics/campaign/`
1. **GetCampaignAnalyticsUseCase**
   - Input: `{ campaignId, startDate?, endDate? }`
   - Output: `CampaignAnalytics`
   - Logic: Join campaigns with orders via UTM params, aggregate metrics

2. **CompareCampaignsUseCase**
   - Input: `{ campaignIds: number[], startDate, endDate }`
   - Output: `CampaignAnalytics[]`
   - Logic: Side-by-side comparison

3. **GetPlatformPerformanceUseCase**
   - Input: `{ platform, startDate, endDate }`
   - Output: Platform-specific analytics

**Note:** Requires tracking UTM parameters in orders. Enhance Order entity:
```typescript
interface Order {
  // ... existing fields
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
}
```

#### **UI Implementation:** `app/(features)/admin/dashboard/analytics/campaigns/`
- Campaign performance comparison table
- ROI calculator
- Platform performance breakdown charts

---

### **Module 1.5: AI-Powered Forecasting** 🧠

**Business Goals:**
- Predict future revenue
- Forecast inventory needs
- Identify trends early
- Proactive decision support

#### **Domain Entity:** `core/domain/analytics/forecast.ts`
```typescript
interface RevenueForecast {
  forecastDate: Date
  predictedRevenue: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  actualRevenue?: number // For historical comparison
}

interface InventoryForecast {
  productId: number
  productName: string
  currentStock?: number
  predictedDemand: number // Next 7/30 days
  recommendedRestock: number
  daysUntilStockout?: number
}

interface ChurnPrediction {
  customerId: string
  customerName: string
  churnProbability: number // 0-1
  riskLevel: "low" | "medium" | "high"
  factors: string[] // "No purchase in 60 days", "Decreased order frequency", etc.
  recommendedAction: string
}
```

#### **Implementation Approach:**

**Option A: Simple Statistical Models (Initial Phase)**
- Use time-series analysis (moving averages, exponential smoothing)
- Libraries: `simple-statistics`, `regression-js`
- Calculate trends from historical data
- Good for MVP, no external API costs

**Option B: Machine Learning Integration (Advanced Phase)**
- Use OpenAI API for predictions
- Train on historical data
- More accurate but requires API costs
- Libraries: `@anthropic-ai/sdk` or `openai`

**Recommended: Start with Option A, migrate to Option B later**

#### **Use Cases:** `core/application/usecases/analytics/forecast/`
1. **GetRevenueForecastUseCase**
   - Input: `{ daysAhead: number, model?: "simple" | "ml" }`
   - Output: `RevenueForecast[]`
   - Logic: Time-series prediction based on historical revenue

2. **GetInventoryForecastUseCase**
   - Input: `{ productId?, daysAhead: number }`
   - Output: `InventoryForecast[]`
   - Logic: Predict demand based on sales velocity

3. **PredictCustomerChurnUseCase**
   - Input: `{ customerId? }`
   - Output: `ChurnPrediction[]`
   - Logic: Score customers based on recency, frequency, monetary value (RFM analysis)

4. **GetTrendAnalysisUseCase**
   - Input: `{ metric: "revenue" | "orders" | "customers", period: "week" | "month" }`
   - Output: `{ trend: "up" | "down" | "stable", changePercent: number, insights: string[] }`

#### **Repository:** `infrastructure/repositories/analytics/forecast-repo.ts`
- Historical data aggregation
- Caching for expensive calculations

#### **External Services:** `infrastructure/integrations/forecast-service.ts`
- If using ML: OpenAI/Anthropic API client
- Fallback to statistical methods if API fails

#### **UI Implementation:** `app/(features)/admin/dashboard/analytics/forecast/`

**Components:**
1. **RevenueForecastChart.tsx** - Line chart with predicted vs actual
2. **InventoryAlerts.tsx** - Products needing restock
3. **ChurnRiskDashboard.tsx** - At-risk customers with action buttons
4. **TrendInsights.tsx** - Automated insights (e.g., "Revenue trending up 15% this week")

---

## **🧠 Phase 2: AI-Powered CRM Assistant**

### **Module 2: Internal Chatbot**

**Business Goals:**
- Enable natural language queries to CRM data
- Reduce time spent on manual reporting
- Provide instant answers to common questions
- Generate reports on demand

#### **Domain Entity:** `core/domain/ai/chatbot.ts`
```typescript
interface ChatMessage {
  id: string
  userId: string // Staff member asking
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  metadata?: {
    queryType?: "customer" | "order" | "revenue" | "product" | "general"
    relatedEntities?: string[] // IDs of customers, orders, etc.
    confidence?: number
  }
}

interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

interface QueryIntent {
  type: "data_query" | "report_generation" | "recommendation" | "general"
  entities: {
    customers?: string[]
    products?: number[]
    dateRange?: DateRange
    status?: string
  }
  action: string // "list", "count", "sum", "compare", "generate_report"
}
```

#### **Use Cases:** `core/application/usecases/ai/chatbot/`

1. **ProcessChatQueryUseCase**
   - Input: `{ userId: string, message: string, sessionId?: string }`
   - Output: `{ response: string, data?: any, sessionId: string }`
   - Logic:
     1. Parse user intent (keyword matching or LLM-based)
     2. Extract entities (dates, customer names, product IDs)
     3. Route to appropriate data fetcher
     4. Format response in natural language
     5. Save to chat history

2. **GetChatHistoryUseCase**
   - Input: `{ userId: string, sessionId?: string, limit?: number }`
   - Output: `ChatSession[]`

3. **GenerateReportUseCase**
   - Input: `{ userId: string, reportType: string, parameters: any }`
   - Output: `{ reportUrl: string, format: "pdf" | "excel" }`
   - Logic: Use existing analytics use cases + PDF/Excel generation

#### **Implementation Strategy:**

**Phase 2.1: Rule-Based Chatbot (Quick Win)**
- Pattern matching for common queries
- Hardcoded responses mapped to use cases
- Example patterns:
  ```typescript
  const queryPatterns = {
    "doanh thu (tháng này|hôm nay)": () => getRevenueMetricsUseCase.execute({ ... }),
    "khách hàng (cần chăm sóc|chưa mua lại)": () => getChurnRiskCustomersUseCase.execute({ ... }),
    "top (\\d+) (sản phẩm|khách hàng)": (match) => getTopProducts/CustomersUseCase.execute({ limit: match[1] })
  }
  ```

**Phase 2.2: LLM-Powered Chatbot (Advanced)**
- Use Anthropic Claude API or OpenAI GPT
- Function calling to execute CRM queries
- More natural conversation flow
- Libraries: `@anthropic-ai/sdk`

**Recommended: Start with Phase 2.1, add Phase 2.2 later**

#### **Repository:** `infrastructure/repositories/chatbot-repo.ts`
- Store chat sessions in MongoDB
- Methods: createSession, saveMessage, getHistory

#### **External Integration:** `infrastructure/integrations/llm-service.ts`
```typescript
interface LLMService {
  parseIntent(userMessage: string): Promise<QueryIntent>
  generateResponse(data: any, context: string): Promise<string>
  suggestActions(customerData: any): Promise<string[]>
}

// Implementation using Anthropic Claude
class AnthropicLLMService implements LLMService {
  // ... uses @anthropic-ai/sdk
}
```

#### **API Endpoints:** `app/api/ai/chatbot/`
- `POST /api/ai/chatbot/query` - Send message, get response
- `GET /api/ai/chatbot/sessions` - Get chat history
- `POST /api/ai/chatbot/generate-report` - Generate PDF/Excel from query

#### **UI Implementation:** `app/(features)/admin/dashboard/ai-assistant/`

**Components:**
1. **page.tsx** - Chat interface
2. **components/ChatWindow.tsx** - Message display
   - User messages (right-aligned)
   - Assistant responses (left-aligned)
   - Loading indicator (typing animation)
   - Error handling

3. **components/ChatInput.tsx** - Text input with:
   - Auto-complete for common queries
   - Send button
   - Voice input (optional)

4. **components/QuickActions.tsx** - Predefined question buttons
   - "Doanh thu hôm nay?"
   - "Khách hàng cần chăm sóc?"
   - "Top 5 sản phẩm bán chạy?"

5. **components/DataVisualization.tsx** - Inline charts/tables in chat
   - Render charts when chatbot returns data
   - Download buttons for reports

**UI Library:**
- Shadcn UI components (Input, Button, ScrollArea)
- `react-markdown` for formatted responses
- `recharts` for inline charts

**WebSocket (Optional):** Real-time message streaming for LLM responses

---

## **❤️ Phase 3: Customer Care System**

### **Module 3.1: Support Ticket Management**

**Business Goals:**
- Centralize customer support requests
- Track resolution times
- Assign tickets to staff
- Maintain support quality

#### **Domain Entity:** `core/domain/customer-care/ticket.ts`
```typescript
interface SupportTicket {
  id: string // MongoDB ObjectId
  customerId: string
  subject: string
  description: string
  status: "pending" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: "order_issue" | "product_question" | "complaint" | "request" | "other"
  assignedTo?: string // Staff ID
  createdBy?: string // Staff who created (if internal)
  source: "zalo" | "facebook" | "phone" | "email" | "website" | "internal"
  attachments?: string[] // URLs to uploaded files
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  resolution?: string
  satisfactionRating?: number // 1-5 (set after resolution)
}

interface TicketActivity {
  id: string
  ticketId: string
  userId: string
  userName: string
  action: "created" | "assigned" | "status_changed" | "commented" | "resolved"
  details: string
  timestamp: Date
}

interface TicketComment {
  id: string
  ticketId: string
  userId: string
  userName: string
  content: string
  isInternal: boolean // Staff notes vs customer-facing
  createdAt: Date
}
```

#### **Use Cases:** `core/application/usecases/customer-care/ticket/`
1. **CreateTicketUseCase**
   - Input: `CreateTicketRequest`
   - Output: `{ ticket: SupportTicket }`
   - Validation: Required fields, valid customerId

2. **GetTicketsUseCase**
   - Input: `{ status?, assignedTo?, priority?, customerId?, startDate?, endDate?, page, limit }`
   - Output: `{ tickets: SupportTicket[], total: number }`
   - Pagination and filtering

3. **GetTicketByIdUseCase**
   - Input: `{ ticketId }`
   - Output: `{ ticket: SupportTicket, activities: TicketActivity[], comments: TicketComment[] }`

4. **UpdateTicketUseCase**
   - Input: `{ ticketId, updates: Partial<SupportTicket> }`
   - Output: `{ ticket: SupportTicket }`
   - Log activity on status change

5. **AssignTicketUseCase**
   - Input: `{ ticketId, assignedTo: string }`
   - Output: `{ ticket: SupportTicket }`
   - Send notification to assignee

6. **ResolveTicketUseCase**
   - Input: `{ ticketId, resolution: string }`
   - Output: `{ ticket: SupportTicket }`
   - Set resolvedAt timestamp, status to "resolved"

7. **AddTicketCommentUseCase**
   - Input: `{ ticketId, userId, content, isInternal }`
   - Output: `{ comment: TicketComment }`

8. **CloseTicketUseCase**
   - Input: `{ ticketId }`
   - Output: `{ ticket: SupportTicket }`
   - Archive ticket

9. **RateTicketUseCase**
   - Input: `{ ticketId, rating: number, feedback?: string }`
   - Output: `{ ticket: SupportTicket }`
   - Customer satisfaction scoring

#### **Repository:** `infrastructure/repositories/customer-care/ticket-repo.ts`
- Extends `BaseRepository<SupportTicket, string>`
- Methods for filtering, assignment, activity logging

#### **API Endpoints:** `app/api/customer-care/tickets/`
- `GET /api/customer-care/tickets?status=pending&assignedTo=...&page=1&limit=20`
- `POST /api/customer-care/tickets` - Create ticket
- `GET /api/customer-care/tickets/[id]` - Get ticket with activities
- `PATCH /api/customer-care/tickets/[id]` - Update ticket
- `POST /api/customer-care/tickets/[id]/assign` - Assign to staff
- `POST /api/customer-care/tickets/[id]/resolve` - Mark resolved
- `POST /api/customer-care/tickets/[id]/comments` - Add comment
- `POST /api/customer-care/tickets/[id]/close` - Close ticket
- `POST /api/customer-care/tickets/[id]/rate` - Customer rating

#### **UI Implementation:** `app/(features)/admin/dashboard/customer-care/tickets/`

**Components:**
1. **page.tsx** - Ticket list view
   - Server Component fetching tickets
   - Filter sidebar (status, priority, assigned to)
   - Pagination

2. **components/TicketList.tsx** - Table with:
   - Ticket ID, subject, customer name
   - Status badge, priority badge
   - Assigned to (avatar + name)
   - Created date, updated date
   - SLA indicator (time to resolution)
   - Quick actions (assign, resolve)

3. **components/TicketDetailModal.tsx** - Full ticket view
   - Header: ID, status, priority, customer info
   - Description and attachments
   - Activity timeline
   - Comment thread (internal + customer-facing)
   - Action buttons (assign, change status, resolve, close)

4. **components/TicketForm.tsx** - Create/edit ticket
   - Customer selector (autocomplete)
   - Subject, description
   - Priority, category dropdowns
   - File upload for attachments

5. **components/TicketFilters.tsx** - Filter sidebar
   - Status checkboxes
   - Priority checkboxes
   - Assigned to multi-select
   - Date range picker
   - Reset filters button

6. **components/TicketStats.tsx** - KPI cards
   - Total open tickets
   - Average resolution time
   - Tickets by priority
   - Tickets by status

**Real-time Updates (Optional):**
- WebSocket for live ticket updates
- Notify staff when assigned to ticket

---

### **Module 3.2: Customer Communication**

**Business Goals:**
- Send targeted messages to customer segments
- Use templates for consistency
- Track message delivery and engagement
- Automate follow-ups

#### **Domain Entity:** `core/domain/customer-care/communication.ts`
```typescript
interface MessageCampaign {
  id: string
  name: string
  subject?: string // For emails
  content: string
  channel: "zalo" | "facebook" | "email" | "sms"
  templateId?: string // Reference to MessageTemplate
  targetAudience: {
    type: "all" | "segment" | "individual" | "custom_filter"
    customerIds?: string[]
    segmentCriteria?: {
      tier?: CustomerTier[]
      minRevenue?: number
      minOrders?: number
      lastPurchaseWithin?: number // days
      hasNotPurchasedFor?: number // days
    }
  }
  scheduledFor?: Date
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  sentAt?: Date
  stats?: {
    totalRecipients: number
    sentCount: number
    deliveredCount: number
    failedCount: number
    openedCount?: number // For emails
    clickedCount?: number
  }
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

interface MessageTemplate {
  id: string
  name: string
  description?: string
  channel: "zalo" | "facebook" | "email" | "sms" | "multi"
  subject?: string
  content: string // Supports variables like {{customerName}}, {{productName}}
  variables: string[] // ["customerName", "orderTotal", etc.]
  category: "greeting" | "order_confirmation" | "shipping_update" | "follow_up" | "promotion" | "satisfaction_survey"
  isActive: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

interface SentMessage {
  id: string
  campaignId?: string
  customerId: string
  channel: "zalo" | "facebook" | "email" | "sms"
  subject?: string
  content: string
  status: "pending" | "sent" | "delivered" | "failed" | "opened" | "clicked"
  externalId?: string // Message ID from platform (Zalo, FB, etc.)
  error?: string
  sentBy: string
  sentAt: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
}
```

#### **Use Cases:** `core/application/usecases/customer-care/communication/`

**Message Campaign:**
1. **CreateMessageCampaignUseCase**
2. **GetMessageCampaignsUseCase** - List with filters
3. **UpdateMessageCampaignUseCase**
4. **SendMessageCampaignUseCase**
   - Input: `{ campaignId }`
   - Logic:
     1. Resolve target audience (get customer IDs)
     2. For each customer: render template with variables
     3. Queue messages for sending (use BullMQ)
     4. Update campaign status
5. **ScheduleMessageCampaignUseCase**
6. **GetCampaignStatsUseCase**

**Message Templates:**
7. **CreateMessageTemplateUseCase**
8. **GetMessageTemplatesUseCase**
9. **UpdateMessageTemplateUseCase**
10. **DeleteMessageTemplateUseCase**
11. **RenderTemplateUseCase**
    - Input: `{ templateId, variables: Record<string, any> }`
    - Output: `{ renderedContent: string }`
    - Replace {{variable}} with actual values

**Message Sending:**
12. **SendSingleMessageUseCase**
    - Input: `{ customerId, channel, content, subject?, templateId? }`
    - Output: `{ message: SentMessage }`
13. **GetSentMessagesUseCase**
    - Filter by customer, campaign, channel, status
14. **UpdateMessageStatusUseCase**
    - Webhook handler for delivery/read receipts

#### **Background Jobs:** `infrastructure/queue/jobs/send-message-job.ts`
- BullMQ job to send messages in batches
- Retry logic for failed sends
- Rate limiting to avoid platform limits

#### **External Integrations:** `infrastructure/integrations/messaging/`
1. **ZaloMessageService** - Uses existing Zalo OA API
2. **FacebookMessengerService** - Facebook Graph API
3. **EmailService** - Nodemailer or SendGrid
4. **SMSService** - Twilio or Viettel SMS Gateway

#### **Repository:** `infrastructure/repositories/customer-care/`
- **MessageCampaignRepository**
- **MessageTemplateRepository**
- **SentMessageRepository**

#### **API Endpoints:** `app/api/customer-care/messages/`
- `GET /api/customer-care/messages/campaigns`
- `POST /api/customer-care/messages/campaigns`
- `POST /api/customer-care/messages/campaigns/[id]/send`
- `GET /api/customer-care/messages/campaigns/[id]/stats`
- `GET /api/customer-care/messages/templates`
- `POST /api/customer-care/messages/templates`
- `POST /api/customer-care/messages/send` - Send single message
- `GET /api/customer-care/messages/sent?customerId=...&campaignId=...`
- `POST /api/customer-care/messages/webhook` - Delivery status updates

#### **UI Implementation:** `app/(features)/admin/dashboard/customer-care/messages/`

**Pages:**
1. **campaigns/page.tsx** - Campaign list
   - Status badges (draft, scheduled, sending, sent)
   - Quick stats (recipients, sent, delivered)
   - Actions: Edit, Send, Duplicate, Delete

2. **campaigns/create/page.tsx** - Campaign builder
   - Step 1: Campaign details (name, channel)
   - Step 2: Select template or write content
   - Step 3: Define audience (segment, filter, individual)
   - Step 4: Preview and schedule
   - Audience size preview

3. **templates/page.tsx** - Template library
   - Grid/list view
   - Category filter
   - Usage count
   - Create, edit, delete, duplicate

4. **templates/create/page.tsx** - Template editor
   - Channel selector
   - Content editor with variable insertion
   - Variable list (drag-and-drop)
   - Preview with sample data

5. **sent/page.tsx** - Sent messages log
   - Table with recipient, channel, status, sent time
   - Filters: customer, campaign, channel, status, date range
   - Retry failed messages

**Components:**
- **TemplateVariableInserter.tsx** - Button to insert {{variables}}
- **AudienceSelector.tsx** - UI for building audience filters
- **AudiencePreview.tsx** - Show customer count and sample names
- **MessagePreview.tsx** - Render template with sample data
- **CampaignStatsCard.tsx** - Sent, delivered, opened, clicked metrics

---

### **Module 3.3: Customer Interaction History**

**Business Goals:**
- Centralized view of all customer touchpoints
- Track who contacted customers and when
- Context for future interactions
- Audit trail

#### **Domain Entity:** `core/domain/customer-care/interaction.ts`
```typescript
interface CustomerInteraction {
  id: string
  customerId: string
  type: "call" | "message" | "email" | "meeting" | "note" | "ticket" | "order"
  direction: "inbound" | "outbound" | "internal"
  channel: "zalo" | "facebook" | "phone" | "email" | "in_person" | "system"
  subject?: string
  content: string
  outcome?: "successful" | "no_answer" | "follow_up_needed" | "issue_resolved"
  relatedEntities?: {
    orderId?: number
    ticketId?: string
    campaignId?: string
  }
  performedBy: string // Staff ID
  performedByName: string
  timestamp: Date
  nextFollowUpDate?: Date
  attachments?: string[]
}

interface InteractionSummary {
  customerId: string
  totalInteractions: number
  lastInteractionDate: Date
  lastInteractionType: string
  interactionsByChannel: { channel: string; count: number }[]
  interactionsByStaff: { staffId: string; staffName: string; count: number }[]
  upcomingFollowUps: CustomerInteraction[]
}
```

#### **Use Cases:** `core/application/usecases/customer-care/interaction/`
1. **LogInteractionUseCase**
   - Input: `CreateInteractionRequest`
   - Output: `{ interaction: CustomerInteraction }`
   - Auto-log certain actions (order created, ticket created, message sent)

2. **GetCustomerInteractionsUseCase**
   - Input: `{ customerId, type?, channel?, startDate?, endDate?, performedBy?, page, limit }`
   - Output: `{ interactions: CustomerInteraction[], total: number }`

3. **GetInteractionSummaryUseCase**
   - Input: `{ customerId }`
   - Output: `InteractionSummary`

4. **GetFollowUpTasksUseCase**
   - Input: `{ staffId?, dueDate?, overdue: boolean }`
   - Output: `CustomerInteraction[]` (interactions needing follow-up)

5. **UpdateInteractionUseCase**
   - Mark as completed, add outcome

6. **GetStaffInteractionsUseCase**
   - Track staff activity

#### **Auto-Logging Strategy:**
- Automatically create interactions when:
  - Order is created → Interaction (type: "order", channel: "system")
  - Ticket is created → Interaction (type: "ticket")
  - Message is sent (Module 3.2) → Interaction (type: "message")
  - Staff manually adds note → Interaction (type: "note")

#### **Repository:** `infrastructure/repositories/customer-care/interaction-repo.ts`
- Extends `BaseRepository<CustomerInteraction, string>`
- Aggregation methods for summaries

#### **API Endpoints:** `app/api/customer-care/interactions/`
- `POST /api/customer-care/interactions` - Log interaction
- `GET /api/customer-care/interactions?customerId=...&type=...&page=1`
- `GET /api/customer-care/interactions/summary?customerId=...`
- `GET /api/customer-care/interactions/follow-ups?staffId=...&overdue=true`
- `PATCH /api/customer-care/interactions/[id]` - Update

#### **UI Implementation:** `app/(features)/admin/dashboard/customer-care/interactions/`

**Integration Points:**
- Add "Interaction History" tab to customer detail page
- Add "My Follow-Ups" widget to dashboard
- Add "Log Interaction" button on customer/order pages

**Components:**
1. **CustomerInteractionTimeline.tsx** - Visual timeline
   - Chronological list of all interactions
   - Icons for each type (call, email, order, ticket, etc.)
   - Staff avatar and name
   - Expandable details
   - "Add Note" quick action

2. **InteractionForm.tsx** - Modal to log interaction
   - Type selector (call, meeting, note, etc.)
   - Outcome dropdown
   - Content textarea
   - Next follow-up date picker
   - File attachments

3. **FollowUpTasksList.tsx** - To-do list for staff
   - Customer name + last interaction
   - Due date (color-coded: overdue, today, upcoming)
   - Mark as complete action
   - Quick call/message actions

4. **InteractionStatsWidget.tsx** - For customer detail page
   - Total interactions
   - Last contact date
   - Breakdown by channel (pie chart)
   - Next follow-up date

---

### **Module 3.4: Customer Satisfaction Surveys**

**Business Goals:**
- Measure customer satisfaction (CSAT, NPS)
- Identify pain points
- Track improvement over time
- Trigger alerts for negative feedback

#### **Domain Entity:** `core/domain/customer-care/survey.ts`
```typescript
interface Survey {
  id: string
  name: string
  description?: string
  type: "csat" | "nps" | "ces" | "custom" // Customer Satisfaction, Net Promoter Score, Customer Effort Score
  questions: SurveyQuestion[]
  trigger: {
    type: "manual" | "post_order" | "post_ticket_resolution" | "scheduled"
    delay?: number // days after trigger event
    conditions?: any
  }
  channel: "zalo" | "email" | "sms" | "in_app"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface SurveyQuestion {
  id: string
  text: string
  type: "rating" | "scale" | "multiple_choice" | "text" | "yes_no"
  required: boolean
  options?: string[] // For multiple choice
  scale?: { min: number; max: number; labels?: { min: string; max: string } }
}

interface SurveyResponse {
  id: string
  surveyId: string
  customerId: string
  relatedOrderId?: number
  relatedTicketId?: string
  answers: SurveyAnswer[]
  score?: number // Calculated score (CSAT: avg rating, NPS: 0-10 score)
  sentiment: "positive" | "neutral" | "negative"
  submittedAt: Date
}

interface SurveyAnswer {
  questionId: string
  answer: string | number | string[] // Depends on question type
}

interface SurveyAnalytics {
  surveyId: string
  period: DateRange
  totalResponses: number
  averageScore: number
  npsScore?: number // NPS = % Promoters - % Detractors
  csatScore?: number // Average rating
  responseRate: number // Responses / Total sent
  sentimentDistribution: {
    positive: number
    neutral: number
    negative: number
  }
  trendOverTime: { date: Date; score: number }[]
}
```

#### **Use Cases:** `core/application/usecases/customer-care/survey/`
1. **CreateSurveyUseCase**
2. **GetSurveysUseCase**
3. **UpdateSurveyUseCase**
4. **DeleteSurveyUseCase**
5. **SendSurveyUseCase**
   - Input: `{ surveyId, customerId, relatedOrderId?, relatedTicketId? }`
   - Logic: Send via selected channel (Zalo, email, SMS)
6. **SubmitSurveyResponseUseCase**
   - Input: `{ surveyId, customerId, answers }`
   - Output: `{ response: SurveyResponse }`
   - Calculate score and sentiment
7. **GetSurveyResponsesUseCase**
8. **GetSurveyAnalyticsUseCase**
   - Aggregate responses, calculate NPS/CSAT
9. **TriggerSurveyUseCase**
   - Auto-send based on triggers (e.g., 3 days after order completion)

#### **Background Jobs:** `infrastructure/queue/jobs/survey-trigger-job.ts`
- Daily cron job to check for survey triggers
- Send surveys based on conditions

#### **Repository:** `infrastructure/repositories/customer-care/survey-repo.ts`

#### **API Endpoints:** `app/api/customer-care/surveys/`
- `GET /api/customer-care/surveys`
- `POST /api/customer-care/surveys`
- `PATCH /api/customer-care/surveys/[id]`
- `DELETE /api/customer-care/surveys/[id]`
- `POST /api/customer-care/surveys/[id]/send`
- `POST /api/customer-care/surveys/[id]/responses` - Submit response
- `GET /api/customer-care/surveys/[id]/responses`
- `GET /api/customer-care/surveys/[id]/analytics`

#### **Public Survey Page:** `app/survey/[surveyId]/[customerId]/page.tsx`
- Public-facing survey form (no auth required)
- Render questions dynamically
- Thank you page after submission

#### **UI Implementation:** `app/(features)/admin/dashboard/customer-care/surveys/`

**Components:**
1. **SurveyList.tsx** - List of surveys
   - Type badges (CSAT, NPS, etc.)
   - Active/inactive status
   - Response count
   - Average score
   - Actions: Edit, View analytics, Send manually, Duplicate

2. **SurveyBuilder.tsx** - Drag-and-drop survey creator
   - Question type selector
   - Question editor
   - Preview panel
   - Trigger configuration

3. **SurveyAnalyticsDashboard.tsx** - Analytics view
   - KPI cards (avg score, NPS, response rate)
   - Trend chart (score over time)
   - Sentiment pie chart
   - Response list (with negative feedback highlighted)
   - Export to CSV

4. **SurveyResponseDetail.tsx** - Individual response view
   - Customer info
   - All answers
   - Sentiment badge
   - Related order/ticket links

5. **NPSWidget.tsx** - Dashboard widget
   - Current NPS score
   - Trend indicator
   - Promoters/Passives/Detractors breakdown

---

### **Module 3.5: AI-Generated Message Templates**

**Business Goals:**
- Reduce time creating messages
- Personalize communication at scale
- Maintain consistent tone
- Suggest best practices

#### **Use Cases:** `core/application/usecases/customer-care/ai-template/`
1. **GenerateTemplateUseCase**
   - Input: `{ purpose: string, tone: string, variables: string[], channel: string, customerId?: string }`
   - Output: `{ generatedContent: string, suggestedSubject?: string }`
   - Logic:
     1. Build prompt for LLM: "Generate a [tone] message for [purpose] on [channel] using variables [variables]"
     2. If customerId provided, fetch customer data for context (purchase history, tier)
     3. Call Anthropic/OpenAI API
     4. Return generated content

2. **PersonalizeMessageUseCase**
   - Input: `{ templateContent: string, customerId: string }`
   - Output: `{ personalizedContent: string }`
   - Logic:
     1. Fetch customer data (name, purchase history, tier, preferences)
     2. Ask LLM to personalize the template based on customer context
     3. Replace variables

3. **SuggestFollowUpMessageUseCase**
   - Input: `{ customerId: string, lastInteraction: CustomerInteraction }`
   - Output: `{ suggestedMessages: string[] }` // Multiple options
   - Logic:
     1. Analyze customer history
     2. Generate contextual follow-up suggestions

4. **OptimizeTemplateUseCase**
   - Input: `{ templateContent: string, metrics?: TemplateMetrics }`
   - Output: `{ optimizedContent: string, suggestions: string[] }`
   - Logic: Ask LLM to improve template based on best practices

#### **LLM Prompts:** `infrastructure/integrations/llm-service.ts`
```typescript
const TEMPLATE_GENERATION_PROMPT = `
You are a customer service expert for a Vietnamese seafood e-commerce company.
Generate a ${tone} message for the following purpose: ${purpose}
Channel: ${channel}
Available variables: ${variables.join(', ')}

Guidelines:
- Use Vietnamese language
- Be friendly and professional
- Keep it concise (2-3 sentences for Zalo, longer for email)
- Include a clear call-to-action
- Use the provided variables where appropriate

${customerContext ? `Customer context: ${customerContext}` : ''}

Generate the message content:
`;
```

#### **External Integration:** Uses existing `infrastructure/integrations/llm-service.ts`
- Anthropic Claude API for Vietnamese language support
- Caching for common template types

#### **API Endpoints:** `app/api/customer-care/ai-templates/`
- `POST /api/customer-care/ai-templates/generate`
- `POST /api/customer-care/ai-templates/personalize`
- `POST /api/customer-care/ai-templates/suggest-follow-up`
- `POST /api/customer-care/ai-templates/optimize`

#### **UI Integration:**
- Add "Generate with AI" button to message composer (Module 3.2)
- Add "Personalize" button when editing templates
- Show AI suggestions in chat interface (Module 2)

**Components:**
1. **AITemplateGenerator.tsx** - Modal dialog
   - Purpose input (dropdown: order confirmation, follow-up, promotion, etc.)
   - Tone selector (friendly, professional, urgent)
   - Variable selector (checkboxes)
   - Generate button
   - Loading state
   - Display 2-3 options to choose from

2. **PersonalizationPanel.tsx** - Sidebar
   - Customer context display
   - "Apply personalization" button
   - Before/after preview

3. **AIAssistantButton.tsx** - Floating action button
   - Always available in message/template editors
   - Opens AI assistant

---

## **🔧 Phase 4: Technical Foundations**

### **Required Infrastructure Upgrades**

#### **4.1: Chart Library Integration**
- Install `recharts` for React-based charts
  ```bash
  npm install recharts
  ```
- Create reusable chart components in `app/components/charts/`
  - LineChart wrapper
  - BarChart wrapper
  - PieChart wrapper
  - AreaChart wrapper

#### **4.2: Background Job Queue Enhancement**
- Extend existing BullMQ setup
- New queues:
  - `message-sending` (Module 3.2)
  - `survey-triggers` (Module 3.4)
  - `analytics-aggregation` (Module 1.x) - pre-calculate metrics daily
- Worker scaling configuration

#### **4.3: External API Integrations**
- **Anthropic Claude SDK** (for AI features)
  ```bash
  npm install @anthropic-ai/sdk
  ```
- **Email Service** (pick one):
  - Nodemailer (free, self-hosted)
  - SendGrid (transactional emails)
- **SMS Gateway** (optional):
  - Twilio
  - Viettel SMS

#### **4.4: Database Indexes**
Add MongoDB indexes for query performance:
```javascript
// Orders collection
db.orders.createIndex({ createdAt: -1 })
db.orders.createIndex({ status: 1, createdAt: -1 })
db.orders.createIndex({ customerId: 1, createdAt: -1 })
db.orders.createIndex({ "utmCampaign": 1 }) // For campaign analytics

// Customers collection
db.customers.createIndex({ tier: 1 })
db.customers.createIndex({ foundation: 1 })

// Support Tickets
db.support_tickets.createIndex({ status: 1, priority: 1 })
db.support_tickets.createIndex({ customerId: 1, createdAt: -1 })
db.support_tickets.createIndex({ assignedTo: 1, status: 1 })

// Interactions
db.customer_interactions.createIndex({ customerId: 1, timestamp: -1 })
db.customer_interactions.createIndex({ performedBy: 1, timestamp: -1 })
db.customer_interactions.createIndex({ nextFollowUpDate: 1 })

// Survey Responses
db.survey_responses.createIndex({ surveyId: 1, submittedAt: -1 })
db.survey_responses.createIndex({ customerId: 1 })
```

#### **4.5: Caching Strategy**
- Use Redis for:
  - Analytics data caching (TTL: 5-15 minutes)
  - LLM response caching (identical prompts)
  - Expensive aggregations

#### **4.6: File Upload Enhancement**
- Extend AWS S3 integration for:
  - Ticket attachments
  - Survey images
  - Message attachments
- Add file validation and virus scanning (optional)

---

## **📅 Implementation Timeline & Prioritization**

### **Sprint 1 (2 weeks): Foundation + Quick Wins**
- [ ] Module 1.1: Revenue Analytics (core KPIs + basic charts)
- [ ] Module 3.1: Support Ticket System (CRUD only, no advanced features)
- [ ] Install chart libraries and create base components
- [ ] Database indexes

**Deliverables:**
- Revenue dashboard with basic metrics
- Ticket creation and management UI
- Foundation for future modules

---

### **Sprint 2 (2 weeks): Customer Insights**
- [ ] Module 1.2: Customer Behavior Analytics
- [ ] Module 3.2: Message Templates (static, no AI yet)
- [ ] Module 3.3: Interaction History (basic logging)

**Deliverables:**
- Customer segmentation dashboard
- Template library
- Interaction timeline on customer page

---

### **Sprint 3 (2 weeks): AI Features - Phase 1**
- [ ] Module 2: Internal Chatbot (rule-based version)
- [ ] Module 3.5: AI Template Generation (integrate Anthropic)
- [ ] LLM service infrastructure

**Deliverables:**
- Working chatbot with pattern matching
- AI-powered message generation
- Template personalization

---

### **Sprint 4 (2 weeks): Communication & Automation**
- [ ] Module 3.2: Message Campaigns (sending functionality)
- [ ] Module 3.4: Customer Satisfaction Surveys
- [ ] Background jobs for message sending and survey triggers

**Deliverables:**
- Campaign builder and sender
- Survey system with NPS/CSAT
- Automated survey triggers

---

### **Sprint 5 (2 weeks): Advanced Analytics**
- [ ] Module 1.3: Staff Performance Analytics
- [ ] Module 1.4: Campaign Performance Analytics
- [ ] Order schema enhancement (UTM tracking, assignedTo field)

**Deliverables:**
- Staff leaderboard
- Campaign ROI dashboard
- Enhanced order tracking

---

### **Sprint 6 (2 weeks): AI Features - Phase 2**
- [ ] Module 1.5: AI Forecasting (statistical models first)
- [ ] Module 2: Upgrade to LLM-powered chatbot
- [ ] Module 3.2: AI-suggested campaign audiences

**Deliverables:**
- Revenue forecasting
- Churn prediction
- Smarter chatbot with LLM

---

### **Sprint 7+ (Ongoing): Polish & Optimization**
- [ ] Performance optimization (query tuning, caching)
- [ ] Mobile responsiveness improvements
- [ ] Real-time features (WebSocket for tickets, chat)
- [ ] Advanced AI models (ML-based forecasting)
- [ ] Additional integrations (email, SMS gateways)

---

## **🎯 Success Metrics**

### **Analytics Modules**
- **Adoption:** 80%+ of staff access analytics weekly
- **Accuracy:** Revenue predictions within 10% of actuals
- **Performance:** All dashboard queries < 3 seconds

### **AI Chatbot**
- **Usage:** 50+ queries per week
- **Accuracy:** 70%+ query success rate (intent correctly understood)
- **Time Savings:** Reduce reporting time by 50%

### **Customer Care**
- **Ticket Resolution:** Average resolution time < 24 hours
- **Message Engagement:** 30%+ open rate for campaigns
- **Satisfaction:** NPS score > 50, CSAT > 4.0/5.0
- **Follow-up Compliance:** 90%+ of follow-ups completed on time

---

## **🚧 Technical Debt & Considerations**

### **Known Limitations**
1. **Forecasting Accuracy:** Initial statistical models will be less accurate than ML models
2. **LLM Costs:** Anthropic API calls can be expensive at scale - implement caching and quotas
3. **Real-time Updates:** Current implementation is pull-based; WebSocket would improve UX
4. **Multi-language Support:** Templates are Vietnamese-only; internationalization needed for expansion

### **Scalability Concerns**
1. **Large Dataset Analytics:** Aggregations may slow down with 100k+ orders
   - **Solution:** Pre-calculated metrics (daily cron jobs)
2. **Message Sending:** Bulk campaigns could hit rate limits
   - **Solution:** Queue-based sending with rate limiting
3. **LLM Response Times:** AI features can be slow (2-5 seconds)
   - **Solution:** Streaming responses, background processing

### **Security & Privacy**
1. **Customer Data in LLM:** Never send PII to external APIs without encryption/anonymization
2. **Message Permissions:** Role-based access (only sales/admin can send campaigns)
3. **Survey Data:** GDPR-like considerations for data retention

---

## **📚 Additional Resources Needed**

### **NPM Packages**
```json
{
  "recharts": "^2.10.0",
  "@anthropic-ai/sdk": "^0.30.0",
  "nodemailer": "^6.9.0",
  "simple-statistics": "^7.8.0",
  "react-markdown": "^9.0.0",
  "date-fns": "^3.0.0"
}
```

### **Documentation to Create**
1. Analytics API documentation (Swagger/OpenAPI)
2. AI chatbot query examples
3. Message template variable reference
4. Survey builder user guide
5. LLM prompt engineering guidelines

---

## **💻 Implementation Examples (Based on Existing Patterns)**

### **Example 1: Revenue Analytics Actions**

Following the existing pattern in `app/(features)/admin/actions.ts`, here's how to implement analytics actions:

**File:** `app/(features)/admin/dashboard/analytics/revenue/actions.ts`

```typescript
"use server"

import {
  getRevenueMetricsUseCase,
  getRevenueTimeSeriesUseCase,
  getTopProductsUseCase,
  getTopCustomersUseCase,
} from "@/app/api/analytics/revenue/depends"

export async function getRevenueMetricsAction(
  startDate: string,
  endDate: string,
  compareStartDate?: string,
  compareEndDate?: string
) {
  try {
    const useCase = await getRevenueMetricsUseCase()
    const result = await useCase.execute({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      comparisonStartDate: compareStartDate ? new Date(compareStartDate) : undefined,
      comparisonEndDate: compareEndDate ? new Date(compareEndDate) : undefined,
    })

    // Serialize dates for JSON transport
    return JSON.parse(JSON.stringify(result.metrics))
  } catch (error) {
    console.error("Error fetching revenue metrics:", error)
    return null
  }
}

export async function getRevenueTimeSeriesAction(
  startDate: string,
  endDate: string,
  granularity: "day" | "week" | "month" = "day"
) {
  try {
    const useCase = await getRevenueTimeSeriesUseCase()
    const result = await useCase.execute({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      granularity,
    })

    return JSON.parse(JSON.stringify(result.timeSeries))
  } catch (error) {
    console.error("Error fetching revenue time series:", error)
    return null
  }
}

export async function getTopProductsAction(
  startDate: string,
  endDate: string,
  limit: number = 10
) {
  try {
    const useCase = await getTopProductsUseCase()
    const result = await useCase.execute({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      limit,
    })

    return result.products
  } catch (error) {
    console.error("Error fetching top products:", error)
    return []
  }
}

export async function getTopCustomersAction(
  startDate: string,
  endDate: string,
  limit: number = 10
) {
  try {
    const useCase = await getTopCustomersUseCase()
    const result = await useCase.execute({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      limit,
    })

    return result.customers
  } catch (error) {
    console.error("Error fetching top customers:", error)
    return []
  }
}
```

---

### **Example 2: Support Ticket Actions**

Following the pattern in `app/(features)/admin/dashboard/orders/actions.ts`:

**File:** `app/(features)/admin/dashboard/customer-care/tickets/actions.ts`

```typescript
"use server"

import { revalidatePath } from "next/cache"
import {
  getTicketsUseCase,
  createTicketUseCase,
  updateTicketUseCase,
  assignTicketUseCase,
  resolveTicketUseCase,
  addTicketCommentUseCase,
} from "@/app/api/customer-care/tickets/depends"
import type { TicketStatus, TicketPriority } from "@/core/domain/customer-care/ticket"

export async function getTicketsAction(
  status?: TicketStatus,
  assignedTo?: string,
  priority?: TicketPriority,
  customerId?: string
) {
  try {
    const useCase = await getTicketsUseCase()
    const result = await useCase.execute({
      status,
      assignedTo,
      priority,
      customerId
    })

    // Serialize dates
    return JSON.parse(JSON.stringify(result.tickets))
  } catch (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
}

export async function createTicketAction(formData: FormData) {
  const useCase = await createTicketUseCase()

  await useCase.execute({
    customerId: formData.get("customerId")?.toString() || "",
    subject: formData.get("subject")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    priority: formData.get("priority")?.toString() as TicketPriority || "medium",
    category: formData.get("category")?.toString() as any || "other",
    source: formData.get("source")?.toString() as any || "internal",
  })

  revalidatePath("/customer-care/tickets")
}

export async function updateTicketStatusAction(ticketId: string, status: TicketStatus) {
  const useCase = await updateTicketUseCase()

  await useCase.execute({
    ticketId,
    updates: { status }
  })

  revalidatePath("/customer-care/tickets")
}

export async function assignTicketAction(ticketId: string, assignedTo: string) {
  const useCase = await assignTicketUseCase()

  await useCase.execute({ ticketId, assignedTo })

  revalidatePath("/customer-care/tickets")
}

export async function resolveTicketAction(ticketId: string, resolution: string) {
  const useCase = await resolveTicketUseCase()

  await useCase.execute({ ticketId, resolution })

  revalidatePath("/customer-care/tickets")
}

export async function addCommentAction(formData: FormData) {
  const useCase = await addTicketCommentUseCase()

  await useCase.execute({
    ticketId: formData.get("ticketId")?.toString() || "",
    userId: formData.get("userId")?.toString() || "",
    content: formData.get("content")?.toString() || "",
    isInternal: formData.get("isInternal") === "true",
  })

  revalidatePath("/customer-care/tickets")
}
```

---

### **Example 3: Depends Pattern for Use Case Factories**

Following the existing pattern in `app/api/orders/depends.ts`:

**File:** `app/api/analytics/revenue/depends.ts`

```typescript
import { RevenueAnalyticsRepository } from "@/infrastructure/repositories/analytics/revenue-analytics-repo"
import { GetRevenueMetricsUseCase } from "@/core/application/usecases/analytics/revenue/get-revenue-metrics"
import { GetRevenueTimeSeriesUseCase } from "@/core/application/usecases/analytics/revenue/get-revenue-time-series"
import { GetTopProductsUseCase } from "@/core/application/usecases/analytics/revenue/get-top-products"
import { GetTopCustomersUseCase } from "@/core/application/usecases/analytics/revenue/get-top-customers"
import type { RevenueAnalyticsService } from "@/core/application/interfaces/analytics/revenue-analytics-service"

// Factory function to create repository instance
const createRevenueAnalyticsRepository = async (): Promise<RevenueAnalyticsService> => {
  return new RevenueAnalyticsRepository()
}

// Use case factories
export const getRevenueMetricsUseCase = async () => {
  const service = await createRevenueAnalyticsRepository()
  return new GetRevenueMetricsUseCase(service)
}

export const getRevenueTimeSeriesUseCase = async () => {
  const service = await createRevenueAnalyticsRepository()
  return new GetRevenueTimeSeriesUseCase(service)
}

export const getTopProductsUseCase = async () => {
  const service = await createRevenueAnalyticsRepository()
  return new GetTopProductsUseCase(service)
}

export const getTopCustomersUseCase = async () => {
  const service = await createRevenueAnalyticsRepository()
  return new GetTopCustomersUseCase(service)
}
```

**File:** `app/api/customer-care/tickets/depends.ts`

```typescript
import { TicketRepository } from "@/infrastructure/repositories/customer-care/ticket-repo"
import { CreateTicketUseCase } from "@/core/application/usecases/customer-care/ticket/create-ticket"
import { GetTicketsUseCase } from "@/core/application/usecases/customer-care/ticket/get-tickets"
import { UpdateTicketUseCase } from "@/core/application/usecases/customer-care/ticket/update-ticket"
import { AssignTicketUseCase } from "@/core/application/usecases/customer-care/ticket/assign-ticket"
import { ResolveTicketUseCase } from "@/core/application/usecases/customer-care/ticket/resolve-ticket"
import { AddTicketCommentUseCase } from "@/core/application/usecases/customer-care/ticket/add-comment"
import type { TicketService } from "@/core/application/interfaces/customer-care/ticket-service"

const createTicketRepository = async (): Promise<TicketService> => {
  return new TicketRepository()
}

export const createTicketUseCase = async () => {
  const service = await createTicketRepository()
  return new CreateTicketUseCase(service)
}

export const getTicketsUseCase = async () => {
  const service = await createTicketRepository()
  return new GetTicketsUseCase(service)
}

export const updateTicketUseCase = async () => {
  const service = await createTicketRepository()
  return new UpdateTicketUseCase(service)
}

export const assignTicketUseCase = async () => {
  const service = await createTicketRepository()
  return new AssignTicketUseCase(service)
}

export const resolveTicketUseCase = async () => {
  const service = await createTicketRepository()
  return new ResolveTicketUseCase(service)
}

export const addTicketCommentUseCase = async () => {
  const service = await createTicketRepository()
  return new AddTicketCommentUseCase(service)
}
```

---

### **Example 4: Dashboard Page Integration**

Based on `app/(features)/admin/dashboard/page.tsx`, here's how to integrate analytics:

**File:** `app/(features)/admin/dashboard/analytics/revenue/page.tsx`

```typescript
import { getRevenueMetricsAction, getRevenueTimeSeriesAction, getTopProductsAction } from "./actions"
import RevenueMetricsCards from "./components/RevenueMetricsCards"
import RevenueTimeSeriesChart from "./components/RevenueTimeSeriesChart"
import TopProductsTable from "./components/TopProductsTable"
import DateRangeSelector from "./components/DateRangeSelector"

export default async function RevenueAnalyticsPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string; granularity?: string }
}) {
  // Default to last 30 days
  const endDate = searchParams.endDate || new Date().toISOString().split('T')[0]
  const startDate = searchParams.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const granularity = (searchParams.granularity as "day" | "week" | "month") || "day"

  // Fetch data using server actions
  const metrics = await getRevenueMetricsAction(startDate, endDate)
  const timeSeries = await getRevenueTimeSeriesAction(startDate, endDate, granularity)
  const topProducts = await getTopProductsAction(startDate, endDate, 10)

  if (!metrics) {
    return <div>Error loading analytics data</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Revenue Analytics</h1>
        <DateRangeSelector />
      </div>

      {/* KPI Cards */}
      <RevenueMetricsCards metrics={metrics} />

      {/* Time Series Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend</h2>
        <RevenueTimeSeriesChart data={timeSeries || []} />
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Products</h2>
        <TopProductsTable products={topProducts || []} />
      </div>
    </div>
  )
}
```

---

### **Example 5: Client Component with Shadcn UI**

**File:** `app/(features)/admin/dashboard/analytics/revenue/components/RevenueMetricsCards.tsx`

```typescript
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, CreditCard } from "lucide-react"
import type { RevenueMetrics } from "@/core/domain/analytics/revenue-metrics"

interface Props {
  metrics: RevenueMetrics
}

export default function RevenueMetricsCards({ metrics }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const renderTrend = (changePercent?: number) => {
    if (!changePercent) return null

    const isPositive = changePercent > 0
    const Icon = isPositive ? TrendingUp : TrendingDown
    const color = isPositive ? "text-green-600" : "text-red-600"

    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{Math.abs(changePercent).toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Revenue
          </CardTitle>
          <DollarSign className="w-5 h-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalRevenue)}
          </div>
          {renderTrend(metrics.comparisonPeriod?.changePercent)}
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Orders
          </CardTitle>
          <ShoppingCart className="w-5 h-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalOrders.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Average Order Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Average Order Value
          </CardTitle>
          <CreditCard className="w-5 h-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.averageOrderValue)}
          </div>
        </CardContent>
      </Card>

      {/* Cancel Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Cancel Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(metrics.cancelRate * 100).toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### **Key Patterns to Follow**

Based on the existing codebase, here are the critical patterns to maintain:

#### **1. Server Actions Pattern**
```typescript
"use server"

import { revalidatePath } from "next/cache"
import { useCaseFactory } from "@/app/api/module/depends"

export async function actionName(params) {
  try {
    const useCase = await useCaseFactory()
    const result = await useCase.execute(params)

    // Serialize dates for JSON transport
    return JSON.parse(JSON.stringify(result))
  } catch (error) {
    console.error("Error:", error)
    return null // or throw error
  }
}

// After mutations, always revalidate
export async function mutationAction(formData: FormData) {
  const useCase = await createUseCase()
  await useCase.execute({ /* params */ })

  revalidatePath("/path") // Important!
}
```

#### **2. Depends.ts Factory Pattern**
```typescript
import { Repository } from "@/infrastructure/repositories/..."
import { UseCase } from "@/core/application/usecases/..."
import type { Service } from "@/core/application/interfaces/..."

const createRepository = async (): Promise<Service> => {
  return new Repository()
}

export const useCaseFactory = async () => {
  const service = await createRepository()
  return new UseCase(service)
}
```

#### **3. Page Component Pattern**
```typescript
// Server Component - fetches data
export default async function Page({ searchParams }) {
  const data = await serverAction(searchParams)

  return (
    <div>
      <ClientComponent data={JSON.parse(JSON.stringify(data))} />
    </div>
  )
}
```

#### **4. Client Component Pattern**
```typescript
"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Component({ data }) {
  return <div>{/* Shadcn UI components */}</div>
}
```

---

## **🎬 Getting Started**

### **Immediate Next Steps**
1. Review and approve this plan
2. Set up development environment for analytics charts (install `recharts`)
3. Create database indexes
4. Start Sprint 1: Revenue Analytics module
5. Create feature branch: `feature/analytics-customer-care`

### **Sprint 1 Implementation Checklist**
- [ ] Install dependencies: `npm install recharts date-fns`
- [ ] Create domain entities in `core/domain/analytics/`
- [ ] Create use cases in `core/application/usecases/analytics/revenue/`
- [ ] Create repository in `infrastructure/repositories/analytics/`
- [ ] Create `depends.ts` in `app/api/analytics/revenue/`
- [ ] Create server actions in `app/(features)/admin/dashboard/analytics/revenue/actions.ts`
- [ ] Create page component in `app/(features)/admin/dashboard/analytics/revenue/page.tsx`
- [ ] Create client components using Shadcn UI
- [ ] Add database indexes
- [ ] Test and validate

### **Questions to Clarify Before Starting**
1. **LLM Provider:** Anthropic Claude vs OpenAI GPT? (Recommend Claude for Vietnamese)
2. **Email/SMS Gateway:** Which provider? Budget available?
3. **Forecasting Approach:** Start with simple statistics or invest in ML from the beginning?
4. **Real-time Features:** Required immediately or can be deferred?
5. **Staff Assignment:** Need to add `assignedTo` field to orders retroactively?

---

## **📁 Folder Structure Reference**

```
app/
├── (features)/
│   └── admin/
│       ├── actions.ts (shared dashboard actions)
│       └── dashboard/
│           ├── analytics/
│           │   ├── revenue/
│           │   │   ├── page.tsx
│           │   │   ├── actions.ts
│           │   │   └── components/
│           │   │       ├── RevenueMetricsCards.tsx
│           │   │       ├── RevenueTimeSeriesChart.tsx
│           │   │       └── TopProductsTable.tsx
│           │   ├── customer/
│           │   ├── staff/
│           │   └── campaigns/
│           └── customer-care/
│               ├── tickets/
│               │   ├── page.tsx
│               │   ├── actions.ts
│               │   └── components/
│               ├── messages/
│               ├── interactions/
│               └── surveys/
├── api/
│   ├── analytics/
│   │   └── revenue/
│   │       ├── route.ts (optional, for external API access)
│   │       └── depends.ts (use case factories)
│   └── customer-care/
│       └── tickets/
│           ├── route.ts
│           └── depends.ts
core/
├── domain/
│   ├── analytics/
│   │   ├── revenue-metrics.ts
│   │   └── customer-metrics.ts
│   └── customer-care/
│       ├── ticket.ts
│       └── interaction.ts
├── application/
│   ├── usecases/
│   │   ├── analytics/
│   │   │   └── revenue/
│   │   │       ├── get-revenue-metrics.ts
│   │   │       └── get-revenue-time-series.ts
│   │   └── customer-care/
│   │       └── ticket/
│   │           ├── create-ticket.ts
│   │           └── get-tickets.ts
│   └── interfaces/
│       ├── analytics/
│       │   └── revenue-analytics-service.ts
│       └── customer-care/
│           └── ticket-service.ts
infrastructure/
└── repositories/
    ├── analytics/
    │   └── revenue-analytics-repo.ts
    └── customer-care/
        └── ticket-repo.ts
```

---

**This detailed plan provides:**
- ✅ Complete technical specifications for each module
- ✅ Clean Architecture adherence (Domain → Use Cases → Repository → API → UI)
- ✅ **Concrete code examples following existing patterns**
- ✅ **Shadcn UI component usage**
- ✅ **Server Actions with proper revalidation**
- ✅ **Depends.ts factory pattern**
- ✅ Realistic timeline with prioritization
- ✅ Success metrics and KPIs
- ✅ Risk mitigation strategies
- ✅ Actionable next steps

**Ready to start implementation!** 🚀

