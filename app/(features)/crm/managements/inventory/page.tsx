import { getAllInventorySummariesAction, getInventoryAction } from "./actions"
import { getProductsAction } from "../products/actions"
import { InventoryList } from "./_components/InventoryList"

export default async function InventoryPage() {
  // Fetch summaries, movements, and products
  const [summaries, movements, products] = await Promise.all([
    getAllInventorySummariesAction(),
    getInventoryAction(),
    getProductsAction()
  ])

  // Serialize to plain objects (convert Date objects)
  const serializedSummaries = JSON.parse(JSON.stringify(summaries))
  const serializedMovements = JSON.parse(JSON.stringify(movements))
  const serializedProducts = JSON.parse(JSON.stringify(products))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor stock levels, track movements, and manage product inventory
          </p>
        </div>

        {/* Inventory List */}
        <InventoryList
          initialInventory={serializedSummaries}
          initialMovements={serializedMovements}
          products={serializedProducts}
        />
      </div>
    </div>
  )
}
