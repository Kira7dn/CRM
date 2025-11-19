import { UserList } from "./_components/UserList"
import { CreateUserButton } from "./_components/CreateUserButton"
import { createGetAllUsersUseCase } from "@/app/api/auth/depends"

export default async function UsersPage() {
  // Get users using injected use case
  const useCase = await createGetAllUsersUseCase()
  const result = await useCase.execute({})

  // Serialize users to plain objects (convert ObjectId, Date, etc.)
  const users = JSON.parse(JSON.stringify(result.users))

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
