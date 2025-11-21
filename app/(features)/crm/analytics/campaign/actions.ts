"use server";

/**
 * Campaign Analytics Server Actions
 *
 * Server-side data fetching for campaign analytics.
 */

import {
  createGetCampaignAnalyticsUseCase,
  createCompareCampaignsUseCase,
  createGetPlatformPerformanceUseCase,
} from "@/app/api/analytics/campaign/depends";
import type { Platform } from "@/core/domain/analytics/campaign-performance";

export async function getCampaignAnalytics(
  campaignId: number,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const useCase = await createGetCampaignAnalyticsUseCase();
    const { analytics } = await useCase.execute({
      campaignId,
      startDate,
      endDate,
    });
    return { success: true, data: analytics };
  } catch (error) {
    console.error("[getCampaignAnalytics] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch campaign analytics",
    };
  }
}

export async function compareCampaigns(
  campaignIds: number[],
  startDate: Date,
  endDate: Date
) {
  try {
    const useCase = await createCompareCampaignsUseCase();
    const { comparison } = await useCase.execute({
      campaignIds,
      startDate,
      endDate,
    });
    return { success: true, data: comparison };
  } catch (error) {
    console.error("[compareCampaigns] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to compare campaigns",
    };
  }
}

export async function getPlatformPerformance(
  platform: Platform,
  startDate: Date,
  endDate: Date,
  limit?: number
) {
  try {
    const useCase = await createGetPlatformPerformanceUseCase();
    const { performance } = await useCase.execute({
      platform,
      startDate,
      endDate,
      limit,
    });
    return { success: true, data: performance };
  } catch (error) {
    console.error("[getPlatformPerformance] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch platform performance",
    };
  }
}
