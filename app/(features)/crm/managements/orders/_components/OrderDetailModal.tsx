"use client"

import type { Order } from "@/core/domain/managements/order"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@shared/ui/dialog"
import { Button } from "@shared/ui/button"

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  open?: boolean
}

export function OrderDetailModal({ order, onClose, open = true }: OrderDetailModalProps) {
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

  console.log(order)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Order #{order.id}</DialogTitle>
              <DialogDescription className="mt-1">
                Created: {new Date(order.createdAt).toLocaleString()}
              </DialogDescription>
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
        </DialogHeader>

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
                <span className="text-sm text-gray-500 dark:text-gray-400">User ID:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {`${order.platformSource}-${order.customerId}`}
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.productName || "Product"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(item.unitPrice || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency((item.unitPrice || 0) * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <td colSpan={2} className="px-4 py-0 text-right text-sm text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </td>
                    <td className="px-4 py-0 text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(order.subtotal)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-0 text-right text-sm text-gray-600 dark:text-gray-400">
                      Shipping Fee:
                    </td>
                    <td className="px-4 py-0 text-right text-sm text-gray-900 dark:text-white">
                      {formatCurrency(order.shippingFee)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-0 text-right text-sm text-gray-600 dark:text-gray-400">
                      Discount:
                    </td>
                    <td className="px-4 py-0 text-right text-sm text-red-600 dark:text-red-400">
                      -{formatCurrency(order.discount)}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={2} className="px-4 py-0 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      Total:
                    </td>
                    <td className="px-4 py-0 text-right text-lg font-bold text-gray-900 dark:text-white">
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
                    Order ID
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {`${order.platformSource}-${order.platformOrderId}`}
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

        <DialogFooter>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
