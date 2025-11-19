/**
 * Staff Analytics Repository
 *
 * Implements staff performance analytics queries using MongoDB aggregation pipelines.
 *
 * NOTE: This implementation assumes orders have an optional `assignedTo` field.
 * For full functionality, add `assignedTo?: string` to the Order entity.
 *
 * Current implementation: Uses `createdBy` or falls back to all staff analysis.
 */

import { BaseRepository } from "@/infrastructure/db/base-repository";
import { ObjectId } from "mongodb";
import {
  StaffPerformance,
  TeamPerformance,
  StaffRanking,
  StaffActivity,
  StaffPerformanceTrend,
  calculateCompletionRate,
  getPerformanceTier,
} from "@/core/domain/analytics/staff-performance";
import {
  StaffAnalyticsService,
  StaffPerformanceQuery,
  TeamPerformanceQuery,
  StaffRankingQuery,
  StaffActivityQuery,
  StaffPerformanceTrendQuery,
} from "@/core/application/interfaces/analytics/staff-analytics-service";
import { format } from "date-fns";

/**
 * Dummy entity for BaseRepository
 */
interface AnalyticsEntity {
  id: string;
}

export class StaffAnalyticsRepository
  extends BaseRepository<AnalyticsEntity, string>
  implements StaffAnalyticsService
{
  protected collectionName = "admin_users";

  /**
   * Get performance metrics for a specific staff member
   */
  async getStaffPerformance(query: StaffPerformanceQuery): Promise<StaffPerformance> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");
    const usersCollection = client.db(process.env.MONGODB_DB).collection("admin_users");

    // Get staff info
    const staff = await usersCollection.findOne({ _id: new ObjectId(query.staffId) });
    if (!staff) {
      throw new Error(`Staff member with ID ${query.staffId} not found`);
    }

    // Aggregate orders assigned to this staff member
    // NOTE: Using assignedTo field if available, otherwise no orders will match
    const pipeline = [
      {
        $match: {
          assignedTo: query.staffId,
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
        },
      },
      {
        $facet: {
          completed: [
            {
              $match: {
                status: "completed",
                paymentStatus: "success",
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ],
          all: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await ordersCollection.aggregate(pipeline).toArray();

    const completedData = result.completed[0] || { totalRevenue: 0, count: 0 };
    const allData = result.all[0] || { count: 0 };

    const totalRevenue = completedData.totalRevenue || 0;
    const totalOrders = allData.count || 0;
    const completedOrders = completedData.count || 0;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const completionRate = calculateCompletionRate(completedOrders, totalOrders);

    // Get ranking among all staff
    const rankings = await this.getStaffRanking({
      startDate: query.startDate,
      endDate: query.endDate,
    });
    const ranking = rankings.findIndex((r) => r.staffId === query.staffId) + 1;

    return {
      staffId: query.staffId,
      staffName: staff.name,
      role: staff.role,
      period: { startDate: query.startDate, endDate: query.endDate },
      metrics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        conversionRate: 0, // Placeholder - requires customer care integration
        completionRate,
      },
      ranking: ranking || 0,
    };
  }

  /**
   * Get team-level performance aggregates
   */
  async getTeamPerformance(query: TeamPerformanceQuery): Promise<TeamPerformance> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");
    const usersCollection = client.db(process.env.MONGODB_DB).collection("admin_users");

    // Count active staff members (sales and admin roles)
    const staffCount = await usersCollection.countDocuments({
      role: { $in: ["admin", "sale"] },
      status: "active",
    });

    // Aggregate all orders in period with assignedTo field
    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $facet: {
          completed: [
            {
              $match: {
                status: "completed",
                paymentStatus: "success",
              },
            },
            {
              $group: {
                _id: null,
                totalRevenue: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ],
          all: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await ordersCollection.aggregate(pipeline).toArray();

    const completedData = result.completed[0] || { totalRevenue: 0, count: 0 };
    const allData = result.all[0] || { count: 0 };

    const totalRevenue = completedData.totalRevenue || 0;
    const totalOrders = allData.count || 0;
    const completedOrders = completedData.count || 0;
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const completionRate = calculateCompletionRate(completedOrders, totalOrders);

    // Get top performers
    const topPerformersLimit = query.topPerformersLimit || 10;
    const rankings = await this.getStaffRanking({
      startDate: query.startDate,
      endDate: query.endDate,
      limit: topPerformersLimit,
    });

    // Convert rankings to staff performance objects
    const topPerformers: StaffPerformance[] = await Promise.all(
      rankings.slice(0, topPerformersLimit).map(async (ranking, index) => {
        const staff = await usersCollection.findOne({ _id: new ObjectId(ranking.staffId) });

        return {
          staffId: ranking.staffId,
          staffName: ranking.staffName,
          role: ranking.role,
          period: { startDate: query.startDate, endDate: query.endDate },
          metrics: {
            totalRevenue: ranking.totalRevenue,
            totalOrders: ranking.totalOrders,
            averageOrderValue: ranking.averageOrderValue,
            conversionRate: 0,
            completionRate: ranking.completionRate,
          },
          ranking: index + 1,
        };
      })
    );

    return {
      period: { startDate: query.startDate, endDate: query.endDate },
      totalRevenue,
      totalOrders,
      topPerformers,
      averageMetrics: {
        ordersPerStaff: staffCount > 0 ? totalOrders / staffCount : 0,
        revenuePerStaff: staffCount > 0 ? totalRevenue / staffCount : 0,
        averageOrderValue,
        completionRate,
      },
      staffCount,
    };
  }

  /**
   * Get staff ranking leaderboard
   */
  async getStaffRanking(query: StaffRankingQuery): Promise<StaffRanking[]> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");
    const usersCollection = client.db(process.env.MONGODB_DB).collection("admin_users");

    const pipeline: any[] = [
      {
        $match: {
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
          assignedTo: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$assignedTo",
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                "$total",
                0,
              ],
            },
          },
          totalOrders: { $sum: 1 },
          completedOrders: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          staffId: "$_id",
          totalRevenue: 1,
          totalOrders: 1,
          completedOrders: 1,
          averageOrderValue: {
            $cond: [
              { $eq: ["$completedOrders", 0] },
              0,
              { $divide: ["$totalRevenue", "$completedOrders"] },
            ],
          },
          completionRate: {
            $cond: [
              { $eq: ["$totalOrders", 0] },
              0,
              { $multiply: [{ $divide: ["$completedOrders", "$totalOrders"] }, 100] },
            ],
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ];

    if (query.limit) {
      pipeline.push({ $limit: query.limit });
    }

    const results = await ordersCollection.aggregate(pipeline).toArray();

    // Enrich with staff data
    const rankings: StaffRanking[] = [];
    for (let i = 0; i < results.length; i++) {
      const doc = results[i];
      const staff = await usersCollection.findOne({ _id: new ObjectId(doc.staffId) });

      if (staff) {
        rankings.push({
          rank: i + 1,
          staffId: doc.staffId,
          staffName: staff.name,
          role: staff.role,
          totalRevenue: doc.totalRevenue,
          totalOrders: doc.totalOrders,
          averageOrderValue: doc.averageOrderValue,
          completionRate: doc.completionRate,
          avatar: staff.avatar,
        });
      }
    }

    return rankings;
  }

  /**
   * Get staff activity logs
   */
  async getStaffActivity(query: StaffActivityQuery): Promise<StaffActivity[]> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");
    const usersCollection = client.db(process.env.MONGODB_DB).collection("admin_users");

    const matchStage: any = {
      createdAt: {
        $gte: query.startDate,
        $lte: query.endDate,
      },
      assignedTo: { $exists: true, $ne: null },
    };

    if (query.staffId) {
      matchStage.assignedTo = query.staffId;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $project: {
          assignedTo: 1,
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          status: 1,
          paymentStatus: 1,
          total: 1,
        },
      },
      {
        $group: {
          _id: {
            staffId: "$assignedTo",
            date: "$date",
          },
          ordersProcessed: { $sum: 1 },
          ordersCompleted: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                1,
                0,
              ],
            },
          },
          ordersCancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
          totalRevenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                "$total",
                0,
              ],
            },
          },
        },
      },
      { $sort: { "_id.date": -1, "_id.staffId": 1 } },
    ];

    const results = await ordersCollection.aggregate(pipeline).toArray();

    // Enrich with staff names
    const activities: StaffActivity[] = [];
    for (const doc of results) {
      const staff = await usersCollection.findOne({ _id: doc._id.staffId });

      if (staff) {
        activities.push({
          staffId: doc._id.staffId,
          staffName: staff.name,
          date: new Date(doc._id.date),
          ordersProcessed: doc.ordersProcessed,
          ordersCompleted: doc.ordersCompleted,
          ordersCancelled: doc.ordersCancelled,
          totalRevenue: doc.totalRevenue,
        });
      }
    }

    return activities;
  }

  /**
   * Get staff performance trend over time
   */
  async getStaffPerformanceTrend(query: StaffPerformanceTrendQuery): Promise<StaffPerformanceTrend[]> {
    const client = await this.getClient();
    const ordersCollection = client.db(process.env.MONGODB_DB).collection("orders");

    // Build date grouping based on granularity
    let dateGroup: any;
    switch (query.granularity) {
      case "day":
        dateGroup = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
        break;
      case "week":
        dateGroup = { $dateToString: { format: "%Y-W%V", date: "$createdAt" } };
        break;
      case "month":
        dateGroup = { $dateToString: { format: "%Y-%m", date: "$createdAt" } };
        break;
      default:
        dateGroup = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const pipeline = [
      {
        $match: {
          assignedTo: query.staffId,
          createdAt: {
            $gte: query.startDate,
            $lte: query.endDate,
          },
        },
      },
      {
        $group: {
          _id: dateGroup,
          revenue: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                "$total",
                0,
              ],
            },
          },
          orderCount: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$status", "completed"] }, { $eq: ["$paymentStatus", "success"] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          revenue: 1,
          orderCount: 1,
          completionRate: {
            $cond: [
              { $eq: ["$orderCount", 0] },
              0,
              { $multiply: [{ $divide: ["$completedCount", "$orderCount"] }, 100] },
            ],
          },
        },
      },
      { $sort: { date: 1 } },
    ];

    const results = await ordersCollection.aggregate(pipeline).toArray();

    return results.map((doc) => ({
      date: new Date(doc.date),
      revenue: doc.revenue,
      orderCount: doc.orderCount,
      completionRate: doc.completionRate,
    }));
  }
}
