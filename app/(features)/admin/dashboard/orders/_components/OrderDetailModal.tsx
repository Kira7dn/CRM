"use client"

import type { Order } from "@/core/domain/order"
import { formatCurrency } from "@/lib/utils"

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      shipping: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.id}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Created: {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.payment.status)}`}>
                Payment: {order.payment.status}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Customer Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.delivery.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Phone:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{order.delivery.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Zalo User ID:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {order.platformSource === 'zalo' ? order.platformOrderId : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Address:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-md">
                    {order.delivery.address}
                  </span>
                </div>
                {order.delivery.location && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Location:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.delivery.location.lat}, {order.delivery.location.lon}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Order Items
              </h3>
              <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {(item.product as any).name || "Product"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency((item.product as any).price || 0)} each
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(((item.product as any).price || 0) * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            {order.platformOrderId && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Payment Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {order.platformSource === 'zalo' ? 'Zalo Order ID' : 'Platform Order ID'}:
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {order.platformOrderId}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.note && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Notes
                </h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.note}</p>
                </div>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
