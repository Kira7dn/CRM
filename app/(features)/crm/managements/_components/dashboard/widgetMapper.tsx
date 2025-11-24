import { Widget } from "./ModuleGrid"
import { RiskAlerts } from "./widgets/Alerts/RiskAlerts"
import { TopProducts } from "./widgets/order/TopProducts"
import { RevenueForecast } from "./widgets/forecast/RevenueForecast"
import { RecentOrders } from "./widgets/order/RecentOrders"
import { InventoryAlertsWidget } from "./widgets/Alerts/InventoryAlertsWidget"
import { WeekRevenueWidget } from "./widgets/finance/WeekRevenueWidget"
import { MonthRevenueWidget } from "./widgets/finance/MonthRevenueWidget"
import { NewCustomersWidget } from "./widgets/customer/NewCustomersWidget"
import { WeekOrdersWidget } from "./widgets/order/WeekOrdersWidget"
import { AverageOrderValueWidget } from "./widgets/order/AverageOrderValueWidget"
import { ChurnRiskWidget } from "./widgets/customer/ChurnRiskWidget"
import { ErrorRateWidget } from "./widgets/order/ErrorRateWidget"
import { TotalProductsWidget } from "./widgets/product/TotalProductsWidget"
import { ReturningCustomersWidget } from "./widgets/customer/ReturningCustomersWidget"
import { CustomerLTVWidget } from "./widgets/customer/CustomerLTVWidget"
import { LateOrdersWidget } from "./widgets/order/LateOrdersWidget"
import { ProcessingTimeWidget } from "./widgets/order/ProcessingTimeWidget"
import { TopProfitProductsWidget } from "./widgets/finance/TopProfitProductsWidget"
import { DecliningProductsWidget } from "./widgets/product/DecliningProductsWidget"
import { TopStaffWidget } from "./widgets/order/TopStaffWidget"
import { MonthProfitWidget } from "./widgets/finance/MonthProfitWidget"
import { WeekProfitWidget } from "./widgets/finance/WeekProfitWidget"
import { AIRiskOverallWidget } from "./widgets/risk/AIRiskOverallWidget"
import { AIRiskIdentifiedWidget } from "./widgets/risk/AIRiskIdentifiedWidget"
import { AIRiskOpportunitiesWidget } from "./widgets/risk/AIRiskOpportunitiesWidget"
import { OrderStatusWidget } from "./widgets/order/OrderStatusWidget"
import { PaymentStatusWidget } from "./widgets/order/PaymentStatusWidget"
import { getDashboardStats } from "@/app/(features)/crm/_actions/dashboard_actions"

// Extract the return type from getDashboardStats function
type DashboardStats = NonNullable<Awaited<ReturnType<typeof getDashboardStats>>>

interface WidgetConfig {
  id: string
  module: string
  visible: boolean
  x: number
  y: number
  w: number
  h: number
}

interface WidgetMapperConfig {
  widgets: WidgetConfig[]
  moduleOrder: string[]
}

// Widget title mapping
const WIDGET_TITLES: Record<string, string> = {
  "doanh-thu-7-ngay": "Doanh thu 7 ngày",
  "doanh-thu-30-ngay": "Doanh thu 30 ngày",
  "gia-tri-don-trung-binh": "Giá trị đơn TB",
  "loi-nhuan-7-ngay": "Lợi nhuận 7 ngày",
  "loi-nhuan-30-ngay": "Lợi nhuận 30 ngày",
  "top-san-pham-loi-nhuan": "Top sản phẩm lợi nhuận 30 ngày",
  "khach-hang-moi": "Khách hàng mới",
  "khach-hang-quay-lai": "Khách hàng quay lại",
  "nguy-co-roi-bo": "Nguy cơ rời bỏ",
  "gia-tri-tron-doi-khach-hang": "LTV TB khách hàng",
  "don-hang-7-ngay": "Đơn hàng 7 ngày",
  "ty-le-loi": "Tỷ lệ lỗi",
  "don-tre-han": "Đơn trễ hạn",
  "thoi-gian-xu-ly-trung-binh": "Thời gian xử lý TB",
  "trang-thai-don-hang": "Trạng thái đơn hàng",
  "trang-thai-thanh-toan": "Trạng thái thanh toán",
  "don-hang-gan-day": "Đơn hàng gần đây",
  "nhan-vien-xuat-sac": "Nhân viên xuất sắc",
  "tong-san-pham": "Tổng sản phẩm",
  "san-pham-ban-chay": "Sản phẩm bán chạy",
  "san-pham-sut-giam": "Sản phẩm sụt giảm",
  "inventory-alerts": "Cảnh báo tồn kho",
  "canh-bao-rui-ro": "Cảnh báo rủi ro",
  "danh-gia-rui-ro-ai": "Đánh giá rủi ro AI",
  "chi-tiet-danh-gia-rui-ro": "Chi tiết đánh giá rủi ro AI",
  "goi-y-khac-phuc": "Gợi ý khắc phục",
  "du-bao-doanh-thu": "Dự báo doanh thu"
}

/**
 * Maps widget IDs to their React components with stats data
 */
export function createWidgetComponent(widgetId: string, stats: DashboardStats) {
  const componentMap: Record<string, React.ReactNode> = {
    "doanh-thu-7-ngay": (
      <WeekRevenueWidget
        key={widgetId}
        last7DaysRevenue={stats.last7DaysRevenue}
        prev7DaysRevenue={stats.prev7DaysRevenue}
        revenueChangeVsPrev7Days={stats.revenueChangeVsPrev7Days}
      />
    ),
    "doanh-thu-30-ngay": (
      <MonthRevenueWidget
        key={widgetId}
        last30DaysRevenue={stats.last30DaysRevenue}
        prev30DaysRevenue={stats.prev30DaysRevenue}
        revenueChangeVsPrev30Days={stats.revenueChangeVsPrev30Days}
      />
    ),
    "gia-tri-don-trung-binh": (
      <AverageOrderValueWidget
        key={widgetId}
        aov={stats.aov}
        totalOrders={stats.totalOrders}
      />
    ),
    "loi-nhuan-7-ngay": (
      <WeekProfitWidget
        key={widgetId}
        revenue={stats.profitMetrics?.last7Days.revenue || 0}
        cogs={stats.profitMetrics?.last7Days.cogs || 0}
        grossProfit={stats.profitMetrics?.last7Days.grossProfit || 0}
        grossMargin={stats.profitMetrics?.last7Days.grossMargin || 0}
        operationalCosts={stats.profitMetrics?.last7Days.operationalCosts || 0}
        netProfit={stats.profitMetrics?.last7Days.netProfit || 0}
        netMargin={stats.profitMetrics?.last7Days.netMargin || 0}
      />),
    "loi-nhuan-30-ngay": (
      <MonthProfitWidget
        key={widgetId}
        revenue={stats.profitMetrics?.last30Days.revenue || 0}
        cogs={stats.profitMetrics?.last30Days.cogs || 0}
        grossProfit={stats.profitMetrics?.last30Days.grossProfit || 0}
        grossMargin={stats.profitMetrics?.last30Days.grossMargin || 0}
        operationalCosts={stats.profitMetrics?.last30Days.operationalCosts || 0}
        netProfit={stats.profitMetrics?.last30Days.netProfit || 0}
        netMargin={stats.profitMetrics?.last30Days.netMargin || 0}
      />),
    "top-san-pham-loi-nhuan": (
      <TopProfitProductsWidget
        key={widgetId}
        products={stats.profitMetrics.topProfitProducts}
      />
    ),
    "khach-hang-moi": (
      <NewCustomersWidget
        key={widgetId}
        todayNewCustomers={stats.todayNewCustomers}
        totalCustomers={stats.totalCustomers}
        returningRate={stats.returningRate}
      />
    ),
    "khach-hang-quay-lai": (
      <ReturningCustomersWidget
        key={widgetId}
        returningCustomers={stats.returningCustomers}
        returningRate={stats.returningRate}
      />
    ),
    "nguy-co-roi-bo": (
      <ChurnRiskWidget
        key={widgetId}
        churnRiskCustomers={stats.churnRiskCustomers}
        churnRiskRate={stats.churnRiskRate}
      />
    ),
    "gia-tri-tron-doi-khach-hang": (
      <CustomerLTVWidget key={widgetId} avgLTV={stats.avgLTV} />
    ),
    "don-hang-7-ngay": (
      <WeekOrdersWidget
        key={widgetId}
        last7DaysOrderCount={stats.last7DaysOrderCount}
        prev7DaysOrderCount={stats.prev7DaysOrderCount}
        pendingOrders={stats.pendingOrders}
        completionRate={stats.completionRate}
      />
    ),
    "ty-le-loi": (
      <ErrorRateWidget
        key={widgetId}
        errorRate={stats.errorRate}
        cancelledOrders={stats.cancelledOrders}
      />
    ),
    "don-tre-han": <LateOrdersWidget key={widgetId} lateOrders={stats.lateOrders} />,
    "thoi-gian-xu-ly-trung-binh": (
      <ProcessingTimeWidget
        key={widgetId}
        avgProcessingTime={stats.avgProcessingTime}
      />
    ),
    "trang-thai-don-hang": (
      <OrderStatusWidget
        key={widgetId}
        ordersByStatus={stats.ordersByStatus}
      />
    ),
    "trang-thai-thanh-toan": (
      <PaymentStatusWidget
        key={widgetId}
        ordersByPayment={stats.ordersByPayment}
      />
    ),
    "don-hang-gan-day": (
      <RecentOrders key={widgetId} orders={stats.recentOrders} />
    ),
    "nhan-vien-xuat-sac": (
      <TopStaffWidget
        key={widgetId}
        topPerformingStaff={stats.topPerformingStaff}
      />
    ),
    "tong-san-pham": (
      <TotalProductsWidget
        key={widgetId}
        totalProducts={stats.totalProducts}
        topSellingCount={stats.topSellingProducts.length}
      />
    ),
    "san-pham-ban-chay": (
      <TopProducts key={widgetId} products={stats.topSellingProducts} />
    ),
    "san-pham-sut-giam": (
      <DecliningProductsWidget
        key={widgetId}
        decliningProducts={stats.decliningProducts}
      />
    ),
    "inventory-alerts": <InventoryAlertsWidget key={widgetId} />,
    "canh-bao-rui-ro": <RiskAlerts key={widgetId} stats={stats} />,
    "danh-gia-rui-ro-ai": <AIRiskOverallWidget key={widgetId} />,
    "chi-tiet-danh-gia-rui-ro": <AIRiskIdentifiedWidget key={widgetId} />,
    "goi-y-khac-phuc": <AIRiskOpportunitiesWidget key={widgetId} />,
    "du-bao-doanh-thu": <RevenueForecast key={widgetId} />
  }

  return componentMap[widgetId] || null
}

/**
 * Converts widget configuration from JSON to Widget objects with components
 */
export function mapWidgetsFromConfig(
  config: WidgetMapperConfig,
  stats: DashboardStats
): Widget[] {
  return config.widgets.map((widgetConfig) => ({
    id: widgetConfig.id,
    title: WIDGET_TITLES[widgetConfig.id] || widgetConfig.id,
    component: createWidgetComponent(widgetConfig.id, stats),
    visible: widgetConfig.visible,
    module: widgetConfig.module as any, // Cast to WidgetModule type
    x: widgetConfig.x,
    y: widgetConfig.y,
    w: widgetConfig.w,
    h: widgetConfig.h
  }))
}
