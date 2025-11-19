import { LoginForm } from "./_components/LoginForm"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function LoginPage() {
  // Check if user is already logged in
  const cookieStore = await cookies()
  const userId = cookieStore.get("admin_user_id")?.value

  if (userId) {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Hải sản Ngày Mới
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Admin Dashboard
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>© 2025 Hải sản Ngày Mới - Cô Tô</p>
          </div>
        </div>
      </div>
    </div>
  )
}
