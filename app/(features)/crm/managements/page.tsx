import { getCurrentUserAction } from "../../_shared/actions/auth-actions"
import { getDashboardStats } from "../actions"
import { RiskAlerts } from "./_components/widgets/RiskAlerts"
import { TopProducts } from "./_components/TopProducts"
import { RevenueForecastClient } from "./_components/RevenueForecastClient"
import { AIRiskAssessmentClient } from "./_components/AIRiskAssessmentClient"
import { InventoryAlertsClient } from "./_components/InventoryAlertsClient"
import { ProfitAnalysisClient } from "./_components/ProfitAnalysisClient"
import { OrdersChart } from "./_components/OrdersChart"
import { RecentOrders } from "./_components/RecentOrders"
import { CustomizableDashboardClient } from "./_components/CustomizableDashboardClient"
import { Widget } from "./_components/GridStackDashboard"

// Individual modular widgets
import { TodayRevenueWidget } from "./_components/widgets/TodayRevenueWidget"
import { MonthRevenueWidget } from "./_components/widgets/MonthRevenueWidget"
import { NewCustomersWidget } from "./_components/widgets/NewCustomersWidget"
import { TodayOrdersWidget } from "./_components/widgets/TodayOrdersWidget"
import { AverageOrderValueWidget } from "./_components/widgets/AverageOrderValueWidget"
import { ChurnRiskWidget } from "./_components/widgets/ChurnRiskWidget"
import { ErrorRateWidget } from "./_components/widgets/ErrorRateWidget"
import { TotalProductsWidget } from "./_components/widgets/TotalProductsWidget"
import { ReturningCustomersWidget } from "./_components/widgets/ReturningCustomersWidget"
import { CustomerLTVWidget } from "./_components/widgets/CustomerLTVWidget"
import { LateOrdersWidget } from "./_components/widgets/LateOrdersWidget"
import { ProcessingTimeWidget } from "./_components/widgets/ProcessingTimeWidget"
import { TopProfitProductsWidget } from "./_components/widgets/TopProfitProductsWidget"
import { DecliningProductsWidget } from "./_components/widgets/DecliningProductsWidget"
import { TopStaffWidget } from "./_components/widgets/TopStaffWidget"
import { MonthProfitWidget } from "./_components/widgets/MonthProfitWidget"
import { TodayProfitWidget } from "./_components/widgets/TodayProfitWidget"
import { AIRiskOverallWidgetClient } from "./_components/widgets/AIRiskOverallWidgetClient"
import { AIRiskIdentifiedWidgetClient } from "./_components/widgets/AIRiskIdentifiedWidgetClient"
import { AIRiskOpportunitiesWidgetClient } from "./_components/widgets/AIRiskOpportunitiesWidgetClient"
import { OrderStatusWidget } from "./_components/widgets/OrderStatusWidget"
import { PaymentStatusWidget } from "./_components/widgets/PaymentStatusWidget"
import { useCopilotReadable } from "@copilotkit/react-core"

// Enable ISR with 5 minute revalidation
export const revalidate = 300

export default async function DashboardPage() {
  const user = await getCurrentUserAction()
  const stats = await getDashboardStats()

  if (!stats) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Define all dashboard widgets with their components
  const widgets: Widget[] = [
    // Finance module - Individual metric widgets
    {
      id: "today-revenue",
      title: (
        <div className="flex gap-2">
          <span className="text-xl">💰</span>
          <h3 className="">
            Doanh thu hôm nay
          </h3>
        </div>
      ),
      component: (
        <TodayRevenueWidget
          key="today-revenue-widget"
          todayRevenue={stats.todayRevenue}
          yesterdayRevenue={stats.yesterdayRevenue}
          revenueChangeVsYesterday={stats.revenueChangeVsYesterday}
        />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "month-revenue",
      title: "Doanh thu tháng",
      component: (
        <MonthRevenueWidget
          key="month-revenue-widget"
          thisMonthRevenue={stats.thisMonthRevenue}
          lastMonthRevenue={stats.lastMonthRevenue}
          revenueChangeVsLastMonth={stats.revenueChangeVsLastMonth}
        />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "average-order-value",
      title: "Giá trị đơn TB",
      component: (
        <AverageOrderValueWidget
          key="average-order-value-widget"
          aov={stats.aov}
          totalOrders={stats.totalOrders}
        />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "today-profit",
      title: "Lợi nhuận hôm nay",
      component: <TodayProfitWidget key="today-profit-widget" />,
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "month-profit",
      title: "Lợi nhuận tháng",
      component: (
        <MonthProfitWidget key="month-profit-widget" />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "top-profit-products",
      title: "Top SP lợi nhuận",
      component: <TopProfitProductsWidget key="top-profit-products-widget" />,
      visible: true,
      module: "finance",
      w: 6,
      h: 5,
    },

    // Customer module - Individual customer widgets
    {
      id: "new-customers",
      title: "Khách hàng mới",
      component: (
        <NewCustomersWidget
          key="new-customers-widget"
          todayNewCustomers={stats.todayNewCustomers}
          totalCustomers={stats.totalCustomers}
          returningRate={stats.returningRate}
        />
      ),
      visible: true,
      module: "customer",
      w: 2,
      h: 3,
    },
    {
      id: "returning-customers",
      title: "Khách hàng quay lại",
      component: (
        <ReturningCustomersWidget
          key="returning-customers-widget"
          returningCustomers={stats.returningCustomers}
          returningRate={stats.returningRate}
        />
      ),
      visible: true,
      module: "customer",
      w: 2,
      h: 3,
    },
    {
      id: "churn-risk",
      title: "Nguy cơ rời bỏ",
      component: (
        <ChurnRiskWidget
          key="churn-risk-widget"
          churnRiskCustomers={stats.churnRiskCustomers}
          churnRiskRate={stats.churnRiskRate}
        />
      ),
      visible: true,
      module: "customer",
      w: 2,
      h: 3,
    },
    {
      id: "customer-ltv",
      title: "LTV TB khách hàng",
      component: <CustomerLTVWidget key="customer-ltv-widget" avgLTV={stats.avgLTV} />,
      visible: true,
      module: "customer",
      w: 2,
      h: 3,
    },

    // Order module - Individual order widgets
    {
      id: "today-orders",
      title: "Đơn hàng hôm nay",
      component: (
        <TodayOrdersWidget
          key="today-orders-widget"
          todayOrderCount={stats.todayOrderCount}
          pendingOrders={stats.pendingOrders}
          completionRate={stats.completionRate}
        />
      ),
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    {
      id: "error-rate",
      title: "Tỷ lệ lỗi",
      component: (
        <ErrorRateWidget
          key="error-rate-widget"
          errorRate={stats.errorRate}
          cancelledOrders={stats.cancelledOrders}
        />
      ),
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    {
      id: "late-orders",
      title: "Đơn trễ hạn",
      component: <LateOrdersWidget key="late-orders-widget" lateOrders={stats.lateOrders} />,
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    {
      id: "processing-time",
      title: "Thời gian xử lý TB",
      component: (
        <ProcessingTimeWidget
          key="processing-time-widget"
          avgProcessingTime={stats.avgProcessingTime}
        />
      ),
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    // {
    //   id: "orders-chart",
    //   title: "Biểu đồ đơn hàng",
    //   component: (
    //     <OrdersChart
    //       key="orders-chart-widget"
    //       ordersByStatus={stats.ordersByStatus}
    //       ordersByPayment={stats.ordersByPayment}
    //     />
    //   ),
    //   visible: true,
    //   module: "order",
    //   w: 12,
    //   h: 3,
    // },
    {
      id: "order-status-widget",
      title: "Trạng thái đơn hàng",
      component: (
        <OrderStatusWidget
          key="order-status-widget"
          ordersByStatus={stats.ordersByStatus}
        />
      ),
      visible: true,
      module: "order",
      w: 6,
      h: 5,
    },
    {
      id: "payment-status-widget",
      title: "Trạng thái thanh toán",
      component: (
        <PaymentStatusWidget
          key="payment-status-widget"
          ordersByPayment={stats.ordersByPayment}
        />
      ),
      visible: true,
      module: "order",
      w: 6,
      h: 3,
    },
    {
      id: "recent-orders",
      title: "Đơn hàng gần đây",
      component: <RecentOrders key="recent-orders-widget" orders={stats.recentOrders} />,
      visible: true,
      module: "order",
      w: 6,
      h: 3,
    },
    {
      id: "top-staff",
      title: "Nhân viên xuất sắc",
      component: <TopStaffWidget key="top-staff-widget" topPerformingStaff={stats.topPerformingStaff} />,
      visible: true,
      module: "order",
      w: 6,
      h: 5,
    },

    // Product module
    {
      id: "total-products",
      title: "Tổng sản phẩm",
      component: (
        <TotalProductsWidget
          key="total-products-widget"
          totalProducts={stats.totalProducts}
          topSellingCount={stats.topSellingProducts.length}
        />
      ),
      visible: true,
      module: "product",
      w: 2,
      h: 3,
    },
    {
      id: "top-products",
      title: "Sản phẩm bán chạy",
      component: <TopProducts key="top-products-widget" products={stats.topSellingProducts} />,
      visible: true,
      module: "product",
      w: 6,
      h: 5,
    },
    {
      id: "declining-products",
      title: "Sản phẩm sụt giảm",
      component: <DecliningProductsWidget key="declining-products-widget" decliningProducts={stats.decliningProducts} />,
      visible: true,
      module: "product",
      w: 2,
      h: 3,
    },
    {
      id: "inventory-alerts",
      title: "Cảnh báo tồn kho",
      component: <InventoryAlertsClient />,
      visible: true,
      module: "inventory",
      w: 2,
      h: 1,
    },

    // Risk module
    {
      id: "risk-alerts",
      title: "Cảnh báo rủi ro",
      component: <RiskAlerts key="risk-alerts-widget" stats={stats} />,
      visible: true,
      module: "risk",
      w: 6,
      h: 3,
    },
    // {
    //   id: "ai-risk-assessment",
    //   title: "Đánh giá rủi ro AI",
    //   component: <AIRiskAssessmentClient key="ai-risk-assessment-widget" />,
    //   visible: true,
    //   module: "risk",
    //   w: 6,
    //   h: 2,
    // },
    {
      id: "ai-risk-overall",
      title: "Đánh giá rủi ro AI",
      component: <AIRiskOverallWidgetClient key="ai-risk-overall-widget" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },
    {
      id: "ai-risk-details",
      title: "Chi tiết đánh giá rủi ro AI",
      component: <AIRiskIdentifiedWidgetClient key="ai-risk-identified-widget" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },
    {
      id: "ai-risk-recommendations",
      title: "Gợi ý khắc phục",
      component: <AIRiskOpportunitiesWidgetClient key="ai-risk-opportunities-widget" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },

    // Forecast module
    {
      id: "revenue-forecast",
      title: "Dự báo doanh thu",
      component: <RevenueForecastClient key="revenue-forecast-widget" />,
      visible: true,
      module: "forecast",
      w: 12,
      h: 5,
    },
  ]


  return (
    <div className="p-4 md:p-6">
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

        {/* Customizable Dashboard */}
        <CustomizableDashboardClient widgets={widgets} />
      </div>
    </div>
  )
}
