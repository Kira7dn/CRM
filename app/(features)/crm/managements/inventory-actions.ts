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
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get operational costs for today and this month
    const [todayCosts, monthCosts] = await Promise.all([
      costRepo.getByDateRange(todayStart, now),
      costRepo.getByDateRange(thisMonthStart, now),
    ])

    // Calculate revenue
    const successfulOrders = orders.filter(o => o.payment.status === "success")
    const todayOrders = successfulOrders.filter(o => new Date(o.createdAt) >= todayStart)
    const monthOrders = successfulOrders.filter(o => new Date(o.createdAt) >= thisMonthStart)

    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0)
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.total, 0)

    // Calculate COGS (Cost of Goods Sold) from products with cost data
    const productCostMap = new Map(
      products.filter(p => p.cost).map(p => [p.id.toString(), p.cost!])
    )

    let todayCOGS = 0
    let monthCOGS = 0

    todayOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = productCostMap.get(item.productId)
        if (cost) {
          todayCOGS += cost * item.quantity
        }
      })
    })

    monthOrders.forEach(order => {
      order.items.forEach(item => {
        const cost = productCostMap.get(item.productId)
        if (cost) {
          monthCOGS += cost * item.quantity
        }
      })
    })

    // Calculate operational costs
    const todayOpCosts = calculatePeriodCosts(todayCosts, todayStart, now)
    const monthOpCosts = calculatePeriodCosts(monthCosts, thisMonthStart, now)

    // Calculate gross profit and margins
    const todayGrossProfit = todayRevenue - todayCOGS
    const todayGrossMargin = todayRevenue > 0 ? (todayGrossProfit / todayRevenue) * 100 : 0

    const monthGrossProfit = monthRevenue - monthCOGS
    const monthGrossMargin = monthRevenue > 0 ? (monthGrossProfit / monthRevenue) * 100 : 0

    // Calculate net profit (after operational costs)
    const todayNetProfit = todayGrossProfit - todayOpCosts.total
    const todayNetMargin = todayRevenue > 0 ? (todayNetProfit / todayRevenue) * 100 : 0

    const monthNetProfit = monthGrossProfit - monthOpCosts.total
    const monthNetMargin = monthRevenue > 0 ? (monthNetProfit / monthRevenue) * 100 : 0

    // Top profit contributing products
    const productProfits = new Map<number, { name: string, revenue: number, cost: number, profit: number, margin: number }>()

    monthOrders.forEach(order => {
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
      today: {
        revenue: todayRevenue,
        cogs: todayCOGS,
        grossProfit: todayGrossProfit,
        grossMargin: todayGrossMargin,
        operationalCosts: todayOpCosts.total,
        netProfit: todayNetProfit,
        netMargin: todayNetMargin,
      },
      month: {
        revenue: monthRevenue,
        cogs: monthCOGS,
        grossProfit: monthGrossProfit,
        grossMargin: monthGrossMargin,
        operationalCosts: monthOpCosts.total,
        netProfit: monthNetProfit,
        netMargin: monthNetMargin,
      },
      topProfitProducts,
      costBreakdown: {
        today: todayOpCosts.byCategory,
        month: monthOpCosts.byCategory,
      },
    }
  } catch (error) {
    console.error("Error calculating profit analysis:", error)
    return null
  }
}
