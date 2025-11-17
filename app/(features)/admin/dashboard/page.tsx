import { cookies } from "next/headers"
import Link from "next/link"

async function getCurrentUser() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("admin_user_id")?.value

  if (!userId) {
    return null
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/me`, {
    headers: {
      Cookie: `admin_user_id=${userId}`,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

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

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Products */}
          <Link href="/admin/products" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Products
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Manage product catalog
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Orders */}
          <Link href="/admin/orders" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Orders
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    View and manage orders
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Customers */}
          <Link href="/admin/customers" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Customers
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Customer database
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Categories */}
          <Link href="/categories" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Categories
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Product categories
                  </p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Banners */}
          <Link href="/admin/banners" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Banners
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Promotional banners
                  </p>
                </div>
                <div className="bg-pink-100 dark:bg-pink-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Posts */}
          <Link href="/posts" className="block">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Posts
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Blog & content
                  </p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          {/* Users - Admin Only */}
          {user?.role === "admin" && (
            <Link href="/admin/users" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1 border-2 border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Users
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Admin only
                    </p>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
