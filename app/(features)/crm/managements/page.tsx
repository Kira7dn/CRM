import { cookies } from "next/headers"
import { CustomizableDashboard } from "./_components/dashboard/CustomizableDashboard"
import { mapWidgetsFromConfig } from "./_components/dashboard/widgetMapper"
import widgetsConfig from "./_components/dashboard/widgets.json"

// Enable ISR with 5 minute revalidation
export const revalidate = 300

export default async function DashboardPage() {
  // Auth already checked in layout - just get user info from cookies
  const cookieStore = await cookies()
  const userRole = cookieStore.get("admin_user_role")?.value || "admin"

  // Simplified user object (full user already validated in layout)
  const user = { name: "Admin", role: userRole }

  // if (!stats) {
  //   return (
  //     <div className="p-4 md:p-6">
  //       <div className="max-w-7xl mx-auto">
  //         <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // // Load widgets from JSON configuration and map to components
  // const widgets = mapWidgetsFromConfig(widgetsConfig, stats)

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name || "Admin"}!
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Role: <span className="font-semibold capitalize">{user?.role}</span>
          </p>
        </div>
        {/* <CustomizableDashboard widgets={widgets} /> */}
      </div>
    </div>
  )
}
