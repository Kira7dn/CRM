"use client";

/**
 * Campaign Selector Component
 *
 * Multi-select dropdown for selecting campaigns to compare.
 */

import { useState, useEffect } from "react";
import { Card } from "@/@shared/ui/card";
import { Button } from "@/@shared/ui/button";
import { X } from "lucide-react";

interface Campaign {
  _id: number;
  name: string;
  status: string;
}

interface CampaignSelectorProps {
  selectedCampaignIds: number[];
  onSelectionChange: (ids: number[]) => void;
  campaigns: Campaign[];
}

export function CampaignSelector({
  selectedCampaignIds,
  onSelectionChange,
  campaigns,
}: CampaignSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCampaign = (campaignId: number) => {
    if (selectedCampaignIds.includes(campaignId)) {
      onSelectionChange(selectedCampaignIds.filter((id) => id !== campaignId));
    } else {
      if (selectedCampaignIds.length < 5) {
        onSelectionChange([...selectedCampaignIds, campaignId]);
      }
    }
  };

  const removeCampaign = (campaignId: number) => {
    onSelectionChange(selectedCampaignIds.filter((id) => id !== campaignId));
  };

  return (
    <Card className="p-4">
      <div className="mb-3">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Select Campaigns to Compare (max 5)
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-sm text-gray-700">
              {selectedCampaignIds.length > 0
                ? `${selectedCampaignIds.length} campaign(s) selected`
                : "Select campaigns..."}
            </span>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {campaigns.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No campaigns available
                </div>
              ) : (
                campaigns.map((campaign) => {
                  const isSelected = selectedCampaignIds.includes(campaign._id);
                  const isDisabled =
                    !isSelected && selectedCampaignIds.length >= 5;

                  return (
                    <button
                      key={campaign._id}
                      type="button"
                      onClick={() => !isDisabled && toggleCampaign(campaign._id)}
                      disabled={isDisabled}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition ${
                        isSelected ? "bg-blue-50 text-blue-700 font-medium" : ""
                      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{campaign.name}</span>
                        {isSelected && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Status: {campaign.status}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Campaigns */}
      {selectedCampaignIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedCampaignIds.map((id) => {
            const campaign = campaigns.find((c) => c._id === id);
            if (!campaign) return null;

            return (
              <div
                key={id}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                <span>{campaign.name}</span>
                <button
                  type="button"
                  onClick={() => removeCampaign(id)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
