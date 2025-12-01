import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import SocialConnectionsManager from "./_components/SocialConnectionsManager"

export default async function SocialConnectionsPage() {
  // Get current user ID from session
  const cookieStore = await cookies()
  const userIdCookie = cookieStore.get("admin_user_id")

  if (!userIdCookie) {
    return (
      <div className="container mx-auto max-w-6xl p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Please login to access social media integrations
          </p>
        </div>
      </div>
    )
  }

  const userId = new ObjectId(userIdCookie.value)

  // Fetch all social auth connections
  const { SocialAuthRepository } = await import("@/infrastructure/repositories/social/social-auth-repo")
  const repo = new SocialAuthRepository()

  const allConnections = await repo.getAllByUser(userId)

  // Convert ObjectId to string for client component
  const connections = JSON.parse(JSON.stringify(allConnections))

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Social Media Connections</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Connect and manage your social media accounts for content publishing and analytics
        </p>
      </div>

      {/* Social Connections Manager */}
      <SocialConnectionsManager connections={connections} />
    </div>
  )
}
