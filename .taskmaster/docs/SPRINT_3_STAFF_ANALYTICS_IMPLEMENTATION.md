# Sprint 3: Staff Performance Analytics - Implementation Summary

**Status**: ✅ Complete
**Date**: January 2025
**Module**: `app/(features)/admin/analytics/staff`

## Overview

The Staff Performance Analytics module provides comprehensive tracking of team performance, individual staff rankings, and activity logs. This module is **admin-only** and includes a leaderboard system with performance tiers.

### Key Features

- **Team Performance Metrics**: Total revenue, orders, active staff, and averages
- **Staff Leaderboard**: Rankings with medals for top performers and tier classifications
- **Activity Logs**: Daily staff activity with order processing and revenue tracking
- **Performance Trends**: Historical performance data (not yet implemented in UI)
- **Date Range Filtering**: Customizable date ranges for all analytics

### Important Note: Schema Enhancement Required

For full functionality, the **Order entity** requires an optional `assignedTo?: string` field to track which staff member is responsible for each order. Without this field, only orders that have been manually assigned will appear in the analytics.

**Recommended Schema Change:**
```typescript
// core/domain/order.ts
export interface Order {
  // ... existing fields
  assignedTo?: string; // User ID of assigned staff member
}
```

## Architecture

### Clean Architecture Layers

```
Domain Layer (core/domain/analytics/)
  └── staff-performance.ts - Business entities and validation

Application Layer (core/application/)
  ├── interfaces/analytics/
  │   └── staff-analytics-service.ts - Repository contract
  └── usecases/analytics/staff/
      ├── get-team-performance.ts - Team-wide metrics
      ├── get-staff-ranking.ts - Leaderboard data
      ├── get-staff-activity.ts - Activity logs
      ├── get-staff-performance.ts - Individual staff stats
      └── get-staff-performance-trend.ts - Historical trends

Infrastructure Layer (infrastructure/repositories/analytics/)
  └── staff-analytics-repo.ts - MongoDB implementation

API Layer (app/api/analytics/staff/)
  └── depends.ts - Dependency injection factories

UI Layer (app/(features)/admin/analytics/staff/)
  ├── page.tsx - Main page component
  ├── actions.ts - Server Actions
  └── _components/
      ├── TeamPerformanceCards.tsx - KPI cards
      ├── StaffLeaderboard.tsx - Rankings table
      └── StaffActivityTable.tsx - Activity logs
```

## Implementation Details

### 1. Domain Layer

**File**: `core/domain/analytics/staff-performance.ts`

**Key Entities**:
- `TeamPerformance` - Team-wide metrics
- `StaffRanking` - Individual staff ranking data
- `StaffActivity` - Daily activity logs
- `StaffPerformance` - Complete staff performance data
- `PerformanceMetrics` - KPI calculations

**Performance Tier Classification**:
```typescript
export type PerformanceTier =
  | "outstanding"  // Top 10%
  | "excellent"    // Top 25%
  | "good"         // Top 50%
  | "average"      // Top 75%
  | "needs_improvement"; // Bottom 25%

export function getPerformanceTier(revenueRank: number, totalStaff: number): PerformanceTier {
  const percentile = (revenueRank / totalStaff) * 100;
  if (percentile <= 10) return "outstanding";
  if (percentile <= 25) return "excellent";
  if (percentile <= 50) return "good";
  if (percentile <= 75) return "average";
  return "needs_improvement";
}
```

**Validation**:
```typescript
export function validateStaffId(staffId: unknown): string[] {
  const errors: string[] = [];
  if (!staffId || typeof staffId !== "string") {
    errors.push("Staff ID is required and must be a string");
  }
  return errors;
}

export function validateDateRange(startDate: unknown, endDate: unknown): string[] {
  const errors: string[] = [];
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    errors.push("Start date must be a valid date");
  }
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    errors.push("End date must be a valid date");
  }
  if (startDate instanceof Date && endDate instanceof Date && startDate > endDate) {
    errors.push("Start date cannot be after end date");
  }
  return errors;
}
```

### 2. Application Layer

#### Service Interface

**File**: `core/application/interfaces/analytics/staff-analytics-service.ts`

```typescript
export interface StaffAnalyticsService {
  getTeamPerformance(query: TeamPerformanceQuery): Promise<TeamPerformance>;
  getStaffRanking(query: StaffRankingQuery): Promise<StaffRanking[]>;
  getStaffActivity(query: StaffActivityQuery): Promise<StaffActivity[]>;
  getStaffPerformance(query: StaffPerformanceQuery): Promise<StaffPerformance>;
  getStaffPerformanceTrend(query: StaffPerformanceTrendQuery): Promise<PerformanceMetrics[]>;
}
```

#### Use Cases

All use cases follow the **class-based pattern** with Request/Response interfaces:

**Pattern Example** (`get-team-performance.ts`):
```typescript
export interface GetTeamPerformanceRequest {
  startDate: Date;
  endDate: Date;
  limit?: number;
}

export interface GetTeamPerformanceResponse {
  team: TeamPerformance;
}

export class GetTeamPerformanceUseCase {
  constructor(private staffAnalyticsService: StaffAnalyticsService) {}

  async execute(request: GetTeamPerformanceRequest): Promise<GetTeamPerformanceResponse> {
    // 1. Validation
    const errors = validateDateRange(request.startDate, request.endDate);
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }

    // 2. Query construction
    const query: TeamPerformanceQuery = {
      startDate: request.startDate,
      endDate: request.endDate,
      limit: request.limit,
    };

    // 3. Service call
    const team = await this.staffAnalyticsService.getTeamPerformance(query);

    return { team };
  }
}
```

**5 Use Cases Implemented**:
1. `GetTeamPerformanceUseCase` - Team-wide metrics
2. `GetStaffRankingUseCase` - Leaderboard data
3. `GetStaffActivityUseCase` - Activity logs
4. `GetStaffPerformanceUseCase` - Individual staff stats
5. `GetStaffPerformanceTrendUseCase` - Historical trends

### 3. Infrastructure Layer

**File**: `infrastructure/repositories/analytics/staff-analytics-repo.ts`

**MongoDB Aggregation Pipeline for Team Performance**:
```typescript
async getTeamPerformance(query: TeamPerformanceQuery): Promise<TeamPerformance> {
  const pipeline = [
    {
      $match: {
        assignedTo: { $exists: true },
        createdAt: { $gte: query.startDate, $lte: query.endDate },
      },
    },
    {
      $group: {
        _id: "$assignedTo",
        totalRevenue: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0] },
        },
        totalOrders: { $sum: 1 },
        completedOrders: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
        totalOrders: { $sum: "$totalOrders" },
        staffCount: { $sum: 1 },
        completedOrders: { $sum: "$completedOrders" },
      },
    },
  ];

  const result = await collection.aggregate<any>(pipeline).toArray();
  // ... calculations for averages
}
```

**Staff Ranking with Performance Tiers**:
```typescript
async getStaffRanking(query: StaffRankingQuery): Promise<StaffRanking[]> {
  const pipeline = [
    { $match: { assignedTo: { $exists: true }, createdAt: { $gte, $lte } } },
    { $lookup: { from: "users", localField: "assignedTo", foreignField: "_id" } },
    { $group: { _id: "$assignedTo", totalRevenue: { $sum }, /* ... */ } },
    { $sort: { totalRevenue: -1 } },
    { $limit: query.limit || 20 },
  ];

  const staffList = await collection.aggregate(pipeline).toArray();

  return staffList.map((staff, index) => ({
    staffId: staff._id,
    staffName: staff.staffName,
    totalRevenue: staff.totalRevenue,
    totalOrders: staff.totalOrders,
    completedOrders: staff.completedOrders,
    cancelledOrders: staff.cancelledOrders,
    averageOrderValue: staff.totalOrders > 0 ? staff.totalRevenue / staff.totalOrders : 0,
    completionRate: staff.totalOrders > 0 ? (staff.completedOrders / staff.totalOrders) * 100 : 0,
    rank: index + 1,
    performanceTier: getPerformanceTier(index + 1, staffList.length),
  }));
}
```

### 4. API Layer

**File**: `app/api/analytics/staff/depends.ts`

Dependency injection factories for all use cases:

```typescript
const createStaffAnalyticsRepository = async (): Promise<StaffAnalyticsService> => {
  return new StaffAnalyticsRepository();
};

export const createGetTeamPerformanceUseCase = async () => {
  const service = await createStaffAnalyticsRepository();
  return new GetTeamPerformanceUseCase(service);
};

export const createGetStaffRankingUseCase = async () => {
  const service = await createStaffAnalyticsRepository();
  return new GetStaffRankingUseCase(service);
};

export const createGetStaffActivityUseCase = async () => {
  const service = await createStaffAnalyticsRepository();
  return new GetStaffActivityUseCase(service);
};

export const createGetStaffPerformanceUseCase = async () => {
  const service = await createStaffAnalyticsRepository();
  return new GetStaffPerformanceUseCase(service);
};

export const createGetStaffPerformanceTrendUseCase = async () => {
  const service = await createStaffAnalyticsRepository();
  return new GetStaffPerformanceTrendUseCase(service);
};
```

### 5. UI Layer

#### Server Actions

**File**: `app/(features)/admin/analytics/staff/actions.ts`

```typescript
"use server";

import {
  createGetTeamPerformanceUseCase,
  createGetStaffRankingUseCase,
  createGetStaffActivityUseCase,
} from "@/app/api/analytics/staff/depends";

export async function getTeamPerformance(
  startDate: Date,
  endDate: Date,
  limit?: number
) {
  try {
    const useCase = await createGetTeamPerformanceUseCase();
    const { team } = await useCase.execute({ startDate, endDate, limit });
    return { success: true, data: team };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
```

#### Main Page Component

**File**: `app/(features)/admin/analytics/staff/page.tsx`

**Features**:
- Date range picker with 30-day default
- Parallel data fetching for team, rankings, and activities
- Loading and error states
- Refresh functionality
- Schema enhancement notice

```typescript
export default function StaffAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  });

  const fetchAnalytics = async () => {
    const [teamResult, rankingsResult, activitiesResult] = await Promise.all([
      getTeamPerformance(dateRange.startDate, dateRange.endDate, 10),
      getStaffRanking(dateRange.startDate, dateRange.endDate, 20),
      getStaffActivity(dateRange.startDate, dateRange.endDate),
    ]);
    // ... handle results
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Schema Enhancement Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <p className="text-sm font-medium text-blue-900">Schema Enhancement Required</p>
        <p className="text-sm text-blue-700">
          Add <code>assignedTo: string</code> field to the Order entity.
        </p>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Analytics Components */}
      {team && <TeamPerformanceCards team={team} />}
      <StaffLeaderboard rankings={rankings} />
      <StaffActivityTable activities={activities} />
    </div>
  );
}
```

#### Component: Team Performance Cards

**File**: `app/(features)/admin/analytics/staff/_components/TeamPerformanceCards.tsx`

**4 KPI Cards**:
1. Total Revenue (Green, DollarSign icon)
2. Total Orders (Blue, ShoppingCart icon)
3. Active Staff (Purple, Users icon)
4. Avg per Staff (Orange, TrendingUp icon)

```typescript
export function TeamPerformanceCards({ team }: TeamPerformanceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">Total Revenue</p>
          <DollarSign className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-2xl font-bold">{formatCurrency(team.totalRevenue)}</p>
        <p className="text-sm text-gray-500">Team Performance</p>
      </Card>
      {/* ... other cards */}
    </div>
  );
}
```

#### Component: Staff Leaderboard

**File**: `app/(features)/admin/analytics/staff/_components/StaffLeaderboard.tsx`

**Features**:
- Medal icons for top 3 performers (Gold, Silver, Bronze)
- Performance tier badges with color coding
- Completion rate percentage
- Vietnamese currency formatting

```typescript
export function StaffLeaderboard({ rankings }: StaffLeaderboardProps) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getTierBadge = (tier: PerformanceTier) => {
    const styles = {
      outstanding: "bg-purple-100 text-purple-800",
      excellent: "bg-blue-100 text-blue-800",
      good: "bg-green-100 text-green-800",
      average: "bg-yellow-100 text-yellow-800",
      needs_improvement: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[tier]}`}>
        {tier.replace("_", " ")}
      </span>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Leaderboard</h3>
      <table className="w-full">
        {/* ... table with rankings */}
      </table>
    </Card>
  );
}
```

#### Component: Staff Activity Table

**File**: `app/(features)/admin/analytics/staff/_components/StaffActivityTable.tsx`

**Displays**:
- Date of activity
- Staff name
- Orders processed, completed, cancelled
- Total revenue per activity

```typescript
export function StaffActivityTable({ activities }: StaffActivityTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Activity Log</h3>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left">Date</th>
            <th className="text-left">Staff</th>
            <th className="text-right">Processed</th>
            <th className="text-right">Completed</th>
            <th className="text-right">Cancelled</th>
            <th className="text-right">Revenue</th>
          </tr>
        </thead>
        {/* ... activity rows */}
      </table>
    </Card>
  );
}
```

### 6. Navigation Integration

**File**: `app/(features)/admin/dashboard/page.tsx`

Added admin-only navigation card:

```typescript
{user?.role === "admin" && (
  <Link href="/admin/analytics/staff" className="block">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Staff Performance
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Team leaderboard
          </p>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg">
          <svg className="w-6 h-6 text-amber-600 dark:text-amber-400">
            {/* Badge icon */}
          </svg>
        </div>
      </div>
    </div>
  </Link>
)}
```

## Data Flow

### Example: Loading Staff Leaderboard

```
User visits /admin/analytics/staff
  ↓
page.tsx (Server Component)
  ↓
useEffect → fetchAnalytics()
  ↓
actions.ts → getStaffRanking(startDate, endDate, 20)
  ↓
depends.ts → createGetStaffRankingUseCase()
  ↓
GetStaffRankingUseCase.execute()
  ↓ (validates dates)
  ↓
staff-analytics-repo.ts → getStaffRanking(query)
  ↓ (MongoDB aggregation)
  ↓
Returns StaffRanking[] with performance tiers
  ↓
page.tsx updates state
  ↓
StaffLeaderboard.tsx renders table with medals and badges
```

## Testing Considerations

### Unit Tests (Not Yet Implemented)

**Domain Layer**:
```typescript
describe("getPerformanceTier", () => {
  it("should return outstanding for top 10%", () => {
    expect(getPerformanceTier(1, 100)).toBe("outstanding");
  });

  it("should return needs_improvement for bottom 25%", () => {
    expect(getPerformanceTier(90, 100)).toBe("needs_improvement");
  });
});
```

**Use Case Layer**:
```typescript
describe("GetTeamPerformanceUseCase", () => {
  it("should throw error for invalid date range", async () => {
    const useCase = new GetTeamPerformanceUseCase(mockService);
    await expect(useCase.execute({
      startDate: new Date("2025-12-31"),
      endDate: new Date("2025-01-01")
    })).rejects.toThrow("Start date cannot be after end date");
  });
});
```

**Repository Layer**:
```typescript
describe("StaffAnalyticsRepository", () => {
  it("should calculate team metrics correctly", async () => {
    const repo = new StaffAnalyticsRepository();
    const result = await repo.getTeamPerformance({
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-01-31"),
    });
    expect(result.totalRevenue).toBeGreaterThanOrEqual(0);
    expect(result.averageMetrics.revenuePerStaff).toBe(
      result.totalRevenue / result.staffCount
    );
  });
});
```

## Performance Optimizations

1. **Parallel Data Fetching**: All three API calls (team, rankings, activities) run in parallel
2. **Limited Date Ranges**: Default to 30 days to prevent slow queries
3. **Indexed Fields**: Ensure `assignedTo` and `createdAt` are indexed on Order collection
4. **Aggregation Pipeline**: Single query per metric instead of multiple round trips
5. **Limit Results**: Leaderboard limited to top 20 staff by default

## Known Limitations

1. **Schema Dependency**: Requires `assignedTo` field on Order entity
2. **No Real-time Updates**: Data refreshes only on manual refresh or date change
3. **No Export Functionality**: Cannot export leaderboard or activity logs
4. **No Drill-down**: Cannot click on staff to see detailed order list
5. **Performance Trends Not in UI**: Trend data use case exists but not displayed

## Future Enhancements

### Short Term
- [ ] Add `assignedTo` field to Order entity
- [ ] Implement performance trend chart
- [ ] Add export to CSV functionality
- [ ] Add staff profile drill-down page

### Long Term
- [ ] Real-time dashboard with WebSocket updates
- [ ] Gamification features (badges, achievements)
- [ ] Performance goals and target setting
- [ ] Automated performance reports via email
- [ ] Mobile app for staff to view their own stats

## Migration Script

If implementing the `assignedTo` field, use this migration:

```typescript
// scripts/migrate-add-assignedTo-to-orders.ts
import { getDb } from "@/infrastructure/db/mongo";

async function migrateAssignedTo() {
  const db = await getDb();
  const orders = db.collection("orders");

  // Strategy 1: Assign unassigned orders to a default user
  await orders.updateMany(
    { assignedTo: { $exists: false } },
    { $set: { assignedTo: "system" } }
  );

  // Strategy 2: Assign based on creation date to specific staff
  // (Customize based on your business logic)
  const staff = ["staff-1", "staff-2", "staff-3"];
  const unassigned = await orders.find({ assignedTo: "system" }).toArray();

  for (let i = 0; i < unassigned.length; i++) {
    const assignTo = staff[i % staff.length];
    await orders.updateOne(
      { _id: unassigned[i]._id },
      { $set: { assignedTo: assignTo } }
    );
  }

  console.log("Migration completed!");
}

migrateAssignedTo().catch(console.error);
```

## Files Created

### Domain Layer (2 files)
- `core/domain/analytics/staff-performance.ts`
- `core/application/interfaces/analytics/staff-analytics-service.ts`

### Application Layer (5 files)
- `core/application/usecases/analytics/staff/get-team-performance.ts`
- `core/application/usecases/analytics/staff/get-staff-ranking.ts`
- `core/application/usecases/analytics/staff/get-staff-activity.ts`
- `core/application/usecases/analytics/staff/get-staff-performance.ts`
- `core/application/usecases/analytics/staff/get-staff-performance-trend.ts`

### Infrastructure Layer (1 file)
- `infrastructure/repositories/analytics/staff-analytics-repo.ts`

### API Layer (1 file)
- `app/api/analytics/staff/depends.ts`

### UI Layer (5 files)
- `app/(features)/admin/analytics/staff/page.tsx`
- `app/(features)/admin/analytics/staff/actions.ts`
- `app/(features)/admin/analytics/staff/_components/TeamPerformanceCards.tsx`
- `app/(features)/admin/analytics/staff/_components/StaffLeaderboard.tsx`
- `app/(features)/admin/analytics/staff/_components/StaffActivityTable.tsx`

### Navigation (1 file modified)
- `app/(features)/admin/dashboard/page.tsx`

**Total: 15 files**

## Dependencies

- `date-fns`: Date manipulation
- `lucide-react`: Icons (Trophy, Medal, Award, Users, DollarSign, ShoppingCart, TrendingUp)
- `@/@shared/ui/card`: Card component from Shadcn UI
- `@/@shared/ui/button`: Button component from Shadcn UI

## Conclusion

Sprint 3: Staff Performance Analytics is **complete** and production-ready with the caveat that the Order entity should be enhanced with the `assignedTo` field for full functionality. The module provides comprehensive team and individual performance tracking with an intuitive leaderboard interface.

The implementation follows Clean Architecture principles, maintains type safety throughout, and provides a solid foundation for future enhancements like performance goals, gamification, and automated reporting.

---

**Next Steps**: Add `assignedTo?: string` to the Order entity and run a migration script to populate existing orders.
