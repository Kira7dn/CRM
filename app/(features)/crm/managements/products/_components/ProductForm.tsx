"use client"

import { useState } from "react"
import type { Product, SizeOption } from "@/core/domain/managements/product"
import type { Category } from "@/core/domain/managements/category"
import { createProductAction, updateProductAction } from "../actions"
import { ImageUpload } from "@/app/(features)/crm/_components/ImageUpload"

interface ProductFormProps {
  product?: Product | null
  categories: Category[]
  onClose: () => void
}

export function ProductForm({ product, categories, onClose }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [sizes, setSizes] = useState<SizeOption[]>(product?.sizes || [])
  const [colors, setColors] = useState<string[]>(product?.colors || [])
  const [imageUrl, setImageUrl] = useState(product?.image || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Add sizes and colors as JSON strings
      formData.set("sizes", JSON.stringify(sizes))
      formData.set("colors", JSON.stringify(colors))
      formData.set("image", imageUrl)

      if (product) {
        formData.set("id", product.id.toString())
        await updateProductAction(formData)
      } else {
        await createProductAction(formData)
      }

      window.location.reload() // Reload to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save product")
      setLoading(false)
    }
  }

  const addSize = () => {
    setSizes([...sizes, { label: "", price: 0 }])
  }

  const updateSize = (index: number, field: "label" | "price" | "originalPrice", value: string | number) => {
    const newSizes = [...sizes]
    if (field === "price" || field === "originalPrice") {
      newSizes[index] = { ...newSizes[index], [field]: parseFloat(value as string) || 0 }
    } else {
      newSizes[index] = { ...newSizes[index], label: value as string }
    }
    setSizes(newSizes)
  }

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index))
  }

  const addColor = () => {
    setColors([...colors, "#000000"])
  }

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors]
    newColors[index] = value
    setColors(newColors)
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {product ? "Edit Product" : "Add Product"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                defaultValue={product?.name}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                name="categoryId"
                defaultValue={product?.categoryId}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (VND) *
                </label>
                <input
                  type="number"
                  name="price"
                  defaultValue={product?.price}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Original Price (VND)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  defaultValue={product?.originalPrice}
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Image Upload */}
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              folder="products"
              label="Product Image"
              disabled={loading}
            />

            {/* Detail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="detail"
                defaultValue={product?.detail}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Size Options
                </label>
                <button
                  type="button"
                  onClick={addSize}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Size
                </button>
              </div>
              {sizes.map((size, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Label (e.g., 500g)"
                    value={size.label}
                    onChange={(e) => updateSize(index, "label", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={size.price}
                    onChange={(e) => updateSize(index, "price", e.target.value)}
                    className="w-32 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Color Options
                </label>
                <button
                  type="button"
                  onClick={addColor}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add Color
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-10 h-10 border rounded cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => removeColor(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Saving..." : product ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
