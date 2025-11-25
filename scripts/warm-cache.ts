/**
 * Cache Warming Script
 * Sprint 7 - Performance Optimization
 *
 * Pre-populates Redis cache with common analytics queries.
 * Run: npx tsx scripts/warm-cache.ts
 * Recommended: Run daily via cron or scheduler
 */

import { subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { getCache } from "../infrastructure/adapters/cache/redis-cache";
import { createGetRevenueMetricsUseCase } from "../app/api/analytics/revenue/depends";
import { createGetRevenueForecastUseCase } from "../app/api/analytics/forecast/depends";

async function warmCache() {
  console.log("🔥 Starting cache warming...\n");

  const cache = getCache();
  const startTime = Date.now();

  try {
    // Check Redis connection
    const stats = await cache.getStats();
    console.log("📊 Redis Stats:");
    console.log(`  - Connected clients: ${stats.connectedClients}`);
    console.log(`  - Used memory: ${stats.usedMemory}`);
    console.log(`  - Total keys: ${stats.totalKeys}\n`);

    // ==================== REVENUE ANALYTICS ====================
    console.log("💰 Warming revenue analytics cache...");

    const revenueUseCase = await createGetRevenueMetricsUseCase();

    // Last 7 days
    await revenueUseCase.execute({
      startDate: subDays(new Date(), 6),
      endDate: new Date(),
    });
    console.log("  ✓ Last 7 days");

    // Last 30 days
    await revenueUseCase.execute({
      startDate: subDays(new Date(), 29),
      endDate: new Date(),
    });
    console.log("  ✓ Last 30 days");

    // Last 90 days
    await revenueUseCase.execute({
      startDate: subDays(new Date(), 89),
      endDate: new Date(),
    });
    console.log("  ✓ Last 90 days");

    // Current month
    await revenueUseCase.execute({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date()),
    });
    console.log("  ✓ Current month");

    // Last month
    const lastMonth = subMonths(new Date(), 1);
    await revenueUseCase.execute({
      startDate: startOfMonth(lastMonth),
      endDate: endOfMonth(lastMonth),
    });
    console.log("  ✓ Last month\n");

    // ==================== REVENUE FORECASTS ====================
    console.log("🔮 Warming forecast cache...");

    const forecastUseCase = await createGetRevenueForecastUseCase();

    // 7-day forecast
    await forecastUseCase.execute({ daysAhead: 7 });
    console.log("  ✓ 7-day forecast");

    // 30-day forecast
    await forecastUseCase.execute({ daysAhead: 30 });
    console.log("  ✓ 30-day forecast");

    // 90-day forecast
    await forecastUseCase.execute({ daysAhead: 90 });
    console.log("  ✓ 90-day forecast\n");

    // ==================== FINAL STATS ====================
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    const finalStats = await cache.getStats();

    console.log("✅ Cache warming complete!");
    console.log(`\n⏱️  Duration: ${duration.toFixed(2)}s`);
    console.log(`\n📊 Final Stats:`);
    console.log(`  - Total keys: ${finalStats.totalKeys}`);
    console.log(`  - Used memory: ${finalStats.usedMemory}`);
    console.log(
      `  - Keys added: ${finalStats.totalKeys - stats.totalKeys}`
    );

    console.log("\n💡 Next steps:");
    console.log("  1. Schedule this script to run daily (e.g., cron job)");
    console.log("  2. Monitor cache hit rates in production");
    console.log("  3. Adjust TTL values based on usage patterns");
  } catch (error) {
    console.error("\n❌ Error warming cache:", error);
    throw error;
  }
}

// Run the script
warmCache()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
