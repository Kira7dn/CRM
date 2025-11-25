"use client"

import { useState } from "react"
import type { Customer } from "@/core/domain/customers/customer"
import { createCustomerAction, updateCustomerAction } from "../actions"
import { ImageUpload } from "@/app/(features)/crm/_components/ImageUpload"

interface CustomerFormProps {
  customer?: Customer | null
  onClose: () => void
}

export function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(customer?.avatar || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("avatar", avatarUrl)

      if (customer) {
        await updateCustomerAction(formData)
      } else {
        await createCustomerAction(formData)
      }

      window.location.reload() // Reload to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save customer")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {customer ? "Edit Customer" : "Add Customer"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Customer ID * {customer && "(Cannot be changed)"}
              </label>
              <input
                type="text"
                name="id"
                defaultValue={customer?.id}
                required
                readOnly={!!customer}
                placeholder="e.g., zalo_123456 or fb_789012"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-900"
                disabled={!!customer}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                External platform ID (Zalo, Facebook, or Telegram)
              </p>
            </div>

            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Platform *
              </label>
              <select
                name="foundation"
                defaultValue={customer?.primarySource || "zalo"}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="zalo">💬 Zalo</option>
                <option value="facebook">📘 Facebook</option>
                <option value="telegram">✈️ Telegram</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="website">🌐 Website</option>
                <option value="other">📱 Other</option>
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                defaultValue={customer?.name}
                placeholder="Customer name"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={customer?.phone}
                  placeholder="+84 xxx xxx xxx"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={customer?.email}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <textarea
                name="address"
                defaultValue={customer?.address}
                rows={2}
                placeholder="Delivery address"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            {/* Avatar Upload */}
            <ImageUpload
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
              folder="avatars"
              label="Customer Avatar"
              disabled={loading}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Saving..." : customer ? "Update" : "Create"}
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
