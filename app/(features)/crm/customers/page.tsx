import { getAllCustomersUseCase } from "@/app/api/customers/depends"
import { CustomerList } from "./_components/CustomerList"

// Enable ISR with 60 second revalidation
export const revalidate = 60

export default async function CustomersPage() {
  // Get customers using injected use case
  const useCase = await getAllCustomersUseCase()
  const result = await useCase.execute({})

  // Serialize to plain objects (convert Date objects)
  const customers = JSON.parse(JSON.stringify(result.customers))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Customer Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage customers from Zalo, Facebook, and Telegram
          </p>
        </div>

        {/* Customer List */}
        <CustomerList initialCustomers={customers} />
      </div>
    </div>
  )
}
