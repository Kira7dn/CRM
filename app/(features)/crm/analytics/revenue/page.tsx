"use client";

/**
 * Revenue Analytics Page
 *
 * Main page for revenue analytics dashboard.
 * Uses client components to fetch and display revenue metrics.
 */

import { useState, useEffect } from "react";
import { subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  getRevenueMetrics,
  getRevenueTimeSeries,
  getTopProducts,
  getTopCustomers,
  getOrderStatusDistribution,
} from "./actions";
import { RevenueMetricsCards } from "./_components/RevenueMetricsCards";
import { RevenueTimeSeriesChart } from "./_components/RevenueTimeSeriesChart";
import { TopProductsTable } from "./_components/TopProductsTable";
import { TopCustomersTable } from "./_components/TopCustomersTable";
import { OrderStatusPieChart } from "./_components/OrderStatusPieChart";
import { DateRangePicker, type DateRange } from "./_components/DateRangePicker";
import { RevenueMetrics, RevenueTimeSeries, TopProduct, TopCustomer, OrderStatusDistribution, TimeGranularity } from "@/core/domain/analytics/revenue-metrics";
import { Button } from "@/@shared/ui/button";
import { BarChart, Loader2, RefreshCw } from "lucide-react";

export default function RevenueAnalyticsPage() {
  // State
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: subDays(new Date(), 29),
    endDate: new Date(),
  });

  const [granularity, setGranularity] = useState<TimeGranularity>("day");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [timeSeries, setTimeSeries] = useState<RevenueTimeSeries[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<OrderStatusDistribution[]>([]);

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
      // Calculate comparison period (same length as current period)
      const periodLength = dateRange.endDate.getTime() - dateRange.startDate.getTime();
      const comparisonEndDate = new Date(dateRange.startDate.getTime() - 1);
      const comparisonStartDate = new Date(comparisonEndDate.getTime() - periodLength);

      // Fetch all data in parallel
      const [metricsResult, timeSeriesResult, productsResult, customersResult, statusResult] =
        await Promise.all([
          getRevenueMetrics(dateRange.startDate, dateRange.endDate, comparisonStartDate, comparisonEndDate),
          getRevenueTimeSeries(dateRange.startDate, dateRange.endDate, granularity),
          getTopProducts(dateRange.startDate, dateRange.endDate, 10),
          getTopCustomers(dateRange.startDate, dateRange.endDate, 10),
          getOrderStatusDistribution(dateRange.startDate, dateRange.endDate),
        ]);

      // Handle results
      if (metricsResult.success && metricsResult.data) {
        setMetrics(metricsResult.data);
      } else {
        throw new Error(metricsResult.error || "Failed to fetch metrics");
      }

      if (timeSeriesResult.success && timeSeriesResult.data) {
        setTimeSeries(timeSeriesResult.data);
      }

      if (productsResult.success && productsResult.data) {
        setTopProducts(productsResult.data);
      }

      if (customersResult.success && customersResult.data) {
        setTopCustomers(customersResult.data);
      }

      if (statusResult.success && statusResult.data) {
        setStatusDistribution(statusResult.data);
      }
    } catch (err) {
      console.error("[RevenueAnalyticsPage] Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on mount and when date range or granularity changes
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, granularity]);

  // Handle refresh
  const handleRefresh = () => {
    fetchAnalytics(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BarChart className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-900 font-semibold mb-2">Failed to load analytics</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Revenue Analytics</h1>
            <p className="text-sm text-gray-600">Track revenue performance and business metrics</p>
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

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-3">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        {/* Metrics Cards */}
        {metrics && <RevenueMetricsCards metrics={metrics} />}

        {/* Granularity Selector for Chart */}
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Chart Granularity:</span>
            {(["day", "week", "month"] as TimeGranularity[]).map((g) => (
              <Button
                key={g}
                variant={granularity === g ? "default" : "outline"}
                size="sm"
                onClick={() => setGranularity(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Series Chart */}
        <RevenueTimeSeriesChart data={timeSeries} granularity={granularity} />

        {/* Two Columns: Top Products & Order Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopProductsTable products={topProducts} />
          <OrderStatusPieChart distribution={statusDistribution} />
        </div>

        {/* Top Customers Table */}
        <TopCustomersTable customers={topCustomers} />
      </div>
    </div>
  );
}
