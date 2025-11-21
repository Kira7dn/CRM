import { redirect } from "next/navigation"
import { getCurrentUserAction } from "../_shared/actions/auth-actions"

export default async function UsersPage() {
    // Get users using injected use case
    const user = await getCurrentUserAction()
    // Add Users nav only for admins
    if (user?.role === "admin") {
        // navigate to Dashboard
        redirect("/crm/managements")
    }
    if (user?.role === "sale") {
        redirect("/crm/managements/orders")
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome, {user?.name || "Admin"}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Role: <span className="font-semibold capitalize">{user?.role}</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
