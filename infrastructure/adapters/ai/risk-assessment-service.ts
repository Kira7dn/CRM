import { generateObject } from "ai"
import { z } from "zod"
import { aiConfig, isAIEnabled } from "./ai-config"
import { CacheFactory, generateCacheKey } from "@/infrastructure/adapters/cache"

/**
 * Risk assessment schema
 */
const RiskAssessmentSchema = z.object({
  overallRiskLevel: z.enum(["low", "medium", "high", "critical"]),
  riskScore: z.number().min(0).max(100).describe("Risk score from 0-100"),

  risks: z.array(z.object({
    category: z.enum(["revenue", "operations", "customer", "inventory", "financial"]),
    severity: z.enum(["low", "medium", "high", "critical"]),
    title: z.string(),
    description: z.string(),
    impact: z.string().describe("Potential business impact"),
    likelihood: z.enum(["low", "medium", "high"]),
    recommendations: z.array(z.string()),
  })).describe("Identified business risks"),

  opportunities: z.array(z.object({
    category: z.enum(["revenue", "operations", "customer", "inventory", "financial"]).optional().default("revenue"),
    title: z.string(),
    description: z.string(),
    potentialImpact: z.string(),
  })).describe("Business opportunities identified"),

  summary: z.string().describe("Executive summary of risk assessment"),
})

export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>

/**
 * Business metrics for risk assessment
 */
export interface BusinessMetrics {
  // Revenue metrics
  todayRevenue: number
  yesterdayRevenue: number
  last7DaysRevenue: number
  last30DaysRevenue: number
  revenueChangePercent: number

  // Order metrics
  totalOrders: number
  pendingOrders: number
  cancelledOrders: number
  completionRate: number
  errorRate: number
  avgProcessingTime?: number

  // Customer metrics
  totalCustomers: number
  newCustomersToday: number
  churnRiskCount: number
  churnRiskRate: number
  returningRate: number

  // Operational metrics
  lateOrders?: number
  inventoryIssues?: number
  staffUtilization?: number
}

/**
 * Risk Assessment Service using OpenAI
 */
export class RiskAssessmentService {
  /**
   * Generate comprehensive risk assessment
   */
  async assessRisks(metrics: BusinessMetrics): Promise<RiskAssessment> {
    if (!isAIEnabled()) {
      console.warn("AI features are disabled. Using rule-based risk assessment.")
      return this.generateRuleBasedAssessment(metrics)
    }

    // Check cache first
    const cacheKey = generateCacheKey("risk-assessment", metrics)
    const cache = await CacheFactory.getInstance({
      defaultTTL: 300, // 5 minutes default
      enableLogging: process.env.NODE_ENV === "development",
    })

    const cached = await cache.get<RiskAssessment>(cacheKey)
    if (cached) {
      console.log("[RiskAssessment] Cache hit for risk assessment")
      return cached
    }

    console.log("[RiskAssessment] Cache miss, generating new assessment")

    try {
      const prompt = `Bạn là chuyên gia phân tích rủi ro kinh doanh. Phân tích các chỉ số kinh doanh sau và cung cấp đánh giá rủi ro toàn diện.

Chỉ số kinh doanh:

Hiệu suất doanh thu:
- Doanh thu hôm nay: ${metrics.todayRevenue.toFixed(0)} VND
- Doanh thu hôm qua: ${metrics.yesterdayRevenue.toFixed(0)} VND
- Thay đổi doanh thu: ${metrics.revenueChangePercent.toFixed(1)}%
- 7 ngày gần nhất: ${metrics.last7DaysRevenue.toFixed(0)} VND
- 30 ngày gần nhất: ${metrics.last30DaysRevenue.toFixed(0)} VND

Vận hành đơn hàng:
- Tổng đơn hàng: ${metrics.totalOrders}
- Đơn chờ xử lý: ${metrics.pendingOrders}
- Đơn bị hủy: ${metrics.cancelledOrders}
- Tỷ lệ hoàn thành: ${metrics.completionRate.toFixed(1)}%
- Tỷ lệ lỗi: ${metrics.errorRate.toFixed(1)}%
${metrics.avgProcessingTime ? `- Thời gian xử lý TB: ${metrics.avgProcessingTime.toFixed(1)} giờ` : ""}
${metrics.lateOrders ? `- Đơn trễ hạn: ${metrics.lateOrders}` : ""}

Sức khỏe khách hàng:
- Tổng khách hàng: ${metrics.totalCustomers}
- Khách hàng mới hôm nay: ${metrics.newCustomersToday}
- Nguy cơ rời bỏ: ${metrics.churnRiskCount} khách hàng (${metrics.churnRiskRate.toFixed(1)}%)
- Tỷ lệ quay lại: ${metrics.returningRate.toFixed(1)}%

Phân tích các chỉ số này và xác định:
1. Rủi ro nghiêm trọng cần xử lý ngay
2. Rủi ro trung hạn cần theo dõi
3. Điểm kém hiệu quả trong vận hành
4. Cơ hội kinh doanh
5. Khuyến nghị có thể hành động

Tập trung vào:
- Xu hướng sụt giảm doanh thu
- Tỷ lệ lỗi/hủy đơn cao
- Vấn đề giữ chân khách hàng
- Tắc nghẽn vận hành
- Cơ hội tăng trưởng

Bạn PHẢI trả về DUY NHẤT một JSON đúng chính xác schema sau (không giải thích thêm, không trả markdown, không thêm text ngoài JSON):

{
  "overallRiskLevel": "low | medium | high | critical",
  "riskScore": number (0-100),
  "risks": [
    {
      "category": "revenue | operations | customer | inventory | financial",
      "severity": "low | medium | high | critical",
      "title": string,
      "description": string,
      "impact": string,
      "likelihood": "low | medium | high",
      "recommendations": string[]
    }
  ],
  "opportunities": [
    {
      "category": "revenue | operations | customer | inventory | financial",
      "title": string,
      "description": string,
      "potentialImpact": string
    }
  ],
  "summary": string
}

Đảm bảo mỗi phần tử trong mảng opportunities luôn có trường category với một trong các giá trị trên.`

      const result = await generateObject({
        model: aiConfig.model,
        schema: RiskAssessmentSchema,
        prompt,
        temperature: aiConfig.temperature,
      })

      // Cache the result with 5 minutes TTL
      await cache.set(cacheKey, result.object, 300)
      console.log("[RiskAssessment] Cached new assessment for 5 minutes")

      return result.object
    } catch (error) {
      console.error("Failed to generate risk assessment, falling back to rule-based:", error)
      return this.generateRuleBasedAssessment(metrics)
    }
  }

  /**
   * Generate rule-based risk assessment as fallback
   */
  generateRuleBasedAssessment(metrics: BusinessMetrics): RiskAssessment {
    const risks: RiskAssessment["risks"] = []
    let riskScore = 0

    // Revenue risks
    if (metrics.revenueChangePercent < -30) {
      risks.push({
        category: "revenue",
        severity: "critical",
        title: "Severe Revenue Decline",
        description: `Revenue dropped by ${Math.abs(metrics.revenueChangePercent).toFixed(1)}%`,
        impact: "Significant loss in business income",
        likelihood: "high",
        recommendations: [
          "Review marketing campaigns immediately",
          "Analyze customer feedback",
          "Check for external factors (seasonality, competition)",
        ],
      })
      riskScore += 30
    } else if (metrics.revenueChangePercent < -15) {
      risks.push({
        category: "revenue",
        severity: "high",
        title: "Revenue Decline",
        description: `Revenue dropped by ${Math.abs(metrics.revenueChangePercent).toFixed(1)}%`,
        impact: "Reduced business income",
        likelihood: "medium",
        recommendations: [
          "Increase marketing efforts",
          "Launch promotional campaigns",
        ],
      })
      riskScore += 20
    }

    // Operational risks
    if (metrics.errorRate > 15) {
      risks.push({
        category: "operations",
        severity: "high",
        title: "High Order Error Rate",
        description: `${metrics.errorRate.toFixed(1)}% of orders are cancelled or failed`,
        impact: "Customer dissatisfaction and revenue loss",
        likelihood: "high",
        recommendations: [
          "Review order processing workflow",
          "Improve product descriptions and pricing",
          "Enhance customer communication",
        ],
      })
      riskScore += 20
    }

    // Customer risks
    if (metrics.churnRiskRate > 30) {
      risks.push({
        category: "customer",
        severity: "high",
        title: "High Customer Churn Risk",
        description: `${metrics.churnRiskRate.toFixed(1)}% of customers haven't ordered in 30+ days`,
        impact: "Loss of customer lifetime value",
        likelihood: "high",
        recommendations: [
          "Launch re-engagement campaign",
          "Offer loyalty discounts",
          "Survey inactive customers",
        ],
      })
      riskScore += 15
    }

    // Determine overall risk level
    let overallRiskLevel: RiskAssessment["overallRiskLevel"] = "low"
    if (riskScore >= 50) overallRiskLevel = "critical"
    else if (riskScore >= 30) overallRiskLevel = "high"
    else if (riskScore >= 15) overallRiskLevel = "medium"

    // Identify opportunities
    const opportunities: RiskAssessment["opportunities"] = []
    if (metrics.returningRate > 60) {
      opportunities.push({
        category: "customer",
        title: "Strong Customer Loyalty",
        description: "High returning customer rate indicates good product-market fit",
        potentialImpact: "Leverage loyalty for referral programs and upselling",
      })
    }

    return {
      overallRiskLevel,
      riskScore,
      risks,
      opportunities,
      summary: risks.length === 0
        ? "Business metrics are within normal ranges. Continue monitoring performance."
        : `${risks.length} risk(s) identified. Priority: ${risks.filter(r => r.severity === "critical" || r.severity === "high").length} high-priority issues.`,
    }
  }
}
