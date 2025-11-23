"use server"

import { InventoryRepository } from "@/infrastructure/repositories/inventory-repo"
import { OperationalCostRepository } from "@/infrastructure/repositories/operational-cost-repo"
import { filterProductsUseCase } from "@/app/api/products/depends"
import { getOrdersUseCase } from "@/app/api/orders/depends"
import { calculatePeriodCosts } from "@/core/domain/managements/operational-cost"

/**
 * Get inventory alerts (low stock, out of stock)
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
      lowStock: lowStock.map(inv => ({
        inventoryId: inv.id,
        productId: inv.productId,
        productName: productMap.get(inv.productId) || "Unknown Product",
        currentStock: inv.currentStock,
        availableStock: inv.availableStock,
        reorderPoint: inv.reorderPoint,
        daysRemaining: inv.getDaysOfStockRemaining(),
      })),
      outOfStock: outOfStock.map(inv => ({
        inventoryId: inv.id,
        productId: inv.productId,
        productName: productMap.get(inv.productId) || "Unknown Product",
        currentStock: inv.currentStock,
        reservedStock: inv.reservedStock,
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

/**
 * Get profit margin analysis
 */
export async function getProfitAnalysis() {
  try {
    const ordersUseCase = await getOrdersUseCase()
    const productsUseCase = await filterProductsUseCase()
    const costRepo = new OperationalCostRepository()

    const [ordersResult, productsResult] = await Promise.all([
      ordersUseCase.execute({}),
      productsUseCase.execute({}),
    ])

    const orders = ordersResult.orders
    const products = productsResult.products

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Calculate 7-day and 30-day trailing periods
    const last7DaysStart = new Date(todayStart)
    last7DaysStart.setDate(last7DaysStart.getDate() - 7)
    const last30DaysStart = new Date(todayStart)
    last30DaysStart.setDate(last30DaysStart.getDate() - 30)

    // Get operational costs for 7-day and 30-day periods
    const [last7DaysCosts, last30DaysCosts] = await Promise.all([
      costRepo.getByDateRange(last7DaysStart, now),
      costRepo.getByDateRange(last30DaysStart, now),
    ])

    // Calculate revenue
    const successfulOrders = orders.filter(o => o.payment.status === "success")
    const last7DaysOrders = successfulOrders.filter(o => new Date(o.createdAt) >= last7DaysStart)
    const last30DaysOrders = successfulOrders.filter(o => new Date(o.createdAt) >= last30DaysStart)

    const last7DaysRevenue = last7DaysOrders.reduce((sum, o) => sum + o.total, 0)
    const last30DaysRevenue = last30DaysOrders.reduce((sum, o) => sum + o.total, 0)

    // Calculate COGS (Cost of Goods Sold) from products with cost data
    const productCostMap = new Map(
      products.filter(p => p.cost).map(p => [p.id.toString(), p.cost!])
    )

    let last7DaysCOGS = 0
    let last30DaysCOGS = 0

    last7DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = productCostMap.get(item.productId)
        if (cost) {
          last7DaysCOGS += cost * item.quantity
        }
      })
    })

    last30DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = productCostMap.get(item.productId)
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

    // Top profit contributing products (using 30-day data)
    const productProfits = new Map<number, { name: string, revenue: number, cost: number, profit: number, margin: number }>()

    last30DaysOrders.forEach(order => {
      order.items.forEach(item => {
        const productId = parseInt(item.productId)
        const product = products.find(p => p.id === productId)
        if (!product || !product.cost) return

        const revenue = item.totalPrice
        const cost = product.cost * item.quantity
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
    }
  } catch (error) {
    console.error("Error calculating profit analysis:", error)
    return null
  }
}
