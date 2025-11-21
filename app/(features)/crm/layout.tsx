import { CRMCopilot } from "../_shared/_components/chatbot/CRMCopilot"
import { getCurrentUserAction } from "../_shared/actions/auth-actions"
import { AdminHeader } from "./_components/AdminHeader"

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserAction()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={user?.name} userRole={user?.role} />
      <main>{children}</main>
      {user && (
        <CRMCopilot
          userId={user.id?.toString() || ""}
          userRole={(user.role as 'admin' | 'sales' | 'warehouse') || 'admin'}
        />
      )}
    </div>
  )
}
