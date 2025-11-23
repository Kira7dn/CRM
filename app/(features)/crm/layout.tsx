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
    </div>
  )
}
