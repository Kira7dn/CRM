"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Campaign } from "@/core/domain/managements/campaign"
import { createCampaignAction, updateCampaignAction } from "../actions"
import { ImageUpload } from "@/app/(features)/crm/_components/ImageUpload"

interface CampaignFormProps {
  campaign?: Campaign | null
  onClose: () => void
}

export function CampaignForm({ campaign, onClose }: CampaignFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [imageUrl, setImageUrl] = useState(campaign?.image || "")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("image", imageUrl)

    try {
      const result = campaign
        ? await updateCampaignAction(campaign.id, formData)
        : await createCampaignAction(formData)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || "An error occurred")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date)
    return d.toISOString().split("T")[0]
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaign ? "Edit Campaign" : "Create Campaign"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              name="name"
              defaultValue={campaign?.name || ""}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Summer Sale 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              defaultValue={campaign?.description || ""}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="Describe your campaign..."
            />
          </div>

          <ImageUpload
            value={imageUrl}
            onChange={(url) => setImageUrl(url)}
            folder="campaigns"
            label="Campaign Image *"
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                defaultValue={campaign ? formatDateForInput(campaign.startDate) : ""}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                defaultValue={campaign ? formatDateForInput(campaign.endDate) : ""}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Campaign Type *
            </label>
            <select
              name="type"
              defaultValue={campaign?.type || "discount"}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="discount">Discount</option>
              <option value="branding">Branding</option>
              <option value="kol">KOL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Product IDs (JSON array)
            </label>
            <input
              type="text"
              name="products"
              defaultValue={campaign?.products ? JSON.stringify(campaign.products) : "[]"}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              placeholder='[1, 2, 3]'
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Example: [1, 2, 3] - List of product IDs to include in this campaign
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Platforms (JSON array)
            </label>
            <textarea
              name="platforms"
              defaultValue={campaign?.platforms ? JSON.stringify(campaign.platforms, null, 2) : "[]"}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
              placeholder='[{"platform": "facebook", "campaignId": "123", "utmParams": {"source": "fb", "medium": "social", "campaign": "summer"}}]'
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Platform configurations with UTM parameters for tracking
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : campaign ? "Update Campaign" : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
