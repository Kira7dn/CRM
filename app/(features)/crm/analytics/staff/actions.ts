"use server";

/**
 * Server Actions for Staff Analytics
 *
 * These actions are called from client components to fetch staff analytics data.
 */

import {
  createGetStaffPerformanceUseCase,
  createGetTeamPerformanceUseCase,
  createGetStaffRankingUseCase,
  createGetStaffActivityUseCase,
  createGetStaffPerformanceTrendUseCase,
} from "@/app/api/analytics/staff/depends";

/**
 * Get staff performance metrics
 */
export async function getStaffPerformance(
  staffId: string,
  startDate: Date,
  endDate: Date
) {
  try {
    const useCase = await createGetStaffPerformanceUseCase();
    const result = await useCase.execute({ staffId, startDate, endDate });
    return { success: true, data: result.performance };
  } catch (error) {
    console.error("[getStaffPerformance] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch staff performance",
    };
  }
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformance(
  startDate: Date,
  endDate: Date,
  topPerformersLimit: number = 10
) {
  try {
    const useCase = await createGetTeamPerformanceUseCase();
    const result = await useCase.execute({ startDate, endDate, topPerformersLimit });
    return { success: true, data: result.team };
  } catch (error) {
    console.error("[getTeamPerformance] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch team performance",
    };
  }
}

/**
 * Get staff ranking leaderboard
 */
export async function getStaffRanking(
  startDate: Date,
  endDate: Date,
  limit: number = 20
) {
  try {
    const useCase = await createGetStaffRankingUseCase();
    const result = await useCase.execute({ startDate, endDate, limit });
    return { success: true, data: result.rankings };
  } catch (error) {
    console.error("[getStaffRanking] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch staff ranking",
    };
  }
}

/**
 * Get staff activity logs
 */
export async function getStaffActivity(
  startDate: Date,
  endDate: Date,
  staffId?: string
) {
  try {
    const useCase = await createGetStaffActivityUseCase();
    const result = await useCase.execute({ startDate, endDate, staffId });
    return { success: true, data: result.activities };
  } catch (error) {
    console.error("[getStaffActivity] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch staff activity",
    };
  }
}

/**
 * Get staff performance trend
 */
export async function getStaffPerformanceTrend(
  staffId: string,
  startDate: Date,
  endDate: Date,
  granularity: "day" | "week" | "month" = "day"
) {
  try {
    const useCase = await createGetStaffPerformanceTrendUseCase();
    const result = await useCase.execute({ staffId, startDate, endDate, granularity });
    return { success: true, data: result.trend };
  } catch (error) {
    console.error("[getStaffPerformanceTrend] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch staff performance trend",
    };
  }
}
