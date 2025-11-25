/**
 * Customer source platform types
 */
export type CustomerSource = "zalo" | "facebook" | "telegram" | "tiktok" | "website" | "other";

/**
 * Platform-specific customer identifiers
 */
export interface CustomerPlatformId {
  platform: CustomerSource;
  platformUserId: string; // External platform user ID (e.g., Zalo User ID, Facebook User ID)
}


/**
 * Unified Customer domain entity
 * Supports multiple platform identifiers and comprehensive customer data
 */
export type Customer = {
  id: string; // Internal customer ID (MongoDB ObjectId)
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;

  // Platform identifiers - supports multiple platforms
  platformIds: CustomerPlatformId[];

  // Primary source platform
  primarySource: CustomerSource;

  // Customer details
  address?: string;
  tags: string[]; // For segmentation (e.g., "high-value", "frequent-buyer")

  // Notes for customer management
  notes?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Get platform user ID by platform type
 */
export function getCustomerPlatformId(customer: Customer, platform: CustomerSource): string | null {
  const platformId = customer.platformIds.find(p => p.platform === platform);
  return platformId?.platformUserId || null;
}

/**
 * Validation function for Customer entity
 */
export function validateCustomer(data: Partial<Customer>): string[] {
  const errors: string[] = []

  if (!data.id || data.id.trim().length === 0) {
    errors.push('Customer ID is required')
  }

  // Name and avatar are optional in domain since they might not be available from external platforms initially

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }

  if (data.phone && !/^[0-9+\-\s()]+$/.test(data.phone)) {
    errors.push('Invalid phone format')
  }

  if (!data.platformIds || data.platformIds.length === 0) {
    errors.push('At least one platform ID is required')
  }

  if (data.platformIds) {
    const validSources: CustomerSource[] = ["zalo", "facebook", "telegram", "tiktok", "website", "other"];
    data.platformIds.forEach((pid, index) => {
      if (!validSources.includes(pid.platform)) {
        errors.push(`Invalid platform at index ${index}. Must be one of: ${validSources.join(", ")}`);
      }
      if (!pid.platformUserId || pid.platformUserId.trim().length === 0) {
        errors.push(`Platform user ID is required at index ${index}`);
      }
    });
  }

  if (!data.primarySource) {
    errors.push('Primary source platform is required')
  }

  return errors
}
