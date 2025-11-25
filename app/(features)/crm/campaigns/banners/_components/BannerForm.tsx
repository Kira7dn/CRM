"use client"

import { useState } from "react"
import type { Banner } from "@/core/domain/campaigns/banner"
import { createBannerAction, updateBannerAction } from "../actions"
import { ImageUpload } from "@/app/(features)/crm/_components/ImageUpload"

interface BannerFormProps {
  banner?: Banner | null
  onClose: () => void
}

export function BannerForm({ banner, onClose }: BannerFormProps) {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(banner?.url || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.set("url", imageUrl)

      if (banner) {
        formData.set("id", banner.id.toString())
        await updateBannerAction(formData)
      } else {
        await createBannerAction(formData)
      }

      window.location.reload() // Reload to show updated data
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save banner")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {banner ? "Edit Banner" : "Add Banner"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <ImageUpload
              value={imageUrl}
              onChange={(url) => setImageUrl(url)}
              folder="banners"
              label="Banner Image (Recommended: 1920x600px)"
              disabled={loading}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Saving..." : banner ? "Update" : "Create"}
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
