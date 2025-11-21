"use client";

/**
 * Staff Performance Analytics Page
 *
 * Main page for staff performance tracking and leaderboard.
 * Admin-only access.
 */

import { useState, useEffect } from "react";
import { subDays } from "date-fns";
import {
  getTeamPerformance,
  getStaffRanking,
  getStaffActivity,
} from "./actions";
import { TeamPerformanceCards } from "./_components/TeamPerformanceCards";
import { StaffLeaderboard } from "./_components/StaffLeaderboard";
import { StaffActivityTable } from "./_components/StaffActivityTable";
import { DateRangePicker, type DateRange } from "../revenue/_components/DateRangePicker";
import {
  TeamPerformance,
  StaffRanking,
  StaffActivity,
} from "@/core/domain/analytics/staff-performance";
import { Button } from "@/@shared/ui/button";
import { Trophy, Loader2, RefreshCw, AlertCircle } from "lucide-react";

export default function StaffAnalyticsPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [team, setTeam] = useState<TeamPerformance | null>(null);
  const [rankings, setRankings] = useState<StaffRanking[]>([]);
  const [activities, setActivities] = useState<StaffActivity[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch all analytics data
  const fetchAnalytics = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      // Fetch all data in parallel
      const [teamResult, rankingsResult, activitiesResult] = await Promise.all([
        getTeamPerformance(dateRange.startDate, dateRange.endDate, 10),
        getStaffRanking(dateRange.startDate, dateRange.endDate, 20),
        getStaffActivity(dateRange.startDate, dateRange.endDate),
      ]);

      // Handle results
      if (teamResult.success && teamResult.data) {
        setTeam(teamResult.data);
      } else {
        throw new Error(teamResult.error || "Failed to fetch team performance");
      }

      if (rankingsResult.success && rankingsResult.data) {
        setRankings(rankingsResult.data);
      }

      if (activitiesResult.success && activitiesResult.data) {
        setActivities(activitiesResult.data);
      }
    } catch (err) {
      console.error("[StaffAnalyticsPage] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on mount and when date range changes
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading staff analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Trophy className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">Failed to load staff analytics</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchAnalytics()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Staff Performance Analytics</h1>
            <p className="text-sm text-gray-600">Track team performance and leaderboard</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Schema Enhancement Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-blue-900">Schema Enhancement Required</p>
            <p className="text-xs text-blue-700 mt-0.5">
              For full functionality, add <code className="bg-blue-100 px-1 rounded">assignedTo: string</code> field to the Order entity.
            </p>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Team Performance Cards */}
        {team && <TeamPerformanceCards team={team} />}

        {/* Staff Leaderboard */}
        <StaffLeaderboard rankings={rankings} />

        {/* Staff Activity Table */}
        <StaffActivityTable activities={activities} />
      </div>
    </div>
  );
}
