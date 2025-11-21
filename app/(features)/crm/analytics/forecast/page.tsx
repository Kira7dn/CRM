"use client";

/**
 * AI-Powered Forecast Analytics Page
 * Sprint 6 - Module 1.5
 *
 * Main page for forecasting dashboard with revenue predictions,
 * inventory forecasts, and churn predictions.
 */

import { useState, useEffect } from "react";
import {
  getRevenueForecast,
  getInventoryForecast,
  predictCustomerChurn,
  getTrendAnalysis,
} from "./actions";
import { RevenueForecastChart } from "./_components/RevenueForecastChart";
import { InventoryAlerts } from "./_components/InventoryAlerts";
import { ChurnRiskList } from "./_components/ChurnRiskList";
import { TrendInsights } from "./_components/TrendInsights";
import {
  RevenueForecast,
  InventoryForecast,
  ChurnPrediction,
  TrendAnalysis,
} from "@/core/domain/analytics/forecast";
import { Button } from "@/@shared/ui/button";
import { Loader2, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/@shared/ui/card";

export default function ForecastAnalyticsPage() {
  // State
  const [forecastDays, setForecastDays] = useState(30);
  const [inventoryDays, setInventoryDays] = useState(7);
  const [churnRiskFilter, setChurnRiskFilter] = useState<
    "low" | "medium" | "high" | undefined
  >("high");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data state
  const [revenueForecasts, setRevenueForecasts] = useState<RevenueForecast[]>(
    []
  );
  const [inventoryForecasts, setInventoryForecasts] = useState<
    InventoryForecast[]
  >([]);
  const [churnPredictions, setChurnPredictions] = useState<ChurnPrediction[]>(
    []
  );
  const [trendAnalyses, setTrendAnalyses] = useState<TrendAnalysis[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Fetch all forecast data
  const fetchForecasts = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        revenueResult,
        inventoryResult,
        churnResult,
        revenueTrendResult,
        ordersTrendResult,
        customersTrendResult,
      ] = await Promise.all([
        getRevenueForecast(forecastDays),
        getInventoryForecast(inventoryDays),
        predictCustomerChurn(undefined, churnRiskFilter),
        getTrendAnalysis("revenue", "week"),
        getTrendAnalysis("orders", "week"),
        getTrendAnalysis("customers", "week"),
      ]);

      // Handle results
      if (revenueResult.success && revenueResult.data) {
        setRevenueForecasts(revenueResult.data);
      } else {
        console.error("Revenue forecast error:", revenueResult.error);
      }

      if (inventoryResult.success && inventoryResult.data) {
        setInventoryForecasts(inventoryResult.data);
      } else {
        console.error("Inventory forecast error:", inventoryResult.error);
      }

      if (churnResult.success && churnResult.data) {
        setChurnPredictions(churnResult.data);
      } else {
        console.error("Churn prediction error:", churnResult.error);
      }

      // Combine trend analyses
      const trends: TrendAnalysis[] = [];
      if (revenueTrendResult.success && revenueTrendResult.data) {
        trends.push(revenueTrendResult.data);
      }
      if (ordersTrendResult.success && ordersTrendResult.data) {
        trends.push(ordersTrendResult.data);
      }
      if (customersTrendResult.success && customersTrendResult.data) {
        trends.push(customersTrendResult.data);
      }
      setTrendAnalyses(trends);
    } catch (error) {
      console.error("[fetchForecasts] Error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch forecasts"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchForecasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecastDays, inventoryDays, churnRiskFilter]);

  // Refresh handler
  const handleRefresh = () => {
    fetchForecasts(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading forecast data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-center mb-2">
            Error Loading Forecasts
          </h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <Button onClick={() => fetchForecasts()} className="w-full">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">AI-Powered Forecasts</h1>
            <p className="text-sm text-gray-600">
              Revenue predictions, inventory planning, and churn risk analysis using statistical models
            </p>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Controls */}
        <Card className="p-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Revenue Forecast Period
              </label>
              <select
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={60}>60 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Inventory Forecast Period
              </label>
              <select
                value={inventoryDays}
                onChange={(e) => setInventoryDays(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">
                Churn Risk Filter
              </label>
              <select
                value={churnRiskFilter || "all"}
                onChange={(e) =>
                  setChurnRiskFilter(
                    e.target.value === "all"
                      ? undefined
                      : (e.target.value as "low" | "medium" | "high")
                  )
                }
                className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Customers</option>
                <option value="high">High Risk Only</option>
                <option value="medium">Medium Risk Only</option>
                <option value="low">Low Risk Only</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Trend Insights */}
        {trendAnalyses.length > 0 && (
          <TrendInsights analyses={trendAnalyses} />
        )}

        {/* Revenue Forecast Chart */}
        {revenueForecasts.length > 0 && (
          <RevenueForecastChart forecasts={revenueForecasts} />
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inventory Alerts */}
          {inventoryForecasts.length > 0 && (
            <InventoryAlerts forecasts={inventoryForecasts} />
          )}

          {/* Churn Risk Summary Card */}
          {churnPredictions.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Churn Risk Summary</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {["high", "medium", "low"].map((level) => {
                  const count = churnPredictions.filter(
                    (p) => p.riskLevel === level
                  ).length;
                  const color =
                    level === "high"
                      ? "red"
                      : level === "medium"
                        ? "orange"
                        : "green";

                  return (
                    <div
                      key={level}
                      className={`p-4 rounded-lg bg-${color}-50 border border-${color}-200`}
                    >
                      <p className="text-xs font-medium text-gray-600 uppercase mb-1">
                        {level} Risk
                      </p>
                      <p className={`text-3xl font-bold text-${color}-600`}>
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  Total at-risk customers: <strong>{churnPredictions.length}</strong>
                </p>
                <p>
                  Based on RFM analysis (Recency, Frequency, Monetary value)
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Churn Risk List */}
        {churnPredictions.length > 0 && (
          <ChurnRiskList predictions={churnPredictions} />
        )}

        {/* Empty State */}
        {revenueForecasts.length === 0 &&
          inventoryForecasts.length === 0 &&
          churnPredictions.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-gray-500">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">
                  No Forecast Data Available
                </h3>
                <p>
                  Not enough historical data to generate forecasts. Please ensure
                  you have at least 7 days of order data.
                </p>
              </div>
            </Card>
          )}
      </div>
    </div>
  );
}
