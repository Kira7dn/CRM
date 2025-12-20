import { getBannersUseCase } from "@/app/api/banners/depends"
import { BannerList } from "./_components/BannerList"

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function BannersPage() {
  // Get banners using injected use case
  const useCase = await getBannersUseCase()
  const result = await useCase.execute({})

  // Serialize to plain objects (convert Date objects)
  const banners = JSON.parse(JSON.stringify(result.banners))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage homepage and promotional banners
          </p>
        </div>

        {/* Banner List */}
        <BannerList initialBanners={banners} />
      </div>
    </div>
  )
}
