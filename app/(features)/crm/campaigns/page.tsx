import { CampaignList } from "./_components/CampaignList"
import { getCampaignsAction } from "./actions"

export default async function CampaignsPage() {
  const campaigns = await getCampaignsAction()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your marketing campaigns across multiple platforms
        </p>
      </div>

      <CampaignList initialCampaigns={campaigns} />
    </div>
  )
}
