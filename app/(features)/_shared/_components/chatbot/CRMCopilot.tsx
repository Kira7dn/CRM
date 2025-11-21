'use client';

import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useConversationHistory } from './hooks/useConversationHistory';
import {
  getOrderByIdAction,
  createOrderAction,
  updateOrderStatusAction,
  generatePaymentLinkAction,
  searchCustomersAction,
  getCustomerByIdAction,
} from './actions/crm-actions';

interface CRMCopilotProps {
  userId: string;
  userRole: 'admin' | 'sales' | 'warehouse';
}

export function CRMCopilot({ userId, userRole }: CRMCopilotProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentContext, setCurrentContext] = useState<{
    orderId?: number;
    customerId?: string;
    module?: string;
  }>({});

  // Conversation history hook
  const {
    conversations,
    currentConversationId,
    saveCurrentConversation,
    loadConversation,
    startNewConversation,
  } = useConversationHistory(userId);

  // Auto-save conversation periodically
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentConversation();
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [saveCurrentConversation]);

  // Make user context readable to the AI
  useCopilotReadable({
    description: 'Current user information and role',
    value: {
      userId,
      role: userRole,
      permissions: getRolePermissions(userRole)
    }
  });

  // Make current page context readable
  useCopilotReadable({
    description: 'Current CRM module the user is viewing',
    value: {
      path: pathname,
      module: pathname.split('/')[2] || 'dashboard',
      ...currentContext
    }
  });

  // ===== ORDER ACTIONS =====

  useCopilotAction({
    name: 'getOrder',
    description: 'Get order details by order ID. Use this when the user asks about a specific order number.',
    parameters: [
      {
        name: 'orderId',
        type: 'number',
        description: 'The order ID to retrieve',
        required: true
      }
    ],
    handler: async ({ orderId }) => {
      try {
        const order = await getOrderByIdAction(orderId);
        if (!order) {
          return {
            success: false,
            message: `Không tìm thấy đơn hàng #${orderId}`
          };
        }

        setCurrentContext({ ...currentContext, orderId });

        return {
          success: true,
          order,
          message: `Đã tìm thấy đơn hàng #${orderId}`,
          summary: {
            orderId: order.id,
            customerId: order.customerId,
            status: order.status,
            total: order.total,
            paymentStatus: order.payment.status,
            items: order.items?.length || 0
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `Không tìm thấy đơn hàng #${orderId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  useCopilotAction({
    name: 'createOrder',
    description: 'Create a new order. Requires customer ID, items, delivery info, and payment method. Only for admin and sales roles.',
    parameters: [
      {
        name: 'customerId',
        type: 'string',
        description: 'Customer ID who is placing the order',
        required: true
      },
      {
        name: 'items',
        type: 'object[]',
        description: 'Array of order items with productId, productName, quantity, unitPrice, totalPrice',
        required: true
      },
      {
        name: 'delivery',
        type: 'object',
        description: 'Delivery information with name, phone, address',
        required: true
      },
      {
        name: 'paymentMethod',
        type: 'string',
        description: 'Payment method: cod, bank_transfer, vnpay, or zalopay',
        required: true
      },
      {
        name: 'note',
        type: 'string',
        description: 'Optional order note',
        required: false
      }
    ],
    handler: async ({ customerId, items, delivery, paymentMethod, note }) => {
      // Check permissions
      if (!['admin', 'sales'].includes(userRole)) {
        return {
          success: false,
          message: 'Bạn không có quyền tạo đơn hàng. Chỉ admin và sales mới có quyền này.'
        };
      }

      try {
        const deliveryData = delivery as { name?: string; phone?: string; address?: string } | undefined;
        const deliveryInfo: { name: string; phone: string; address: string } = {
          name: deliveryData?.name || '',
          phone: deliveryData?.phone || '',
          address: deliveryData?.address || ''
        };

        const order = await createOrderAction({
          customerId,
          items,
          delivery: deliveryInfo,
          paymentMethod,
          createdBy: userId,
          note
        });

        setCurrentContext({ ...currentContext, orderId: order.id, module: 'orders' });

        return {
          success: true,
          order,
          message: `Đã tạo đơn hàng #${order.id} thành công`,
          summary: {
            orderId: order.id,
            total: order.total,
            status: order.status,
            itemCount: items.length
          }
        };
      } catch (error) {
        return {
          success: false,
          message: 'Không thể tạo đơn hàng',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  useCopilotAction({
    name: 'updateOrderStatus',
    description: 'Update the status of an order. Use this when the user wants to change an order status. All roles can update status within their permissions.',
    parameters: [
      {
        name: 'orderId',
        type: 'number',
        description: 'Order ID to update',
        required: true
      },
      {
        name: 'status',
        type: 'string',
        description: 'New status: pending, confirmed, processing, shipping, delivered, completed, cancelled',
        required: true
      }
    ],
    handler: async ({ orderId, status }) => {
      // Check permissions based on role
      const allowedStatuses: Record<string, string[]> = {
        admin: ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'completed', 'cancelled'],
        sales: ['pending', 'confirmed', 'cancelled'],
        warehouse: ['processing', 'shipping', 'delivered']
      };

      const userAllowedStatuses = allowedStatuses[userRole] || [];
      if (!userAllowedStatuses.includes(status)) {
        return {
          success: false,
          message: `Bạn không có quyền cập nhật trạng thái thành "${status}". Các trạng thái được phép: ${userAllowedStatuses.join(', ')}`
        };
      }

      try {
        const order = await updateOrderStatusAction(orderId, status);
        if (!order) {
          return {
            success: false,
            message: `Không tìm thấy đơn hàng #${orderId}`
          };
        }

        setCurrentContext({ ...currentContext, orderId, module: 'orders' });

        return {
          success: true,
          order,
          message: `Đã cập nhật đơn hàng #${orderId} sang trạng thái "${status}"`,
          summary: {
            orderId: order.id,
            newStatus: status,
            customerId: order.customerId
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `Không thể cập nhật đơn hàng #${orderId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  useCopilotAction({
    name: 'generatePaymentLink',
    description: 'Generate a payment link for an order using VNPay or ZaloPay. Use this when the user wants to create a payment link.',
    parameters: [
      {
        name: 'orderId',
        type: 'number',
        description: 'Order ID to generate payment link for',
        required: true
      },
      {
        name: 'gateway',
        type: 'string',
        description: 'Payment gateway: vnpay or zalopay (default: vnpay)',
        required: false
      }
    ],
    handler: async ({ orderId, gateway = 'vnpay' }) => {
      // Check permissions
      if (!['admin', 'sales'].includes(userRole)) {
        return {
          success: false,
          message: 'Bạn không có quyền tạo link thanh toán. Chỉ admin và sales mới có quyền này.'
        };
      }

      try {
        await generatePaymentLinkAction(orderId, gateway as 'vnpay' | 'zalopay');
        // This is not yet implemented
        return {
          success: false,
          message: 'Chức năng tạo link thanh toán chưa được triển khai. Vui lòng sử dụng trang quản lý đơn hàng.',
          error: 'Not implemented'
        };
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Không thể tạo link thanh toán',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  // ===== CUSTOMER ACTIONS =====

  useCopilotAction({
    name: 'searchCustomers',
    description: 'Search for customers by name, phone, or email. Use this when the user wants to find a customer.',
    parameters: [
      {
        name: 'query',
        type: 'string',
        description: 'Search query (name, phone, or email)',
        required: true
      }
    ],
    handler: async ({ query }) => {
      try {
        const customers = await searchCustomersAction(query);

        return {
          success: true,
          customers,
          count: customers.length,
          message: `Tìm thấy ${customers.length} khách hàng`,
          summary: customers.slice(0, 5).map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            tier: c.tier
          }))
        };
      } catch (error) {
        return {
          success: false,
          message: 'Không tìm thấy khách hàng',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  useCopilotAction({
    name: 'getCustomer',
    description: 'Get detailed information about a specific customer by ID. Use this when the user asks about a customer.',
    parameters: [
      {
        name: 'customerId',
        type: 'string',
        description: 'Customer ID to retrieve',
        required: true
      }
    ],
    handler: async ({ customerId }) => {
      try {
        const customer = await getCustomerByIdAction(customerId);
        if (!customer) {
          return {
            success: false,
            message: `Không tìm thấy khách hàng #${customerId}`
          };
        }

        setCurrentContext({ ...currentContext, customerId, module: 'customers' });

        return {
          success: true,
          customer,
          message: `Đã tìm thấy khách hàng #${customerId}`,
          summary: {
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            tier: customer.tier,
            primarySource: customer.primarySource,
            totalOrders: customer.stats.totalOrders || 0,
            totalSpent: customer.stats.totalSpent || 0
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `Không tìm thấy khách hàng #${customerId}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }
  });

  // ===== NAVIGATION ACTIONS =====

  useCopilotAction({
    name: 'navigateToOrder',
    description: 'Navigate the user to an order details page',
    parameters: [
      {
        name: 'orderId',
        type: 'number',
        description: 'Order ID to view',
        required: true
      }
    ],
    handler: async ({ orderId }) => {
      router.push(`/crm/orders/${orderId}`);
      setCurrentContext({ ...currentContext, orderId, module: 'orders' });

      return {
        success: true,
        message: `Đã chuyển đến trang đơn hàng #${orderId}`
      };
    }
  });

  useCopilotAction({
    name: 'navigateToCustomer',
    description: 'Navigate the user to a customer details page',
    parameters: [
      {
        name: 'customerId',
        type: 'string',
        description: 'Customer ID to view',
        required: true
      }
    ],
    handler: async ({ customerId }) => {
      router.push(`/crm/customers/${customerId}`);
      setCurrentContext({ ...currentContext, customerId, module: 'customers' });

      return {
        success: true,
        message: `Đã chuyển đến trang khách hàng #${customerId}`
      };
    }
  });

  return (
    <CopilotSidebar
      defaultOpen={false}
      clickOutsideToClose={true}
      labels={{
        title: 'CRM Assistant',
        initial: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        placeholder: 'Nhập câu hỏi hoặc yêu cầu...'
      }}
      instructions={`You are an intelligent CRM assistant for Hải Sản Ngày Mới (Fresh Seafood from Cô Tô Island).

Current user role: ${userRole}

You help users:
- Manage orders (get details, create, update status, generate payment links)
- Search and manage customers
- View analytics and reports (revenue, top products, customer metrics)
- Navigate the CRM system

Always be helpful, concise, and action-oriented. After completing an action, suggest relevant next steps.
Respond in Vietnamese when appropriate.

Role permissions:
- Admin: Full access to all features
- Sales: Can manage orders, customers, products, and posts
- Warehouse: Can view orders and update order status to processing/shipping

When suggesting actions, respect the user's role permissions.`}
      className="custom-copilot-sidebar"
    />
  );
}

// Helper function to get role permissions
function getRolePermissions(role: string) {
  const permissions = {
    admin: ['orders:*', 'customers:*', 'products:*', 'analytics:*', 'posts:*'],
    sales: ['orders:*', 'customers:*', 'products:read', 'posts:*'],
    warehouse: ['orders:read', 'orders:update_status', 'products:inventory']
  };
  return permissions[role as keyof typeof permissions] || [];
}
