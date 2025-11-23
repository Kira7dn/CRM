import { getCurrentUserAction } from "../../_shared/actions/auth-actions"
import { getDashboardStats } from "../actions"
import { CustomizableDashboardClient } from "./_components/CustomizableDashboardClient"
import { Widget } from "./_components/GridStackDashboard"

// Individual modular widgets
import { RiskAlerts } from "./_components/widgets/Alerts/RiskAlerts"
import { TopProducts } from "./_components/widgets/order/TopProducts"
import { RevenueForecast } from "./_components/widgets/forecast/RevenueForecast"
import { RecentOrders } from "./_components/widgets/order/RecentOrders"
import { InventoryAlertsWidget } from "./_components/widgets/Alerts/InventoryAlertsWidget"
import { WeekRevenueWidget } from "./_components/widgets/finance/WeekRevenueWidget"
import { MonthRevenueWidget } from "./_components/widgets/finance/MonthRevenueWidget"
import { NewCustomersWidget } from "./_components/widgets/customer/NewCustomersWidget"
import { WeekOrdersWidget } from "./_components/widgets/finance/WeekOrdersWidget"
import { AverageOrderValueWidget } from "./_components/widgets/order/AverageOrderValueWidget"
import { ChurnRiskWidget } from "./_components/widgets/customer/ChurnRiskWidget"
import { ErrorRateWidget } from "./_components/widgets/order/ErrorRateWidget"
import { TotalProductsWidget } from "./_components/widgets/product/TotalProductsWidget"
import { ReturningCustomersWidget } from "./_components/widgets/customer/ReturningCustomersWidget"
import { CustomerLTVWidget } from "./_components/widgets/customer/CustomerLTVWidget"
import { LateOrdersWidget } from "./_components/widgets/order/LateOrdersWidget"
import { ProcessingTimeWidget } from "./_components/widgets/order/ProcessingTimeWidget"
import { TopProfitProductsWidget } from "./_components/widgets/product/TopProfitProductsWidget"
import { DecliningProductsWidget } from "./_components/widgets/product/DecliningProductsWidget"
import { TopStaffWidget } from "./_components/widgets/order/TopStaffWidget"
import { MonthProfitWidget } from "./_components/widgets/finance/MonthProfitWidget"
import { WeekProfitWidget } from "./_components/widgets/finance/WeekProfitWidget"
import { AIRiskOverallWidgetClient } from "./_components/widgets/risk/AIRiskOverallWidgetClient"
import { AIRiskIdentifiedWidgetClient } from "./_components/widgets/risk/AIRiskIdentifiedWidgetClient"
import { AIRiskOpportunitiesWidgetClient } from "./_components/widgets/risk/AIRiskOpportunitiesWidgetClient"
import { OrderStatusWidget } from "./_components/widgets/order/OrderStatusWidget"
import { PaymentStatusWidget } from "./_components/widgets/order/PaymentStatusWidget"


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
      id: "doanh-thu-7-ngay",
      title: "Doanh thu 7 ngày",
      component: (
        <WeekRevenueWidget
          key="doanh-thu-7-ngay"
          last7DaysRevenue={stats.last7DaysRevenue}
          prev7DaysRevenue={stats.prev7DaysRevenue}
          revenueChangeVsPrev7Days={stats.revenueChangeVsPrev7Days}
        />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "doanh-thu-30-ngay",
      title: "Doanh thu 30 ngày",
      component: (
        <MonthRevenueWidget
          key="doanh-thu-30-ngay"
          last30DaysRevenue={stats.last30DaysRevenue}
          prev30DaysRevenue={stats.prev30DaysRevenue}
          revenueChangeVsPrev30Days={stats.revenueChangeVsPrev30Days}
        />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "gia-tri-don-trung-binh",
      title: "Giá trị đơn TB",
      component: (
        <AverageOrderValueWidget
          key="gia-tri-don-trung-binh"
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
      id: "loi-nhuan-7-ngay",
      title: "Lợi nhuận 7 ngày",
      component: <WeekProfitWidget key="loi-nhuan-7-ngay" />,
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "loi-nhuan-30-ngay",
      title: "Lợi nhuận 30 ngày",
      component: (
        <MonthProfitWidget key="loi-nhuan-30-ngay" />
      ),
      visible: true,
      module: "finance",
      w: 2,
      h: 3,
    },
    {
      id: "san-pham-co-loi-nhuan-cao",
      title: "Top SP lợi nhuận",
      component: <TopProfitProductsWidget key="san-pham-co-loi-nhuan-cao" />,
      visible: true,
      module: "finance",
      w: 6,
      h: 5,
    },

    // Customer module - Individual customer widgets
    {
      id: "khach-hang-moi",
      title: "Khách hàng mới",
      component: (
        <NewCustomersWidget
          key="khach-hang-moi"
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
      id: "khach-hang-quay-lai",
      title: "Khách hàng quay lại",
      component: (
        <ReturningCustomersWidget
          key="khach-hang-quay-lai"
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
      id: "nguy-co-roi-bo",
      title: "Nguy cơ rời bỏ",
      component: (
        <ChurnRiskWidget
          key="nguy-co-roi-bo"
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
      id: "gia-tri-tron-doi-khach-hang",
      title: "LTV TB khách hàng",
      component: <CustomerLTVWidget key="gia-tri-tron-doi-khach-hang" avgLTV={stats.avgLTV} />,
      visible: true,
      module: "customer",
      w: 2,
      h: 3,
    },

    // Order module - Individual order widgets
    {
      id: "don-hang-7-ngay",
      title: "Đơn hàng 7 ngày",
      component: (
        <WeekOrdersWidget
          key="don-hang-7-ngay"
          last7DaysOrderCount={stats.last7DaysOrderCount}
          prev7DaysOrderCount={stats.prev7DaysOrderCount}
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
      id: "ty-le-loi",
      title: "Tỷ lệ lỗi",
      component: (
        <ErrorRateWidget
          key="ty-le-loi"
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
      id: "don-tre-han",
      title: "Đơn trễ hạn",
      component: <LateOrdersWidget key="don-tre-han" lateOrders={stats.lateOrders} />,
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    {
      id: "thoi-gian-xu-ly-trung-binh",
      title: "Thời gian xử lý TB",
      component: (
        <ProcessingTimeWidget
          key="thoi-gian-xu-ly-trung-binh"
          avgProcessingTime={stats.avgProcessingTime}
        />
      ),
      visible: true,
      module: "order",
      w: 2,
      h: 3,
    },
    {
      id: "trang-thai-don-hang",
      title: "Trạng thái đơn hàng",
      component: (
        <OrderStatusWidget
          key="trang-thai-don-hang"
          ordersByStatus={stats.ordersByStatus}
        />
      ),
      visible: true,
      module: "order",
      w: 6,
      h: 5,
    },
    {
      id: "trang-thai-thanh-toan",
      title: "Trạng thái thanh toán",
      component: (
        <PaymentStatusWidget
          key="trang-thai-thanh-toan"
          ordersByPayment={stats.ordersByPayment}
        />
      ),
      visible: true,
      module: "order",
      w: 6,
      h: 3,
    },
    {
      id: "don-hang-gan-day",
      title: "Đơn hàng gần đây",
      component: <RecentOrders key="don-hang-gan-day" orders={stats.recentOrders} />,
      visible: true,
      module: "order",
      w: 6,
      h: 3,
    },
    {
      id: "nhan-vien-xuat-sac",
      title: "Nhân viên xuất sắc",
      component: <TopStaffWidget key="nhan-vien-xuat-sac" topPerformingStaff={stats.topPerformingStaff} />,
      visible: true,
      module: "order",
      w: 6,
      h: 5,
    },

    // Product module
    {
      id: "tong-san-pham",
      title: "Tổng sản phẩm",
      component: (
        <TotalProductsWidget
          key="tong-san-pham"
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
      id: "san-pham-ban-chay",
      title: "Sản phẩm bán chạy",
      component: <TopProducts key="san-pham-ban-chay" products={stats.topSellingProducts} />,
      visible: true,
      module: "product",
      w: 6,
      h: 5,
    },
    {
      id: "san-pham-sut-giam",
      title: "Sản phẩm sụt giảm",
      component: <DecliningProductsWidget key="san-pham-sut-giam" decliningProducts={stats.decliningProducts} />,
      visible: true,
      module: "product",
      w: 2,
      h: 3,
    },
    {
      id: "inventory-alerts",
      title: "Cảnh báo tồn kho",
      component: <InventoryAlertsWidget />,
      visible: true,
      module: "inventory",
      w: 2,
      h: 1,
    },

    // Risk module
    {
      id: "canh-bao-rui-ro",
      title: "Cảnh báo rủi ro",
      component: <RiskAlerts key="canh-bao-rui-ro" stats={stats} />,
      visible: true,
      module: "risk",
      w: 6,
      h: 3,
    },
    {
      id: "danh-gia-rui-ro-ai",
      title: "Đánh giá rủi ro AI",
      component: <AIRiskOverallWidgetClient key="danh-gia-rui-ro-ai" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },
    {
      id: "chi-tiet-danh-gia-rui-ro",
      title: "Chi tiết đánh giá rủi ro AI",
      component: <AIRiskIdentifiedWidgetClient key="chi-tiet-danh-gia-rui-ro" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },
    {
      id: "goi-y-khac-phuc",
      title: "Gợi ý khắc phục",
      component: <AIRiskOpportunitiesWidgetClient key="goi-y-khac-phuc" />,
      visible: true,
      module: "risk",
      w: 6,
      h: 2,
    },

    // Forecast module
    {
      id: "du-bao-doanh-thu",
      title: "Dự báo doanh thu",
      component: <RevenueForecast key="du-bao-doanh-thu" />,
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
