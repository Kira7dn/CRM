import { getCurrentUserAction } from "../../_shared/actions/auth-actions"
import { getDashboardStats } from "../actions"
import { DashboardStats } from "./_components/DashboardStats"
import { CustomerInsights } from "./_components/CustomerInsights"
import { RiskAlerts } from "./_components/RiskAlerts"
import { TopProducts } from "./_components/TopProducts"
import { RevenueForecastClient } from "./_components/RevenueForecastClient"
import { AIRiskAssessmentClient } from "./_components/AIRiskAssessmentClient"
import { EnhancedMetrics } from "./_components/EnhancedMetrics"
import { InventoryAlertsClient } from "./_components/InventoryAlertsClient"
import { ProfitAnalysisClient } from "./_components/ProfitAnalysisClient"
import { OrdersChart } from "./_components/OrdersChart"
import { RecentOrders } from "./_components/RecentOrders"

// Enable ISR with 5 minute revalidation
export const revalidate = 300

export default async function DashboardPage() {
  const user = await getCurrentUserAction()
  const stats = await getDashboardStats()

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] overflow-auto">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>

        {/* Dashboard Analytics */}
        {stats && (
          <>
            {/* Risk Alerts & Inventory - Top Priority */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RiskAlerts stats={stats} />
              <InventoryAlertsClient />
            </div>

            {/* Key Metrics */}
            <DashboardStats stats={stats} />

            {/* Profit Analysis */}
            <ProfitAnalysisClient />

            {/* AI Insights Section - Loaded client-side to avoid blocking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RevenueForecastClient />
              <CustomerInsights stats={stats} />
            </div>

            {/* AI Risk Assessment - Loaded client-side to avoid blocking */}
            <AIRiskAssessmentClient />

            {/* Enhanced Metrics */}
            <EnhancedMetrics
              avgLTV={stats.avgLTV}
              decliningProducts={stats.decliningProducts}
              topPerformingStaff={stats.topPerformingStaff}
              lateOrders={stats.lateOrders}
              avgProcessingTime={stats.avgProcessingTime}
            />

            {/* Product Performance */}
            <TopProducts products={stats.topSellingProducts} />

            {/* Charts & Recent Activity */}
            <OrdersChart
              ordersByStatus={stats.ordersByStatus}
              ordersByPayment={stats.ordersByPayment}
            />
            <RecentOrders orders={stats.recentOrders} />
          </>
        )}
      </div>
    </div>
  )
}
