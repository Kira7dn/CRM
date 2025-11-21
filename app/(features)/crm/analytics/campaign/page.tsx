"use client";

/**
 * Campaign Performance Analytics Page
 *
 * Main page for campaign analytics and ROI tracking.
 */

import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import { compareCampaigns } from "./actions";
import { CampaignComparisonTable } from "./_components/CampaignComparisonTable";
import { ROICalculator } from "./_components/ROICalculator";
import { PlatformPerformanceChart } from "./_components/PlatformPerformanceChart";
import { CampaignSelector } from "./_components/CampaignSelector";
import { DateRangePicker, type DateRange } from "../revenue/_components/DateRangePicker";
import type { CampaignComparison, CampaignAnalytics } from "@/core/domain/analytics/campaign-performance";
import { Button } from "@/@shared/ui/button";
import { TrendingUp, Loader2, RefreshCw, AlertCircle, BarChart3 } from "lucide-react";

// Mock campaigns for selection (in real app, fetch from API)
const mockCampaigns = [
  { _id: 1, name: "Summer Sale 2025", status: "active" },
  { _id: 2, name: "New Year Promotion", status: "completed" },
  { _id: 3, name: "Facebook Ads Campaign", status: "active" },
  { _id: 4, name: "TikTok Influencer Collab", status: "active" },
  { _id: 5, name: "Zalo OA Promotion", status: "paused" },
];

export default function CampaignAnalyticsPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  });

  const [selectedCampaignIds, setSelectedCampaignIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [comparison, setComparison] = useState<CampaignComparison | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignAnalytics | null>(null);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (showLoader = true) => {
    if (selectedCampaignIds.length === 0) {
      setComparison(null);
      return;
    }

    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const result = await compareCampaigns(
        selectedCampaignIds,
        dateRange.startDate,
        dateRange.endDate
      );

      if (result.success && result.data) {
        setComparison(result.data);
        // Set first campaign as selected for detail view
        if (result.data.campaigns.length > 0) {
          setSelectedCampaign(result.data.campaigns[0]);
        }
      } else {
        throw new Error(result.error || "Failed to fetch campaign analytics");
      }
    } catch (err) {
      console.error("[CampaignAnalyticsPage] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data when campaigns or date range changes
  useEffect(() => {
    fetchAnalytics();
  }, [selectedCampaignIds, dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(false);
  };

  // Handle campaign selection for detail view
  const handleCampaignClick = (campaign: CampaignAnalytics) => {
    setSelectedCampaign(campaign);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Performance Analytics</h1>
            <p className="text-sm text-gray-600">Track ROI, compare campaigns, and optimize spend</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing || selectedCampaignIds.length === 0}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* UTM Parameters Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-900">UTM Parameters Required</p>
            <p className="text-xs text-blue-700 mt-0.5">
              For accurate campaign tracking, ensure orders have UTM parameters (utmSource, utmMedium, utmCampaign).
            </p>
          </div>
        </div>

        {/* Campaign Selection */}
        <CampaignSelector
          selectedCampaignIds={selectedCampaignIds}
          onSelectionChange={setSelectedCampaignIds}
          campaigns={mockCampaigns}
        />

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading campaign analytics...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <TrendingUp className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-900 font-semibold mb-2">Failed to load campaign analytics</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => fetchAnalytics()}>Try Again</Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && selectedCampaignIds.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-900 font-semibold mb-2">No campaigns selected</p>
              <p className="text-gray-600 mb-4">Select campaigns above to view analytics and compare performance</p>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && comparison && selectedCampaign && (
          <>
            {/* Campaign Comparison Table */}
            <div onClick={() => { }}>
              <CampaignComparisonTable campaigns={comparison.campaigns} />
            </div>

            {/* Selected Campaign Details */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCampaign.campaignName} - Details
                </h2>
                <div className="flex gap-2">
                  {comparison.campaigns.map((campaign) => (
                    <button
                      key={campaign.campaignId}
                      onClick={() => handleCampaignClick(campaign)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${selectedCampaign.campaignId === campaign.campaignId
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {campaign.campaignName}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROI Calculator */}
              <ROICalculator analytics={selectedCampaign} />

              {/* Platform Performance */}
              <PlatformPerformanceChart platformBreakdown={selectedCampaign.platformBreakdown} />
            </div>

            {/* Summary Stats */}
            {comparison.campaigns.length > 1 && (
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Across All Campaigns</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(comparison.summary.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Spend</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(comparison.summary.totalSpend)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {comparison.summary.totalOrders.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average ROI</p>
                    <p className={`text-2xl font-bold ${comparison.summary.avgRoi >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {comparison.summary.avgRoi >= 0 ? "+" : ""}{comparison.summary.avgRoi.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
