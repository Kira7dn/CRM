import { getCurrentUserAction } from "../../../_shared/actions/auth-actions"
import { AdminHeader } from "../../../_shared/components/AdminHeader"


interface AdminLayoutProps {
  children: React.ReactNode
}

export async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUserAction()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={user?.name} userRole={user?.role} />
      {children}
    </div>
  )
}
