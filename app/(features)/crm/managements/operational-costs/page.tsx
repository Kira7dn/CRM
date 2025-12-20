import { CostList } from "./_components/CostList"

export default async function OperationalCostsPage() {

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Operational Cost Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage business operational expenses by category
          </p>
        </div>

        {/* Cost List */}
        {/* <CostList initialCosts={serializedCosts} /> */}
      </div>
    </div>
  )
}
