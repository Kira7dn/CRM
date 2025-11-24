"use client"

import { useState } from "react"
import { updateInventoryAction } from "../actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/ui/dialog"
import { Button } from "@shared/ui/button"

interface InventoryFormProps {
  productId?: number
  initialQuantity?: number
  initialUnitCost?: number
  reorderPoint?: number
  reorderQuantity?: number
  onClose: () => void
}

export function InventoryForm({
  productId: propProductId = 0,
  initialQuantity = 0,
  initialUnitCost = 0,
  reorderPoint: propReorderPoint = 10,
  reorderQuantity: propReorderQuantity = 50,
  onClose
}: InventoryFormProps) {
  const [reorderPoint, setReorderPoint] = useState(propReorderPoint.toString())
  const [reorderQuantity, setReorderQuantity] = useState(propReorderQuantity.toString())
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("productId", propProductId.toString())
      formData.append("reorderPoint", reorderPoint)
      formData.append("reorderQuantity", reorderQuantity)

      await updateInventoryAction(formData)

      onClose()
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update inventory configuration")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Update Inventory Configuration
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Product ID:</strong> {propProductId}
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              <strong>Current Stock:</strong> {initialQuantity} units
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              To change stock levels, use "Add Movement" instead.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reorder Point
            </label>
            <input
              type="number"
              value={reorderPoint}
              onChange={(e) => setReorderPoint(e.target.value)}
              placeholder="Minimum stock before alert"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              min="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Alert will trigger when stock falls to or below this level
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reorder Quantity
            </label>
            <input
              type="number"
              value={reorderQuantity}
              onChange={(e) => setReorderQuantity(e.target.value)}
              placeholder="Quantity to reorder"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              min="1"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Recommended quantity to reorder when stock is low
            </p>
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
              {submitting ? "Updating..." : "Update Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
