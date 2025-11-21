"use server"

import { getOrdersUseCase } from "@/app/api/orders/depends"
import { filterProductsUseCase } from "@/app/api/products/depends"
import { getAllCustomersUseCase } from "@/app/api/customers/depends"

export async function getDashboardStats() {
  try {
    // Get orders
    const ordersUseCase = await getOrdersUseCase()
    const ordersResult = await ordersUseCase.execute({})
    const orders = ordersResult.orders

    // Get products
    const productsUseCase = await filterProductsUseCase()
    const productsResult = await productsUseCase.execute({})
    const products = productsResult.products

    // Get customers
    const customersUseCase = await getAllCustomersUseCase()
    const customersResult = await customersUseCase.execute({})
    const customers = customersResult.customers

    // Get current time boundaries
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const last7DaysStart = new Date(todayStart)
    last7DaysStart.setDate(last7DaysStart.getDate() - 7)
    const last30DaysStart = new Date(todayStart)
    last30DaysStart.setDate(last30DaysStart.getDate() - 30)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Helper to filter orders by date range
    const filterOrdersByDate = (orders: typeof ordersResult.orders, startDate: Date, endDate: Date = now) => {
      return orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    }

    // Calculate revenue metrics
    const todayOrders = filterOrdersByDate(orders, todayStart)
    const yesterdayOrders = filterOrdersByDate(orders, yesterdayStart, todayStart)
    const thisMonthOrders = filterOrdersByDate(orders, thisMonthStart)
    const lastMonthOrders = filterOrdersByDate(orders, lastMonthStart, lastMonthEnd)
    const last7DaysOrders = filterOrdersByDate(orders, last7DaysStart)

    const calculateRevenue = (orders: typeof ordersResult.orders) =>
      orders.filter(o => o.payment.status === "success").reduce((sum, o) => sum + o.total, 0)

    const todayRevenue = calculateRevenue(todayOrders)
    const yesterdayRevenue = calculateRevenue(yesterdayOrders)
    const thisMonthRevenue = calculateRevenue(thisMonthOrders)
    const lastMonthRevenue = calculateRevenue(lastMonthOrders)
    const last7DaysRevenue = calculateRevenue(last7DaysOrders)

    // Calculate percentage changes
    const revenueChangeVsYesterday = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0
    const revenueChangeVsLastMonth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0

    // Order metrics
    const todayOrderCount = todayOrders.length
    const completedOrders = orders.filter(o => o.status === "completed").length
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length
    const completionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0

    // Calculate AOV (Average Order Value)
    const successfulOrders = orders.filter(o => o.payment.status === "success")
    const aov = successfulOrders.length > 0
      ? successfulOrders.reduce((sum, o) => sum + o.total, 0) / successfulOrders.length
      : 0

    // Error rate
    const failedOrders = orders.filter(o => o.payment.status === "failed" || o.status === "cancelled").length
    const errorRate = orders.length > 0 ? (failedOrders / orders.length) * 100 : 0

    // Customer metrics
    const todayCustomers = customers.filter(c => {
      if (!c.createdAt) return false
      const createdAt = new Date(c.createdAt)
      return createdAt >= todayStart
    })
    const returningCustomers = customers.filter(c => {
      const customerOrders = orders.filter(o => o.customerId === c.id)
      return customerOrders.length > 1
    })
    const returningRate = customers.length > 0 ? (returningCustomers.length / customers.length) * 100 : 0

    // Churn risk - customers who haven't ordered in 30 days
    const churnRiskCustomers = customers.filter(c => {
      const customerOrders = orders.filter(o => o.customerId === c.id)
      if (customerOrders.length === 0) return false
      const lastOrder = customerOrders.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
      const daysSinceLastOrder = (now.getTime() - new Date(lastOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceLastOrder > 30
    })
    const churnRiskRate = customers.length > 0 ? (churnRiskCustomers.length / customers.length) * 100 : 0

    // Product performance
    const productSales = new Map<string, { productId: string, productName: string, quantity: number, revenue: number }>()

    successfulOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          quantity: 0,
          revenue: 0
        }
        existing.quantity += item.quantity
        existing.revenue += item.totalPrice
        productSales.set(item.productId, existing)
      })
    })

    const topSellingProducts = Array.from(productSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    // Risk alerts
    const avg7DaysRevenue = last7DaysRevenue / 7
    const revenueDropAlert = todayRevenue < avg7DaysRevenue * 0.7 // 30% drop
    const cancelRateAlert = errorRate > 10 // More than 10% error rate

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    // Order status breakdown
    const ordersByStatus = {
      pending: orders.filter(o => o.status === "pending").length,
      shipping: orders.filter(o => o.status === "shipping").length,
      completed: completedOrders,
    }

    // Payment status breakdown
    const ordersByPayment = {
      pending: orders.filter(o => o.payment.status === "pending").length,
      success: orders.filter(o => o.payment.status === "success").length,
      failed: orders.filter(o => o.payment.status === "failed").length,
    }

    // ===== NEW ENHANCEMENTS =====

    // 1. Calculate Customer Lifetime Value (LTV)
    const customerLTVMap = new Map<string, number>()
    successfulOrders.forEach(order => {
      const currentLTV = customerLTVMap.get(order.customerId) || 0
      customerLTVMap.set(order.customerId, currentLTV + order.total)
    })
    const avgLTV = customerLTVMap.size > 0
      ? Array.from(customerLTVMap.values()).reduce((sum, ltv) => sum + ltv, 0) / customerLTVMap.size
      : 0

    // 2. Product performance trends (declining products)
    const now30DaysAgo = new Date(todayStart)
    now30DaysAgo.setDate(now30DaysAgo.getDate() - 30)
    const now60DaysAgo = new Date(todayStart)
    now60DaysAgo.setDate(now60DaysAgo.getDate() - 60)

    const recent30DaysOrders = filterOrdersByDate(orders, now30DaysAgo, now)
    const previous30DaysOrders = filterOrdersByDate(orders, now60DaysAgo, now30DaysAgo)

    const recentProductSales = new Map<string, number>()
    const previousProductSales = new Map<string, number>()

    recent30DaysOrders.filter(o => o.payment.status === "success").forEach(order => {
      order.items.forEach(item => {
        recentProductSales.set(item.productId, (recentProductSales.get(item.productId) || 0) + item.quantity)
      })
    })

    previous30DaysOrders.filter(o => o.payment.status === "success").forEach(order => {
      order.items.forEach(item => {
        previousProductSales.set(item.productId, (previousProductSales.get(item.productId) || 0) + item.quantity)
      })
    })

    const decliningProducts = Array.from(recentProductSales.entries())
      .map(([productId, recentQty]) => {
        const previousQty = previousProductSales.get(productId) || 0
        const decline = previousQty > 0 ? ((recentQty - previousQty) / previousQty) * 100 : 0
        return { productId, recentQty, previousQty, decline }
      })
      .filter(p => p.decline < -20 && p.previousQty > 5) // Declining by more than 20% and had meaningful sales before
      .sort((a, b) => a.decline - b.decline)
      .slice(0, 5)
      .map(p => {
        const productName = productSales.get(p.productId)?.productName || "Unknown Product"
        return {
          productId: p.productId,
          productName,
          recentQuantity: p.recentQty,
          previousQuantity: p.previousQty,
          declinePercent: p.decline,
        }
      })

    // 3. Staff performance (if assignedTo is present)
    const staffPerformance = new Map<string, {
      orderCount: number
      revenue: number
      avgProcessingTime: number
      processingTimes: number[]
    }>()

    orders.filter(o => o.assignedTo).forEach(order => {
      const staffId = order.assignedTo!
      const current = staffPerformance.get(staffId) || {
        orderCount: 0,
        revenue: 0,
        avgProcessingTime: 0,
        processingTimes: [],
      }

      current.orderCount++
      if (order.payment.status === "success") {
        current.revenue += order.total
      }

      // Calculate processing time if timestamps exist
      if (order.confirmedAt && order.processingAt) {
        const processingTime = (new Date(order.processingAt).getTime() - new Date(order.confirmedAt).getTime()) / (1000 * 60 * 60)
        current.processingTimes.push(processingTime)
      }

      staffPerformance.set(staffId, current)
    })

    // Calculate average processing times
    const topPerformingStaff = Array.from(staffPerformance.entries())
      .map(([staffId, stats]) => ({
        staffId,
        orderCount: stats.orderCount,
        revenue: stats.revenue,
        avgProcessingTime: stats.processingTimes.length > 0
          ? stats.processingTimes.reduce((sum, t) => sum + t, 0) / stats.processingTimes.length
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // 4. Operational metrics
    const lateOrders = orders.filter(o => {
      if (!o.delivery.estimatedDelivery) return false
      return now > o.delivery.estimatedDelivery && o.status !== "delivered" && o.status !== "completed"
    }).length

    const avgProcessingTime = orders
      .filter(o => o.confirmedAt && o.processingAt)
      .map(o => (new Date(o.processingAt!).getTime() - new Date(o.confirmedAt!).getTime()) / (1000 * 60 * 60))
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0)

    // Note: AI predictions are now loaded separately via client-side actions
    // to prevent blocking the initial page load

    return {
      // Revenue metrics
      todayRevenue,
      yesterdayRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChangeVsYesterday,
      revenueChangeVsLastMonth,

      // Order metrics
      totalOrders: orders.length,
      todayOrderCount,
      pendingOrders: ordersByStatus.pending,
      completedOrders,
      cancelledOrders,
      completionRate,
      aov,
      errorRate,

      // Customer metrics
      totalCustomers: customers.length,
      todayNewCustomers: todayCustomers.length,
      returningCustomers: returningCustomers.length,
      returningRate,
      churnRiskCustomers: churnRiskCustomers.length,
      churnRiskRate,

      // Product metrics
      totalProducts: products.length,
      topSellingProducts,
      decliningProducts,

      // Risk alerts
      riskAlerts: {
        revenueDropAlert,
        cancelRateAlert,
        avg7DaysRevenue,
      },

      // NEW: Enhanced metrics
      avgLTV,
      topPerformingStaff,
      lateOrders,
      avgProcessingTime: avgProcessingTime || 0,

      // Legacy fields
      recentOrders: JSON.parse(JSON.stringify(recentOrders)),
      ordersByStatus,
      ordersByPayment,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return null
  }
}
