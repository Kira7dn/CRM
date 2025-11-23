"use server"

import { getOrdersUseCase } from "@/app/api/orders/depends"
import { getAllCustomersUseCase } from "@/app/api/customers/depends"
import { RevenueForecastService, type RevenueDataPoint } from "@/infrastructure/ai/revenue-forecast-service"
import { RiskAssessmentService, type BusinessMetrics } from "@/infrastructure/ai/risk-assessment-service"

/**
 * Generate AI revenue forecast
 * Separate action to avoid blocking main dashboard load
 */
export async function generateRevenueForecast() {
  try {
    const ordersUseCase = await getOrdersUseCase()
    const ordersResult = await ordersUseCase.execute({})
    const orders = ordersResult.orders

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Helper to filter orders by date range
    const filterOrdersByDate = (orders: typeof ordersResult.orders, startDate: Date, endDate: Date = now) => {
      return orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    }

    const calculateRevenue = (orders: typeof ordersResult.orders) =>
      orders.filter(o => o.payment.status === "success").reduce((sum, o) => sum + o.total, 0)

    // Prepare 30 days of historical data
    const historicalRevenueData: RevenueDataPoint[] = []
    for (let i = 29; i >= 0; i--) {
      const dayStart = new Date(todayStart)
      dayStart.setDate(dayStart.getDate() - i)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const dayOrders = filterOrdersByDate(orders, dayStart, dayEnd)
      const dayRevenue = calculateRevenue(dayOrders)
      const dayOrderCount = dayOrders.length
      const dayAOV = dayOrderCount > 0 ? dayRevenue / dayOrderCount : 0

      historicalRevenueData.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue,
        orderCount: dayOrderCount,
        avgOrderValue: dayAOV,
      })
    }

    const forecastService = new RevenueForecastService()
    const forecast = await forecastService.generateForecast(historicalRevenueData)

    return {
      success: true,
      forecast: forecast || forecastService.generateStatisticalForecast(historicalRevenueData),
    }
  } catch (error) {
    console.error("Error generating revenue forecast:", error)
    return {
      success: false,
      error: "Failed to generate revenue forecast",
    }
  }
}

/**
 * Generate AI risk assessment
 * Separate action to avoid blocking main dashboard load
 */
export async function generateRiskAssessment() {
  try {
    const ordersUseCase = await getOrdersUseCase()
    const customersUseCase = await getAllCustomersUseCase()

    const ordersResult = await ordersUseCase.execute({})
    const customersResult = await customersUseCase.execute({})

    const orders = ordersResult.orders
    const customers = customersResult.customers

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart)
    yesterdayStart.setDate(yesterdayStart.getDate() - 1)
    const last7DaysStart = new Date(todayStart)
    last7DaysStart.setDate(last7DaysStart.getDate() - 7)
    const last30DaysStart = new Date(todayStart)
    last30DaysStart.setDate(last30DaysStart.getDate() - 30)

    const filterOrdersByDate = (orders: typeof ordersResult.orders, startDate: Date, endDate: Date = now) => {
      return orders.filter(o => {
        const orderDate = new Date(o.createdAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    }

    const calculateRevenue = (orders: typeof ordersResult.orders) =>
      orders.filter(o => o.payment.status === "success").reduce((sum, o) => sum + o.total, 0)

    const todayOrders = filterOrdersByDate(orders, todayStart)
    const yesterdayOrders = filterOrdersByDate(orders, yesterdayStart, todayStart)
    const last7DaysOrders = filterOrdersByDate(orders, last7DaysStart)
    const last30DaysOrders = filterOrdersByDate(orders, last30DaysStart)

    const todayRevenue = calculateRevenue(todayOrders)
    const yesterdayRevenue = calculateRevenue(yesterdayOrders)
    const last7DaysRevenue = calculateRevenue(last7DaysOrders)
    const last30DaysRevenue = calculateRevenue(last30DaysOrders)

    const revenueChangePercent = yesterdayRevenue > 0
      ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
      : 0

    const completedOrders = orders.filter(o => o.status === "completed").length
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length
    const completionRate = orders.length > 0 ? (completedOrders / orders.length) * 100 : 0

    const failedOrders = orders.filter(o => o.payment.status === "failed" || o.status === "cancelled").length
    const errorRate = orders.length > 0 ? (failedOrders / orders.length) * 100 : 0

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

    const lateOrders = orders.filter(o => {
      if (!o.delivery.estimatedDelivery) return false
      return now > o.delivery.estimatedDelivery && o.status !== "delivered" && o.status !== "completed"
    }).length

    const avgProcessingTime = orders
      .filter(o => o.confirmedAt && o.processingAt)
      .map(o => (new Date(o.processingAt!).getTime() - new Date(o.confirmedAt!).getTime()) / (1000 * 60 * 60))
      .reduce((sum, time, _, arr) => sum + time / arr.length, 0)

    const businessMetrics: BusinessMetrics = {
      todayRevenue,
      yesterdayRevenue,
      last7DaysRevenue,
      last30DaysRevenue,
      revenueChangePercent,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === "pending").length,
      cancelledOrders,
      completionRate,
      errorRate,
      avgProcessingTime: avgProcessingTime || undefined,
      totalCustomers: customers.length,
      newCustomersToday: todayCustomers.length,
      churnRiskCount: churnRiskCustomers.length,
      churnRiskRate,
      returningRate,
      lateOrders,
    }

    const riskService = new RiskAssessmentService()
    const assessment = await riskService.assessRisks(businessMetrics)

    return {
      success: true,
      assessment,
    }
  } catch (error) {
    console.error("Error generating risk assessment:", error)
    return {
      success: false,
      error: "Failed to generate risk assessment",
    }
  }
}
