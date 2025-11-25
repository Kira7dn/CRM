/**
 * Domain Entity: Customer Behavior Analytics Metrics
 *
 * Contains all business entities and types for customer behavior analytics.
 * This is a pure domain layer with no external dependencies.
 */

import { DateRange } from "./revenue-metrics";

/**
 * Core customer metrics for a given period
 */
export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  churnRate: number;
  period: DateRange;
  segmentDistribution: CustomerSegmentStats[];
}

/**
 * Customer segment statistics by tier
 */
export interface CustomerSegmentStats {
  count: number;
  percentage: number;
  averageRevenue: number;
  averageOrderFrequency: number;
}

/**
 * Purchase pattern for a customer
 */
export interface PurchasePattern {
  customerId: string;
  customerName: string;
  firstPurchaseDate: Date;
  lastPurchaseDate: Date;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  daysSinceLastPurchase: number;
  favoriteCategories: FavoriteCategory[];
  averageDaysBetweenOrders: number;
  churnRisk: ChurnRisk;
  platform?: string;
  phone?: string;
}

/**
 * Favorite category for a customer
 */
export interface FavoriteCategory {
  categoryId: number;
  categoryName: string;
  orderCount: number;
}

/**
 * Churn risk level
 */
export type ChurnRisk = "low" | "medium" | "high";

/**
 * Customer retention data for cohort analysis
 */
export interface CustomerRetention {
  period: string; // "Month 1", "Month 2", etc.
  cohortSize: number;
  retainedCustomers: number;
  retentionRate: number;
}

/**
 * Cohort retention data
 */
export interface CohortRetention {
  cohortStartDate: Date;
  cohortName: string; // e.g., "Jan 2025"
  retentionPeriods: CustomerRetention[];
}

/**
 * Customer lifetime value (CLV) metrics
 */
export interface CustomerLifetimeValue {
  customerId: string;
  customerName: string;
  lifetimeRevenue: number;
  lifetimeOrders: number;
  customerAge: number; // Days since first purchase
  predictedLTV: number; // Estimated future value
}

/**
 * RFM (Recency, Frequency, Monetary) Analysis
 */
export interface RFMSegment {
  customerId: string;
  customerName: string;
  recency: number; // Days since last purchase
  frequency: number; // Total number of orders
  monetary: number; // Total revenue
  recencyScore: number; // 1-5 (5 = most recent)
  frequencyScore: number; // 1-5 (5 = most frequent)
  monetaryScore: number; // 1-5 (5 = highest value)
  rfmScore: string; // e.g., "555" = Champions, "111" = Lost
  segment: RFMSegmentName;
}

/**
 * RFM segment names
 */
export type RFMSegmentName =
  | "Champions" // 555, 554, 544, 545
  | "Loyal Customers" // 543, 444, 435, 355, 354, 345
  | "Potential Loyalists" // 553, 551, 552, 541, 542, 533, 532, 531
  | "New Customers" // 512, 511, 422, 421, 412, 411, 311
  | "Promising" // 525, 524, 523, 522, 521, 515, 514, 513
  | "Need Attention" // 535, 534, 443, 434, 343, 334, 325, 324
  | "About to Sleep" // 331, 321, 312, 221, 213, 231, 241, 251
  | "At Risk" // 255, 254, 245, 244, 253, 252, 243, 242, 235, 234
  | "Cannot Lose Them" // 155, 154, 144, 214, 215, 115, 114, 113
  | "Hibernating" // 332, 322, 231, 241, 251, 233, 232, 223, 222
  | "Lost"; // 111, 112, 121, 131-132, 141-142, 151, 152, 133, 123, 122

/**
 * Validation: Validate churn risk threshold configuration
 */
export interface ChurnRiskThresholds {
  highRiskDays: number; // e.g., 90 days - no purchase = high risk
  mediumRiskDays: number; // e.g., 60 days - no purchase = medium risk
  lowRiskDays: number; // e.g., 30 days - no purchase = low risk
}

/**
 * Default churn risk thresholds
 */
export const DEFAULT_CHURN_THRESHOLDS: ChurnRiskThresholds = {
  highRiskDays: 90,
  mediumRiskDays: 60,
  lowRiskDays: 30,
};

/**
 * Calculate churn risk based on days since last purchase
 */
export function calculateChurnRisk(
  daysSinceLastPurchase: number,
  thresholds: ChurnRiskThresholds = DEFAULT_CHURN_THRESHOLDS
): ChurnRisk {
  if (daysSinceLastPurchase >= thresholds.highRiskDays) {
    return "high";
  }
  if (daysSinceLastPurchase >= thresholds.mediumRiskDays) {
    return "medium";
  }
  return "low";
}

/**
 * Calculate RFM scores (1-5 scale)
 */
export function calculateRFMScores(
  recency: number,
  frequency: number,
  monetary: number,
  recencyQuartiles: number[],
  frequencyQuartiles: number[],
  monetaryQuartiles: number[]
): { recencyScore: number; frequencyScore: number; monetaryScore: number } {
  // Recency: Lower is better (5 = most recent)
  let recencyScore = 1;
  if (recency <= recencyQuartiles[0]) recencyScore = 5;
  else if (recency <= recencyQuartiles[1]) recencyScore = 4;
  else if (recency <= recencyQuartiles[2]) recencyScore = 3;
  else if (recency <= recencyQuartiles[3]) recencyScore = 2;

  // Frequency: Higher is better (5 = most frequent)
  let frequencyScore = 1;
  if (frequency >= frequencyQuartiles[3]) frequencyScore = 5;
  else if (frequency >= frequencyQuartiles[2]) frequencyScore = 4;
  else if (frequency >= frequencyQuartiles[1]) frequencyScore = 3;
  else if (frequency >= frequencyQuartiles[0]) frequencyScore = 2;

  // Monetary: Higher is better (5 = highest value)
  let monetaryScore = 1;
  if (monetary >= monetaryQuartiles[3]) monetaryScore = 5;
  else if (monetary >= monetaryQuartiles[2]) monetaryScore = 4;
  else if (monetary >= monetaryQuartiles[1]) monetaryScore = 3;
  else if (monetary >= monetaryQuartiles[0]) monetaryScore = 2;

  return { recencyScore, frequencyScore, monetaryScore };
}

/**
 * Determine RFM segment name based on scores
 */
export function getRFMSegmentName(rfmScore: string): RFMSegmentName {
  // Champions
  if (["555", "554", "544", "545"].includes(rfmScore)) return "Champions";

  // Loyal Customers
  if (["543", "444", "435", "355", "354", "345"].includes(rfmScore))
    return "Loyal Customers";

  // Potential Loyalists
  if (["553", "551", "552", "541", "542", "533", "532", "531"].includes(rfmScore))
    return "Potential Loyalists";

  // New Customers
  if (["512", "511", "422", "421", "412", "411", "311"].includes(rfmScore))
    return "New Customers";

  // Promising
  if (["525", "524", "523", "522", "521", "515", "514", "513"].includes(rfmScore))
    return "Promising";

  // Need Attention
  if (["535", "534", "443", "434", "343", "334", "325", "324"].includes(rfmScore))
    return "Need Attention";

  // About to Sleep
  if (["331", "321", "312", "221", "213", "231", "241", "251"].includes(rfmScore))
    return "About to Sleep";

  // At Risk
  if (["255", "254", "245", "244", "253", "252", "243", "242", "235", "234"].includes(rfmScore))
    return "At Risk";

  // Cannot Lose Them
  if (["155", "154", "144", "214", "215", "115", "114", "113"].includes(rfmScore))
    return "Cannot Lose Them";

  // Hibernating
  if (["332", "322", "231", "241", "251", "233", "232", "223", "222"].includes(rfmScore))
    return "Hibernating";

  // Lost (default)
  return "Lost";
}

/**
 * Validation functions
 */
export function validateCohortPeriods(periods: number): string[] {
  const errors: string[] = [];

  if (periods <= 0) {
    errors.push("Periods must be greater than 0");
  }

  if (periods > 24) {
    errors.push("Periods cannot exceed 24 months");
  }

  return errors;
}
