/**
 * Campaign Analytics Repository
 *
 * MongoDB implementation for campaign analytics data access.
 */

import clientPromise from "@/infrastructure/db/mongo";
import type {
  CampaignAnalytics,
  CampaignComparison,
  PlatformPerformance,
  Platform,
  PlatformBreakdown,
} from "@/core/domain/analytics/campaign-performance";
import {
  calculateROI,
  calculateCTR,
  calculateConversionRate,
  calculateCostPerAcquisition,
  calculateNetProfit,
} from "@/core/domain/analytics/campaign-performance";
import type {
  CampaignAnalyticsService,
  CampaignAnalyticsQuery,
  CampaignComparisonQuery,
  PlatformPerformanceQuery,
} from "@/core/application/interfaces/analytics/campaign-analytics-service";

export class CampaignAnalyticsRepository implements CampaignAnalyticsService {
  /**
   * Get analytics for a single campaign
   */
  async getCampaignAnalytics(query: CampaignAnalyticsQuery): Promise<CampaignAnalytics> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const campaignsCollection = db.collection<any>("campaigns");
    const ordersCollection = db.collection("orders");

    // Get campaign details
    const campaign = await campaignsCollection.findOne({ _id: query.campaignId });
    if (!campaign) {
      throw new Error(`Campaign with ID ${query.campaignId} not found`);
    }

    // Determine date range
    const startDate = query.startDate || campaign.startDate || new Date(0);
    const endDate = query.endDate || campaign.endDate || new Date();

    // NOTE: This implementation assumes orders have UTM parameters
    // For full functionality, the Order entity should include:
    // - utmSource, utmMedium, utmCampaign, utmContent fields

    // Aggregate orders related to this campaign
    const ordersPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          $or: [
            { "utmParams.utmCampaign": campaign.name },
            { "utmParams.utmCampaign": campaign._id.toString() },
            { campaignId: query.campaignId }, // Fallback if directly linked
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "completed"] },
                "$totalAmount",
                0,
              ],
            },
          },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ];

    const [ordersResult] = await ordersCollection.aggregate<any>(ordersPipeline).toArray();

    const totalRevenue = ordersResult?.totalRevenue || 0;
    const totalOrders = ordersResult?.totalOrders || 0;
    const completedOrders = ordersResult?.completedOrders || 0;

    // Get platform breakdown
    const platformPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          $or: [
            { "utmParams.utmCampaign": campaign.name },
            { "utmParams.utmCampaign": campaign._id.toString() },
            { campaignId: query.campaignId },
          ],
        },
      },
      {
        $group: {
          _id: "$utmParams.utmSource",
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
            },
          },
          orders: { $sum: 1 },
          clicks: { $sum: { $ifNull: ["$clicks", 0] } },
          impressions: { $sum: { $ifNull: ["$impressions", 0] } },
        },
      },
    ];

    const platformData = await ordersCollection.aggregate<any>(platformPipeline).toArray();

    const platformBreakdown: PlatformBreakdown[] = platformData.map((p: any) => {
      const platform = (p._id || "other") as Platform;
      const clicks = p.clicks || 0;
      const impressions = p.impressions || 0;
      const orders = p.orders || 0;

      return {
        platform,
        revenue: p.revenue || 0,
        orders,
        clicks,
        impressions,
        ctr: calculateCTR(clicks, impressions),
        conversionRate: calculateConversionRate(orders, clicks),
      };
    });

    // Calculate metrics
    const totalSpend = campaign.budget || campaign.totalSpend || 0;
    const roi = calculateROI(totalRevenue, totalSpend);
    const netProfit = calculateNetProfit(totalRevenue, totalSpend);

    // Get aggregated metrics
    const totalClicks = platformBreakdown.reduce((sum, p) => sum + p.clicks, 0);
    const totalImpressions = platformBreakdown.reduce((sum, p) => sum + p.impressions, 0);

    const analytics: CampaignAnalytics = {
      campaignId: query.campaignId,
      campaignName: campaign.name || "Unnamed Campaign",
      period: { startDate, endDate },
      totalSpend,
      totalRevenue,
      totalOrders,
      roi,
      roiPercent: roi,
      netProfit,
      metrics: {
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: calculateCTR(totalClicks, totalImpressions),
        conversionRate: calculateConversionRate(completedOrders, totalClicks),
        costPerAcquisition: totalOrders > 0 ? calculateCostPerAcquisition(totalSpend, totalOrders) : undefined,
      },
      platformBreakdown,
      status: campaign.status || "active",
      startDate: campaign.startDate || startDate,
      endDate: campaign.endDate || endDate,
    };

    return analytics;
  }

  /**
   * Compare multiple campaigns
   */
  async compareCampaigns(query: CampaignComparisonQuery): Promise<CampaignComparison> {
    // Fetch analytics for each campaign
    const campaignsAnalytics = await Promise.all(
      query.campaignIds.map((campaignId) =>
        this.getCampaignAnalytics({
          campaignId,
          startDate: query.startDate,
          endDate: query.endDate,
        })
      )
    );

    // Calculate summary
    const totalRevenue = campaignsAnalytics.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalSpend = campaignsAnalytics.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
    const totalOrders = campaignsAnalytics.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgRoi = campaignsAnalytics.length > 0
      ? campaignsAnalytics.reduce((sum, c) => sum + c.roi, 0) / campaignsAnalytics.length
      : 0;

    // Find top performer
    let topPerformer = {
      campaignId: campaignsAnalytics[0]?.campaignId || 0,
      campaignName: campaignsAnalytics[0]?.campaignName || "",
      metric: "revenue" as const,
      value: campaignsAnalytics[0]?.totalRevenue || 0,
    };

    // Determine top performer by revenue
    for (const campaign of campaignsAnalytics) {
      if (campaign.totalRevenue > topPerformer.value) {
        topPerformer = {
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
          metric: "revenue",
          value: campaign.totalRevenue,
        };
      }
    }

    const comparison: CampaignComparison = {
      campaigns: campaignsAnalytics,
      period: { startDate: query.startDate, endDate: query.endDate },
      topPerformer,
      summary: {
        totalRevenue,
        totalSpend,
        totalOrders,
        avgRoi,
      },
    };

    return comparison;
  }

  /**
   * Get platform-specific performance
   */
  async getPlatformPerformance(query: PlatformPerformanceQuery): Promise<PlatformPerformance> {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const ordersCollection = db.collection("orders");

    // Aggregate orders for this platform
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: query.startDate, $lte: query.endDate },
          "utmParams.utmSource": query.platform,
        },
      },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalRevenue: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "completed"] }, "$totalAmount", 0],
                  },
                },
                totalOrders: { $sum: 1 },
                totalClicks: { $sum: { $ifNull: ["$clicks", 0] } },
                totalImpressions: { $sum: { $ifNull: ["$impressions", 0] } },
              },
            },
          ],
          byCampaign: [
            {
              $match: { status: "completed" },
            },
            {
              $group: {
                _id: "$utmParams.utmCampaign",
                campaignId: { $first: "$campaignId" },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: query.limit || 10 },
          ],
        },
      },
    ];

    const [result] = await ordersCollection.aggregate<any>(pipeline).toArray();

    const totals = result?.totals[0] || {};
    const totalRevenue = totals.totalRevenue || 0;
    const totalOrders = totals.totalOrders || 0;
    const totalClicks = totals.totalClicks || 0;
    const totalImpressions = totals.totalImpressions || 0;

    const avgCtr = calculateCTR(totalClicks, totalImpressions);
    const avgConversionRate = calculateConversionRate(totalOrders, totalClicks);

    const topCampaigns = (result?.byCampaign || []).map((c: any) => ({
      campaignId: c.campaignId || 0,
      campaignName: c._id || "Unknown Campaign",
      revenue: c.revenue || 0,
      orders: c.orders || 0,
    }));

    const performance: PlatformPerformance = {
      platform: query.platform,
      period: { startDate: query.startDate, endDate: query.endDate },
      totalRevenue,
      totalOrders,
      totalClicks,
      totalImpressions,
      avgCtr,
      avgConversionRate,
      topCampaigns,
    };

    return performance;
  }
}
