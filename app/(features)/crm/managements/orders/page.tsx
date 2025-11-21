import { getOrdersUseCase } from "@/app/api/orders/depends"
import { OrderList } from "./_components/OrderList"

export default async function OrdersPage() {
  // Get orders using injected use case
  const useCase = await getOrdersUseCase()
  const result = await useCase.execute({})

  // Serialize to plain objects (convert Date objects)
  const orders = JSON.parse(JSON.stringify(result.orders))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Order Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage customer orders with payment status
          </p>
        </div>

        {/* Order List */}
        <OrderList initialOrders={orders} />
      </div>
    </div>
  )
}
