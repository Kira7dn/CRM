import { generateObject } from "ai"
import { z } from "zod"
import { aiConfig, isAIEnabled } from "./ai-config"

/**
 * Revenue forecast result schema
 */
const RevenueForecastSchema = z.object({
  nextDay: z.object({
    prediction: z.number().describe("Predicted revenue for next day"),
    confidence: z.enum(["low", "medium", "high"]),
    reasoning: z.string().describe("Brief explanation of the prediction"),
  }),
  next7Days: z.object({
    prediction: z.number().describe("Predicted revenue for next 7 days"),
    confidence: z.enum(["low", "medium", "high"]),
    reasoning: z.string().describe("Brief explanation of the prediction"),
  }),
  next30Days: z.object({
    prediction: z.number().describe("Predicted revenue for next 30 days"),
    confidence: z.enum(["low", "medium", "high"]),
    reasoning: z.string().describe("Brief explanation of the prediction"),
  }),
  trends: z.array(z.string()).describe("Key trends identified in the data"),
  recommendations: z.array(z.string()).describe("Actionable recommendations to improve revenue"),
})

export type RevenueForecast = z.infer<typeof RevenueForecastSchema>

/**
 * Historical revenue data point
 */
export interface RevenueDataPoint {
  date: string
  revenue: number
  orderCount: number
  avgOrderValue: number
}

/**
 * Revenue Forecast Service using OpenAI
 */
export class RevenueForecastService {
  /**
   * Generate revenue forecast based on historical data
   */
  async generateForecast(historicalData: RevenueDataPoint[]): Promise<RevenueForecast | null> {
    if (!isAIEnabled()) {
      console.warn("AI features are disabled. Skipping revenue forecast.")
      return null
    }

    // Check cache first
    // const cacheKey = generateCacheKey("revenue-forecast", historicalData)
    // const cache = await CacheFactory.getInstance({
    //   defaultTTL: 1800, // 30 minutes default
    //   enableLogging: process.env.NODE_ENV === "development",
    // })

    // const cached = await cache.get<RevenueForecast>(cacheKey)
    // if (cached) {
    //   console.log("[RevenueForecast] Cache hit for revenue forecast")
    //   return cached
    // }

    console.log("[RevenueForecast] Cache miss, generating new forecast")

    try {
      // Calculate summary statistics
      const totalRevenue = historicalData.reduce((sum, d) => sum + d.revenue, 0)
      const avgDailyRevenue = totalRevenue / historicalData.length
      const totalOrders = historicalData.reduce((sum, d) => sum + d.orderCount, 0)
      const avgDailyOrders = totalOrders / historicalData.length

      // Build prompt with historical data
      const prompt = `Bạn là chuyên gia phân tích kinh doanh. Phân tích dữ liệu doanh thu lịch sử sau và cung cấp dự đoán chính xác.

Dữ liệu lịch sử (${historicalData.length} ngày gần nhất):
${historicalData.map(d => `Ngày: ${d.date}, Doanh thu: ${d.revenue.toFixed(0)} VND, Đơn hàng: ${d.orderCount}, AOV: ${d.avgOrderValue.toFixed(0)} VND`).join("\n")}

Thống kê tổng hợp:
- Tổng doanh thu: ${totalRevenue.toFixed(0)} VND
- Doanh thu trung bình mỗi ngày: ${avgDailyRevenue.toFixed(0)} VND
- Đơn hàng trung bình mỗi ngày: ${avgDailyOrders.toFixed(1)}
- Chu kỳ dữ liệu: ${historicalData.length} ngày

Dựa trên dữ liệu này, cung cấp dự đoán doanh thu cho:
1. Ngày tiếp theo
2. 7 ngày tới (tích lũy)
3. 30 ngày tới (tích lũy)

Cân nhắc:
- Xu hướng theo ngày trong tuần
- Xu hướng gần đây (tăng trưởng hoặc sụt giảm)
- Hiệu ứng thời vụ
- Mô hình khối lượng đơn hàng

Cung cấp dự đoán thực tế với mức độ tin cậy và khuyến nghị có thể hành động.`

      const result = await generateObject({
        model: aiConfig.model,
        schema: RevenueForecastSchema,
        prompt,
        temperature: aiConfig.temperature,
      })

      // // Cache the result with 30 minutes TTL (historical data changes slowly)
      // await cache.set(cacheKey, result.object, 1800)
      // console.log("[RevenueForecast] Cached new forecast for 30 minutes")

      return result.object
    } catch (error) {
      console.error("Failed to generate revenue forecast:", error)
      return null
    }
  }

  /**
   * Generate simple statistical forecast as fallback
   */
  generateStatisticalForecast(historicalData: RevenueDataPoint[]): RevenueForecast {
    const recentData = historicalData.slice(-7) // Last 7 days
    const avgDailyRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0) / recentData.length

    // Calculate growth rate
    const firstHalf = recentData.slice(0, Math.ceil(recentData.length / 2))
    const secondHalf = recentData.slice(Math.ceil(recentData.length / 2))
    const firstAvg = firstHalf.reduce((sum, d) => sum + d.revenue, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.revenue, 0) / secondHalf.length
    const growthRate = (secondAvg - firstAvg) / firstAvg

    return {
      nextDay: {
        prediction: avgDailyRevenue * (1 + growthRate),
        confidence: "medium",
        reasoning: "Based on 7-day moving average with growth trend",
      },
      next7Days: {
        prediction: avgDailyRevenue * 7 * (1 + growthRate),
        confidence: "medium",
        reasoning: "Extrapolated from recent daily average",
      },
      next30Days: {
        prediction: avgDailyRevenue * 30 * (1 + growthRate),
        confidence: "low",
        reasoning: "Long-term prediction based on recent trends",
      },
      trends: growthRate > 0.05 ? ["Revenue is growing"] : growthRate < -0.05 ? ["Revenue is declining"] : ["Revenue is stable"],
      recommendations: ["Monitor daily performance", "Analyze customer behavior", "Optimize marketing campaigns"],
    }
  }
}
