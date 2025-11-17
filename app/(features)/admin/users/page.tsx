import { UserList } from "./components/UserList"
import { CreateUserButton } from "./components/CreateUserButton"

async function getUsers() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/users`, {
    cache: "no-store",
  })

  if (!response.ok) {
    return []
  }

  return response.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage admin users and their permissions
            </p>
          </div>
          <CreateUserButton />
        </div>

        {/* User List */}
        <UserList initialUsers={users} />
      </div>
    </div>
  )
}
