import { redirect } from "next/navigation"
import { getCurrentUserAction } from "../_shared/actions/auth-actions"
import { AdminHeader } from "./_components/AdminHeader"
import { Toaster } from "@shared/ui/sonner"

export default async function FeaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUserAction()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader userName={user?.name} userRole={user?.role} />
      <main>{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  )
}
