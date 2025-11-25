"use client"

import { useState } from "react"
import type { Banner } from "@/core/domain/campaigns/banner"
import { deleteBannerAction } from "../actions"
import { BannerForm } from "./BannerForm"

interface BannerListProps {
  initialBanners: Banner[]
}

export function BannerList({ initialBanners }: BannerListProps) {
  const [banners, setBanners] = useState(initialBanners)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return
    }

    try {
      await deleteBannerAction(id)
      setBanners(banners.filter((b) => b.id !== id))
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete banner")
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingBanner(null)
  }

  return (
    <div>
      {/* Add Banner Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Banner
        </button>
      </div>

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {/* Banner Image */}
            <div className="aspect-video bg-gray-100 dark:bg-gray-700">
              <img
                src={banner.url}
                alt={`Banner ${banner.id}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23ddd' width='400' height='300'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E"
                }}
              />
            </div>

            {/* Banner Info */}
            <div className="p-4">
              <div className="mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Banner ID: {banner.id}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 truncate">
                {banner.url}
              </p>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Created: {new Date(banner.createdAt).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(banner)}
                  className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No banners found. Add your first banner to get started.
        </div>
      )}

      {/* Banner Form Modal */}
      {isFormOpen && (
        <BannerForm banner={editingBanner} onClose={handleCloseForm} />
      )}
    </div>
  )
}
