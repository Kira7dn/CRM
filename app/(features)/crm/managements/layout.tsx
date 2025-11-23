import { getCurrentUserAction } from "@/app/(features)/_shared/actions/auth-actions"
import { CopilotAgent } from "./_components/agent/CopilotAgent"

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserAction()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {user && (
        <CopilotAgent
          userId={user.id?.toString() || ""}
          userRole={(user.role as 'admin' | 'sales' | 'warehouse') || 'admin'}
        >
          <main>{children}</main>
        </CopilotAgent>
      )}
    </div>
  )
}
