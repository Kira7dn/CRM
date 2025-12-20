"use client"

import { useState } from "react"
import type { OperationalCost, CostCategory, CostType } from "@/core/domain/sales/operational-cost"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/ui/dialog"
import { Button } from "@shared/ui/button"

interface CostFormProps {
  cost?: OperationalCost | null
  onClose: () => void
}

export function CostForm({ cost, onClose }: CostFormProps) {
  const [category, setCategory] = useState<CostCategory>(cost?.category || "other")
  const [type, setType] = useState<CostType>(cost?.type || "variable")
  const [amount, setAmount] = useState(cost?.amount.toString() || "")
  const [description, setDescription] = useState(cost?.description || "")
  const [date, setDate] = useState(cost?.date ? new Date(cost.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [orderId, setOrderId] = useState(cost?.orderId?.toString() || "")
  const [notes, setNotes] = useState(cost?.notes || "")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("category", category)
      formData.append("type", type)
      formData.append("amount", amount)
      formData.append("description", description)
      formData.append("date", date)
      if (orderId) formData.append("orderId", orderId)
      if (notes) formData.append("notes", notes)

      // if (cost) {
      //   formData.append("id", cost.id.toString())
      //   await updateCostAction(formData)
      // } else {
      //   await createCostAction(formData)
      // }

      onClose()
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save cost")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {cost ? "Edit Cost" : "Create Cost"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as CostCategory)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            >
              <option value="order_processing">Order Processing</option>
              <option value="shipping">Shipping</option>
              <option value="packaging">Packaging</option>
              <option value="marketing">Marketing</option>
              <option value="staff_salary">Staff Salary</option>
              <option value="utilities">Utilities</option>
              <option value="rent">Rent</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CostType)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            >
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
              <option value="one_time">One Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (VND)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order ID (Optional)
            </label>
            <input
              type="number"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Link to order (for variable costs)"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Saving..." : cost ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
