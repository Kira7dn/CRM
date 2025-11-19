"use client"

import { useState } from "react"
import type { Order, OrderStatus, PaymentStatus } from "@/core/domain/order"
import { deleteOrderAction, updateOrderAction } from "../actions"
import { OrderDetailModal } from "./OrderDetailModal"
import { formatCurrency } from "@/lib/utils"

interface OrderListProps {
  initialOrders: Order[]
}

export function OrderList({ initialOrders }: OrderListProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.payment.status === paymentFilter
    return matchesStatus && matchesPayment
  })

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) {
      return
    }

    try {
      await deleteOrderAction(id)
      setOrders(orders.filter((o) => o.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete order")
    }
  }

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      const formData = new FormData()
      formData.set("id", id.toString())
      formData.set("status", status)

      await updateOrderAction(formData)

      setOrders(orders.map(o =>
        o.id === id ? { ...o, status } : o
      ))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update status")
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    const statusColors: Record<OrderStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-indigo-100 text-indigo-800",
      shipping: "bg-purple-100 text-purple-800",
      delivered: "bg-cyan-100 text-cyan-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    }
    return statusColors[status]
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    const paymentStatusColors: Record<PaymentStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      success: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800"
    }
    return paymentStatusColors[status]
  }

  const getItemsCount = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">All ({orders.length})</option>
            <option value="pending">Pending ({orders.filter(o => o.status === "pending").length})</option>
            <option value="confirmed">Confirmed ({orders.filter(o => o.status === "confirmed").length})</option>
            <option value="processing">Processing ({orders.filter(o => o.status === "processing").length})</option>
            <option value="shipping">Shipping ({orders.filter(o => o.status === "shipping").length})</option>
            <option value="delivered">Delivered ({orders.filter(o => o.status === "delivered").length})</option>
            <option value="completed">Completed ({orders.filter(o => o.status === "completed").length})</option>
            <option value="cancelled">Cancelled ({orders.filter(o => o.status === "cancelled").length})</option>
            <option value="refunded">Refunded ({orders.filter(o => o.status === "refunded").length})</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Status
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as "all" | PaymentStatus)}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    #{order.id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {order.delivery.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order.delivery.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {getItemsCount(order)} item(s)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipping">Shipping</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment.status)}`}>
                    {order.payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No orders found
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}
