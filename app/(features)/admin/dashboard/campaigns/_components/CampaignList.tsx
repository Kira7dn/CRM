"use client"

import { useState } from "react"
import type { Campaign } from "@/core/domain/campaign"
import { CampaignForm } from "./CampaignForm"
import { deleteCampaignAction } from "../actions"

interface CampaignListProps {
  initialCampaigns: Campaign[]
}

export function CampaignList({ initialCampaigns }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return

    const result = await deleteCampaignAction(id)
    if (result.success) {
      setCampaigns(campaigns.filter((c) => c.id !== id))
    } else {
      alert(result.error || "Failed to delete campaign")
    }
  }

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingCampaign(null)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      upcoming: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      ended: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    return styles[status as keyof typeof styles] || styles.ended
  }

  const getTypeBadge = (type: string) => {
    const styles = {
      discount: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      branding: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
      kol: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    return styles[type as keyof typeof styles] || styles.discount
  }

  const filteredCampaigns =
    statusFilter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter)

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filter by status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">All Campaigns</option>
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          + Create Campaign
        </button>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📢</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No campaigns found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {statusFilter === "all"
              ? "Create your first marketing campaign to get started"
              : `No ${statusFilter} campaigns at the moment`}
          </p>
          {statusFilter === "all" && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              {campaign.image && (
                <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <img
                    src={campaign.image}
                    alt={campaign.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {campaign.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(campaign.status)}`}>
                      {campaign.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeBadge(campaign.type)}`}>
                      {campaign.type}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <span className="mr-2">📅</span>
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {campaign.platforms && campaign.platforms.length > 0 && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="mr-2">🌐</span>
                      <span>{campaign.platforms.length} platform(s)</span>
                    </div>
                  )}

                  {campaign.products && campaign.products.length > 0 && (
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <span className="mr-2">📦</span>
                      <span>{campaign.products.length} product(s)</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(campaign)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <CampaignForm campaign={editingCampaign} onClose={handleFormClose} />
      )}
    </>
  )
}
