"use server"

import { getOrdersUseCase } from "@/app/api/orders/depends"
import { filterProductsUseCase } from "@/app/api/products/depends"
import { getAllCustomersUseCase } from "@/app/api/customers/depends"
import { OperationalCostRepository } from "@/infrastructure/repositories/operational-cost-repo"
import { InventoryRepository } from "@/infrastructure/repositories/inventory-repo"
import { calculatePeriodCosts } from "@/core/domain/managements/operational-cost"
import {
  getDateBoundaries,
  filterOrdersByDate,
  getPreviousPeriodStart,
  calculateRevenue,
  calculatePercentageChange,
  calculateAOV,
  calculateCompletionRate,
  calculateErrorRate,
} from "./utils"

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

    // Get date boundaries
    const {
      now,
      todayStart,
      yesterdayStart,
      last7DaysStart,
      last30DaysStart,
      thisMonthStart,
      lastMonthStart,
      lastMonthEnd,
    } = getDateBoundaries()

    // Calculate revenue metrics
    const todayOrders = filterOrdersByDate(orders, todayStart, now)
    const yesterdayOrders = filterOrdersByDate(orders, yesterdayStart, todayStart)
    const thisMonthOrders = filterOrdersByDate(orders, thisMonthStart, now)
    const lastMonthOrders = filterOrdersByDate(orders, lastMonthStart, lastMonthEnd)
    const last7DaysOrders = filterOrdersByDate(orders, last7DaysStart, now)
    const last30DaysOrders = filterOrdersByDate(orders, last30DaysStart, now)

    const todayRevenue = calculateRevenue(todayOrders)
    const yesterdayRevenue = calculateRevenue(yesterdayOrders)
    const thisMonthRevenue = calculateRevenue(thisMonthOrders)
    const lastMonthRevenue = calculateRevenue(lastMonthOrders)
    const last7DaysRevenue = calculateRevenue(last7DaysOrders)
    const last30DaysRevenue = calculateRevenue(last30DaysOrders)

    // Calculate previous 7-day and 30-day for comparison
    const prev7DaysStart = getPreviousPeriodStart(last7DaysStart, now)
    const prev7DaysOrders = filterOrdersByDate(orders, prev7DaysStart, last7DaysStart)
    const prev7DaysRevenue = calculateRevenue(prev7DaysOrders)

    const prev30DaysStart = getPreviousPeriodStart(last30DaysStart, now)
    const prev30DaysOrders = filterOrdersByDate(orders, prev30DaysStart, last30DaysStart)
    const prev30DaysRevenue = calculateRevenue(prev30DaysOrders)

    // Calculate percentage changes
    const revenueChangeVsYesterday = calculatePercentageChange(todayRevenue, yesterdayRevenue)
    const revenueChangeVsLastMonth = calculatePercentageChange(thisMonthRevenue, lastMonthRevenue)

    // Order metrics
    const todayOrderCount = todayOrders.length
    const completedOrders = orders.filter(o => o.status === "completed").length
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length
    const completionRate = calculateCompletionRate(orders)
    const aov = calculateAOV(orders)
    const errorRate = calculateErrorRate(orders)

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
    const successfulOrders = orders.filter(o => o.payment.status === "success")
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

    // Calculate change percentages for trailing data
    const revenueChangeVsPrev7Days = calculatePercentageChange(last7DaysRevenue, prev7DaysRevenue)
    const revenueChangeVsPrev30Days = calculatePercentageChange(last30DaysRevenue, prev30DaysRevenue)

    // Calculate 7-day trailing metrics (orders, profit will be calculated in widgets)
    const last7DaysOrderCount = last7DaysOrders.length
    const prev7DaysOrderCount = prev7DaysOrders.length
    const last30DaysOrderCount = last30DaysOrders.length
    const prev30DaysOrderCount = prev30DaysOrders.length

    // ===== PROFIT ANALYSIS =====

    // Get operational costs for 7-day and 30-day periods
    const costRepo = new OperationalCostRepository()
    const [last7DaysCosts, last30DaysCosts] = await Promise.all([
      costRepo.getByDateRange(last7DaysStart, now),
      costRepo.getByDateRange(last30DaysStart, now),
    ])

    // Calculate COGS (Cost of Goods Sold) from inventory cost data
    const inventoryRepo = new InventoryRepository()
    const inventory = await inventoryRepo.getAll()
    const inventoryCostMap = new Map(
      inventory.map(inv => [inv.productId.toString(), inv.unitCost])
    )

    let last7DaysCOGS = 0
    let last30DaysCOGS = 0

    last7DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = inventoryCostMap.get(item.productId)
        if (cost) {
          last7DaysCOGS += cost * item.quantity
        }
      })
    })

    last30DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = inventoryCostMap.get(item.productId)
        if (cost) {
          last30DaysCOGS += cost * item.quantity
        }
      })
    })

    // Calculate operational costs
    const last7DaysOpCosts = calculatePeriodCosts(last7DaysCosts, last7DaysStart, now)
    const last30DaysOpCosts = calculatePeriodCosts(last30DaysCosts, last30DaysStart, now)

    // Calculate gross profit and margins for 7-day period
    const last7DaysGrossProfit = last7DaysRevenue - last7DaysCOGS
    const last7DaysGrossMargin = last7DaysRevenue > 0 ? (last7DaysGrossProfit / last7DaysRevenue) * 100 : 0

    // Calculate gross profit and margins for 30-day period
    const last30DaysGrossProfit = last30DaysRevenue - last30DaysCOGS
    const last30DaysGrossMargin = last30DaysRevenue > 0 ? (last30DaysGrossProfit / last30DaysRevenue) * 100 : 0

    // Calculate net profit (after operational costs) for 7-day period
    const last7DaysNetProfit = last7DaysGrossProfit - last7DaysOpCosts.total
    const last7DaysNetMargin = last7DaysRevenue > 0 ? (last7DaysNetProfit / last7DaysRevenue) * 100 : 0

    // Calculate net profit (after operational costs) for 30-day period
    const last30DaysNetProfit = last30DaysGrossProfit - last30DaysOpCosts.total
    const last30DaysNetMargin = last30DaysRevenue > 0 ? (last30DaysNetProfit / last30DaysRevenue) * 100 : 0

    // Top profit contributing products (using 30-day data with inventory cost)
    const productProfits = new Map<number, { name: string, revenue: number, cost: number, profit: number, margin: number }>()

    last30DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = parseInt(item.productId)
        const product = products.find(p => p.id === productId)
        if (!product) return

        const inventoryCost = inventoryCostMap.get(item.productId)
        if (!inventoryCost) return

        const revenue = item.totalPrice
        const cost = inventoryCost * item.quantity
        const profit = revenue - cost
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0

        const existing = productProfits.get(productId)
        if (existing) {
          existing.revenue += revenue
          existing.cost += cost
          existing.profit += profit
          existing.margin = existing.revenue > 0 ? (existing.profit / existing.revenue) * 100 : 0
        } else {
          productProfits.set(productId, {
            name: product.name,
            revenue,
            cost,
            profit,
            margin,
          })
        }
      })
    })

    const topProfitProducts = Array.from(productProfits.entries())
      .map(([productId, data]) => ({ productId, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)

    return {
      // Revenue metrics
      todayRevenue,
      yesterdayRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChangeVsYesterday,
      revenueChangeVsLastMonth,

      // Trailing metrics (7-day and 30-day)
      last7DaysRevenue,
      prev7DaysRevenue,
      revenueChangeVsPrev7Days,
      last7DaysOrderCount,
      prev7DaysOrderCount,
      last30DaysRevenue,
      prev30DaysRevenue,
      revenueChangeVsPrev30Days,
      last30DaysOrderCount,
      prev30DaysOrderCount,

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

      // Profit metrics (7-day and 30-day trailing)
      profitMetrics: {
        last7Days: {
          revenue: last7DaysRevenue,
          cogs: last7DaysCOGS,
          grossProfit: last7DaysGrossProfit,
          grossMargin: last7DaysGrossMargin,
          operationalCosts: last7DaysOpCosts.total,
          netProfit: last7DaysNetProfit,
          netMargin: last7DaysNetMargin,
        },
        last30Days: {
          revenue: last30DaysRevenue,
          cogs: last30DaysCOGS,
          grossProfit: last30DaysGrossProfit,
          grossMargin: last30DaysGrossMargin,
          operationalCosts: last30DaysOpCosts.total,
          netProfit: last30DaysNetProfit,
          netMargin: last30DaysNetMargin,
        },
        topProfitProducts,
        costBreakdown: {
          last7Days: last7DaysOpCosts.byCategory,
          last30Days: last30DaysOpCosts.byCategory,
        },
      },

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

/**
 * Get inventory alerts (low stock, out of stock)
 * Merged from inventory-actions.ts
 */
export async function getInventoryAlerts() {
  try {
    const inventoryRepo = new InventoryRepository()

    const [lowStock, outOfStock] = await Promise.all([
      inventoryRepo.getLowStockItems(),
      inventoryRepo.getOutOfStockItems(),
    ])

    // Get product names for alerts
    const productsUseCase = await filterProductsUseCase()
    const productsResult = await productsUseCase.execute({})
    const products = productsResult.products

    const productMap = new Map(products.map(p => [p.id, p.name]))

    return {
      lowStock: lowStock.map(summary => ({
        productId: summary.productId,
        productName: productMap.get(summary.productId) || "Unknown Product",
        currentStock: summary.currentStock,
        reorderPoint: summary.reorderPoint,
        reorderQuantity: summary.reorderQuantity,
        lastMovementDate: summary.lastMovementDate,
        totalValue: summary.totalValue
      })),
      outOfStock: outOfStock.map(summary => ({
        productId: summary.productId,
        productName: productMap.get(summary.productId) || "Unknown Product",
        currentStock: summary.currentStock,
        reorderPoint: summary.reorderPoint,
        reorderQuantity: summary.reorderQuantity,
        lastMovementDate: summary.lastMovementDate
      })),
    }
  } catch (error) {
    console.error("Error fetching inventory alerts:", error)
    return {
      lowStock: [],
      outOfStock: [],
    }
  }
}
