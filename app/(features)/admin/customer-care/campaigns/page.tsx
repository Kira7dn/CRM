import { Button } from "@shared/ui/button";
import { Plus } from "lucide-react";
import { CampaignList } from "./_components/CampaignList";

export default async function CampaignsPage() {
  // Mock data for now - will be replaced with API call
  const campaigns = [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Message Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage automated message campaigns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <CampaignList campaigns={campaigns} />
    </div>
  );
}
