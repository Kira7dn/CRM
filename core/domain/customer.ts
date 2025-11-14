export type Customer = {
  id: string;
  name?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  foundation: string; // Zalo, facebook, telegram
  address?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function validateCustomer(data: Partial<Customer>): string[] {
  const errors: string[] = []

  if (!data.id || data.id.trim().length === 0) {
    errors.push('Customer ID is required')
  }

  // Name and avatar are optional in domain since they might not be available from external platforms initially

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format')
  }

  if (!data.foundation || data.foundation.trim().length === 0) {
    errors.push('Foundation (Zalo, Facebook, Telegram) is required')
  }

  return errors
}
