"use client"

import { useState } from "react"
import type { Product } from "@/core/domain/managements/product"
import { addStockMovementAction } from "../actions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@shared/ui/dialog"
import { Button } from "@shared/ui/button"

interface StockMovementFormProps {
  inventoryId?: number | null
  products: Product[]
  onClose: () => void
}

export function StockMovementForm({ inventoryId, products, onClose }: StockMovementFormProps) {
  const [productId, setProductId] = useState(inventoryId !== null && inventoryId !== undefined ? inventoryId.toString() : "")
  const [type, setType] = useState<"in" | "out" | "adjustment" | "return">("in")
  const [quantity, setQuantity] = useState("")
  const [unitCost, setUnitCost] = useState("")
  const [reason, setReason] = useState("")
  const [performedBy, setPerformedBy] = useState("")
  const [referenceOrderId, setReferenceOrderId] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("productId", productId)
      formData.append("type", type)
      formData.append("quantity", quantity)
      formData.append("unitCost", unitCost)
      formData.append("reason", reason)
      if (performedBy) formData.append("performedBy", performedBy)
      if (referenceOrderId) formData.append("referenceOrderId", referenceOrderId)
      if (notes) formData.append("notes", notes)

      await addStockMovementAction(formData)

      onClose()
      window.location.reload() // Refresh to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add stock movement")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Stock Movement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              disabled={!!inventoryId}
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (ID: {product.id})
                </option>
              ))}
            </select>
            {inventoryId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Product is pre-selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Movement Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "in" | "out" | "adjustment" | "return")}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            >
              <option value="in">Stock In (Receive)</option>
              <option value="out">Stock Out (Sale/Withdrawal)</option>
              <option value="adjustment">Adjustment (Set to exact amount)</option>
              <option value="return">Return (Customer return)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={type === "adjustment" ? "Set stock to this amount" : "Enter quantity"}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              min="0"
            />
            {type === "adjustment" && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will set the stock to exactly this amount
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Cost (VND)
            </label>
            <input
              type="number"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="Enter unit cost"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for movement"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Performed By (Optional)
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="Name of person performing action"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            />
          </div>

          {(type === "out" || type === "return") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reference Order ID (Optional)
              </label>
              <input
                type="number"
                value={referenceOrderId}
                onChange={(e) => setReferenceOrderId(e.target.value)}
                placeholder="Link to order"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              rows={3}
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
              {submitting ? "Adding..." : "Add Movement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
