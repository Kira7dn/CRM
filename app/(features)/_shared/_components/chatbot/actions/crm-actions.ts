'use server';

import {
  getOrderByIdUseCase,
  createOrderUseCase,
  updateOrderUseCase
} from '@/app/api/orders/depends';

import {
  searchCustomersByNameUseCase,
  getCustomerByIdUseCase,
  getAllCustomersUseCase
} from '@/app/api/customers/depends';

// ===== ORDER ACTIONS =====

export async function getOrderByIdAction(orderId: number) {
  try {
    const useCase = await getOrderByIdUseCase();
    const result = await useCase.execute({ id: orderId });
    return result.order;
  } catch (error) {
    console.error('Error getting order:', error);
    throw new Error(`Failed to get order #${orderId}`);
  }
}

export async function createOrderAction(data: {
  customerId: string;
  items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
  delivery: {
    name: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  createdBy: string;
  shippingFee?: number;
  discount?: number;
  note?: string;
}) {
  try {
    const useCase = await createOrderUseCase();
    const result = await useCase.execute({
      customerId: data.customerId,
      items: data.items,
      delivery: data.delivery,
      payment: {
        method: data.paymentMethod as any,
        status: 'pending' as any,
        amount: data.items.reduce((sum, item) => sum + item.totalPrice, 0)
      },
      shippingFee: data.shippingFee,
      discount: data.discount,
      note: data.note
    });
    return result.order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
}

export async function updateOrderStatusAction(orderId: number, status: string) {
  try {
    const useCase = await updateOrderUseCase();
    const result = await useCase.execute({
      id: orderId,
      payload: { status: status as any }
    });
    return result.order;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(`Failed to update order #${orderId} status`);
  }
}

// TODO: Implement proper payment link generation
// This requires creating a new use case that integrates with payment gateways
export async function generatePaymentLinkAction(orderId: number, gateway: 'vnpay' | 'zalopay' = 'vnpay') {
  // Placeholder - not yet implemented
  throw new Error('Payment link generation not yet implemented');
}

// ===== CUSTOMER ACTIONS =====

export async function searchCustomersAction(query: string) {
  try {
    const useCase = await searchCustomersByNameUseCase();
    const result = await useCase.execute({ name: query });
    return result.customers || [];
  } catch (error) {
    console.error('Error searching customers:', error);
    // If search fails, try getting all customers
    try {
      const getAllUseCase = await getAllCustomersUseCase();
      const allResult = await getAllUseCase.execute({});
      // Filter by query on the result
      return allResult.customers.filter(c =>
        c.name?.toLowerCase().includes(query.toLowerCase()) ||
        c.phone?.includes(query) ||
        c.email?.toLowerCase().includes(query.toLowerCase())
      );
    } catch {
      return [];
    }
  }
}

export async function getCustomerByIdAction(customerId: string) {
  try {
    const useCase = await getCustomerByIdUseCase();
    const result = await useCase.execute({ id: customerId });
    return result.customer;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw new Error(`Failed to get customer #${customerId}`);
  }
}

// ===== ANALYTICS ACTIONS =====

export async function getRevenueStatsAction(startDate: string, endDate: string) {
  // TODO: Implement analytics use case when available
  // For now, return mock data
  return {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    startDate,
    endDate
  };
}
