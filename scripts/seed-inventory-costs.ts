import { ProductRepository } from "../infrastructure/repositories/product-repo"
import { InventoryRepository } from "../infrastructure/repositories/inventory-repo"
import { OperationalCostRepository } from "../infrastructure/repositories/operational-cost-repo"
import clientPromise from "@/infrastructure/db/mongo"

/**
 * Seed script to add sample inventory and cost data
 * Run with: npx tsx --env-file=.env.local scripts/seed-inventory-costs.ts
 */
async function seedInventoryAndCosts() {
  console.log("🌱 Starting inventory and costs seeding...")

  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB)

    // Repositories
    const productRepo = new ProductRepository()
    const inventoryRepo = new InventoryRepository()
    const costRepo = new OperationalCostRepository()

    // 1. Add cost data to existing products
    console.log("\n📦 Adding cost data to products...")
    const products = await productRepo.getAll()

    for (const product of products) {
      // Add cost as 40-60% of selling price (typical margin)
      const costRatio = 0.4 + Math.random() * 0.2 // 40-60%
      const cost = Math.round(product.price * costRatio)

      await productRepo.update({
        id: product.id,
        cost,
      })

      console.log(`   ✓ ${product.name}: ${product.price} VND (cost: ${cost} VND, margin: ${((1 - costRatio) * 100).toFixed(1)}%)`)
    }

    // 2. Create inventory records for all products
    console.log("\n📊 Creating inventory records...")
    for (const product of products) {
      // Check if inventory already exists
      const existing = await inventoryRepo.getByProductId(product.id)
      if (existing) {
        console.log(`   ⏭️  ${product.name}: Already has inventory`)
        continue
      }

      // Random stock levels
      const currentStock = Math.floor(Math.random() * 200) + 50 // 50-250 units
      const reservedStock = Math.floor(Math.random() * 20) // 0-20 reserved
      const reorderPoint = 30
      const reorderQuantity = 100

      await inventoryRepo.create({
        productId: product.id,
        currentStock,
        reservedStock,
        availableStock: currentStock - reservedStock,
        reorderPoint,
        reorderQuantity,
        status: currentStock > reorderPoint ? "in_stock" : "low_stock",
        movements: [
          {
            type: "in",
            quantity: currentStock,
            reason: "Initial stock",
            timestamp: new Date(),
          },
        ],
        lastRestockedAt: new Date(),
      })

      console.log(`   ✓ ${product.name}: ${currentStock} units (${currentStock - reservedStock} available)`)
    }

    // 3. Add sample operational costs
    console.log("\n💰 Adding sample operational costs...")

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const sampleCosts = [
      // Fixed costs
      {
        category: "rent" as const,
        type: "fixed" as const,
        amount: 10000000, // 10M VND/month
        description: "Office rent",
        date: monthStart,
      },
      {
        category: "utilities" as const,
        type: "fixed" as const,
        amount: 2000000, // 2M VND/month
        description: "Electricity and water",
        date: monthStart,
      },
      {
        category: "staff_salary" as const,
        type: "fixed" as const,
        amount: 50000000, // 50M VND/month
        description: "Staff salaries",
        date: monthStart,
      },
      // Variable costs
      {
        category: "shipping" as const,
        type: "variable" as const,
        amount: 500000, // 500K VND
        description: "Daily shipping costs",
        date: now,
      },
      {
        category: "packaging" as const,
        type: "variable" as const,
        amount: 300000, // 300K VND
        description: "Packaging materials",
        date: now,
      },
      {
        category: "marketing" as const,
        type: "variable" as const,
        amount: 5000000, // 5M VND
        description: "Facebook Ads campaign",
        date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        category: "order_processing" as const,
        type: "variable" as const,
        amount: 200000, // 200K VND
        description: "Payment gateway fees",
        date: now,
      },
    ]

    for (const costData of sampleCosts) {
      await costRepo.create(costData)
      console.log(`   ✓ ${costData.category}: ${costData.amount.toLocaleString()} VND (${costData.type})`)
    }

    console.log("\n✅ Seeding completed successfully!")
    console.log("\n📈 Summary:")
    console.log(`   - Products updated with costs: ${products.length}`)
    console.log(`   - Inventory records created: ${products.length}`)
    console.log(`   - Operational costs added: ${sampleCosts.length}`)

    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error seeding data:", error)
    process.exit(1)
  }
}

// Run the seed function
seedInventoryAndCosts()
