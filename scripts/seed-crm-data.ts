/**
 * Comprehensive CRM data seeding script
 * Seeds inventory (with cost), operational costs, customers, and orders
 * Ensures proper referential integrity across all entities
 *
 * Run with: npx tsx --env-file=.env scripts/seed-crm-data.ts [customers] [orders]
 * Example: npx tsx --env-file=.env scripts/seed-crm-data.ts 100 200
 * Default: 100 customers, 200 orders
 *
 * This script will:
 * 1. Load existing products from database
 * 2. Create inventory records with cost data for all products
 * 3. Seed operational costs (rent, utilities, salaries, etc.)
 * 4. Create customer records with Vietnamese names and addresses
 * 5. Generate orders for customers using existing products
 */

import { readFileSync } from "fs"
import { join } from "path"
import { ObjectId } from "mongodb"
import { CustomerRepository } from "../infrastructure/repositories/customer-repo"
import { OrderRepository } from "../infrastructure/repositories/order-repo"
import { ProductRepository } from "../infrastructure/repositories/product-repo"
import { InventoryRepository } from "../infrastructure/repositories/inventory-repo"
import { InventoryConfigRepository } from "../infrastructure/repositories/inventory-config-repo"
import { OperationalCostRepository } from "../infrastructure/repositories/operational-cost-repo"
import type { CustomerSource } from "../core/domain/customers/customer"
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingProvider,
  OrderItem
} from "../core/domain/managements/order"
import type { Product } from "../core/domain/managements/product"
import type { Customer } from "../core/domain/customers/customer"

// ============================================================================
// SHARED DATA & CONSTANTS
// ============================================================================

// Vietnamese names for realistic data
const firstNames = [
  "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng",
  "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"
]

const middleNames = [
  "Văn", "Thị", "Đức", "Minh", "Hồng", "Quốc", "Thanh", "Anh", "Thu", "Xuân",
  "Hải", "Phương", "Bảo", "Kim", "Ngọc"
]

const lastNames = [
  "Anh", "Hùng", "Linh", "Mai", "Hoa", "Long", "Tú", "Dũng", "Phúc", "Thảo",
  "Ngân", "Lan", "Hương", "Tâm", "Quyên", "Hạnh", "Trinh", "Phong", "Tuấn", "Nam"
]

const cities = [
  "Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Quảng Ninh",
  "Bình Dương", "Đồng Nai", "Khánh Hòa", "Lâm Đồng", "Nghệ An", "Thái Nguyên"
]

const districts = [
  "Quận 1", "Quận 2", "Quận 3", "Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Hải Châu",
  "Sơn Trà", "Hồng Bàng", "Ninh Kiều", "Bình Thạnh", "Thủ Đức"
]

const streets = [
  "Lê Lợi", "Trần Hưng Đạo", "Nguyễn Huệ", "Hai Bà Trưng", "Lý Thường Kiệt",
  "Điện Biên Phủ", "Võ Văn Tần", "Cách Mạng Tháng 8", "Phan Đình Phùng", "Hoàng Diệu"
]

// Customer related enums
const customerSources: CustomerSource[] = ["zalo", "facebook", "website", "tiktok", "telegram"]

// Tag pools
const customerTagPool = [
  "high-value", "frequent-buyer", "wholesale", "retail", "seafood-lover",
  "bulk-order", "seasonal-buyer", "vip-member", "corporate", "individual"
]

const orderTagPool = [
  "wholesale", "retail", "gift", "bulk-order", "repeat-customer",
  "first-time", "seasonal", "promotion", "urgent", "corporate"
]

// ============================================================================
// SHARED HELPER FUNCTIONS
// ============================================================================

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// ============================================================================
// CUSTOMER DATA & GENERATORS
// ============================================================================


function generateVietnameseName(): string {
  const firstName = randomItem(firstNames)
  const middleName = randomItem(middleNames)
  const lastName = randomItem(lastNames)
  return `${firstName} ${middleName} ${lastName}`
}

function generatePhone(): string {
  const prefixes = ['090', '091', '093', '094', '096', '097', '098', '099', '086', '088']
  const prefix = randomItem(prefixes)
  const suffix = randomInt(1000000, 9999999)
  return `${prefix}${suffix}`
}

function generateEmail(name: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com']
  const cleanName = name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '')
  const random = randomInt(100, 999)
  return `${cleanName}${random}@${randomItem(domains)}`
}

function generateAddress(): string {
  const streetNum = randomInt(1, 999)
  const street = randomItem(streets)
  const district = randomItem(districts)
  const city = randomItem(cities)
  return `${streetNum} ${street}, ${district}, ${city}`
}

function generatePlatformId(): string {
  return `${Date.now()}_${randomInt(10000, 99999)}`
}

function generateCustomerTags(): string[] {
  const count = randomInt(0, 3)
  const tags: string[] = []
  const availableTags = [...customerTagPool] // Create a copy to avoid modifying the original

  for (let i = 0; i < count && availableTags.length > 0; i++) {
    const randomIndex = randomInt(0, availableTags.length - 1)
    const tag = availableTags.splice(randomIndex, 1)[0]
    tags.push(tag)
  }

  return tags
}

// ============================================================================
// ORDER DATA & GENERATORS
// ============================================================================

const orderStatuses: OrderStatus[] = [
  "pending", "confirmed", "processing", "shipping",
  "delivered", "completed", "cancelled"
]

const paymentMethods: PaymentMethod[] = [
  "cod", "bank_transfer", "vnpay", "zalopay", "momo"
]

const shippingProviders: ShippingProvider[] = [
  "ghn", "ghtk", "vnpost", "self_delivery"
]


function getStatusDistribution(): OrderStatus {
  const rand = Math.random()
  if (rand < 0.05) return "pending"         // 5%
  else if (rand < 0.10) return "confirmed"  // 5%
  else if (rand < 0.15) return "processing" // 5%
  else if (rand < 0.25) return "shipping"   // 10%
  else if (rand < 0.40) return "delivered"  // 15%
  else if (rand < 0.85) return "completed"  // 45%
  else return "cancelled"                    // 15%
}

function getPaymentStatus(orderStatus: OrderStatus): PaymentStatus {
  if (orderStatus === "cancelled") {
    return Math.random() > 0.5 ? "failed" : "pending"
  }
  if (["pending", "confirmed"].includes(orderStatus)) {
    return "pending"
  }
  return "success"
}

function generateOrderTimestamps(status: OrderStatus, createdAt: Date) {
  const timestamps: Record<string, Date | undefined> = {
    createdAt,
    updatedAt: createdAt
  }

  let current = new Date(createdAt)

  if (["confirmed", "processing", "shipping", "delivered", "completed"].includes(status)) {
    current = new Date(current.getTime() + randomInt(1, 24) * 60 * 60 * 1000) // 1-24h later
    timestamps.confirmedAt = current
  }

  if (["processing", "shipping", "delivered", "completed"].includes(status)) {
    current = new Date(current.getTime() + randomInt(2, 48) * 60 * 60 * 1000) // 2-48h later
    timestamps.processingAt = current
  }

  if (["shipping", "delivered", "completed"].includes(status)) {
    current = new Date(current.getTime() + randomInt(12, 72) * 60 * 60 * 1000) // 12-72h later
    timestamps.shippingAt = current
  }

  if (["delivered", "completed"].includes(status)) {
    current = new Date(current.getTime() + randomInt(24, 120) * 60 * 60 * 1000) // 1-5 days later
    timestamps.deliveredAt = current
  }

  if (status === "completed") {
    current = new Date(current.getTime() + randomInt(1, 48) * 60 * 60 * 1000) // 1-2 days later
    timestamps.completedAt = current
  }

  if (status === "cancelled") {
    current = new Date(current.getTime() + randomInt(1, 72) * 60 * 60 * 1000)
    timestamps.cancelledAt = current
  }

  timestamps.updatedAt = current

  return timestamps
}

function generateOrderTags(): string[] {
  const count = randomInt(0, 3)
  const tags: string[] = []
  const availableTags = [...orderTagPool] // Create a copy to avoid modifying the original

  for (let i = 0; i < count && availableTags.length > 0; i++) {
    const randomIndex = randomInt(0, availableTags.length - 1)
    const tag = availableTags.splice(randomIndex, 1)[0]
    tags.push(tag)
  }

  return tags
}

// ============================================================================
// MAIN SEEDING FUNCTIONS
// ============================================================================

/**
 * Load and validate products from JSON file
 */
async function loadProducts(): Promise<Product[]> {
  console.log("📥 Loading products from JSON file...")

  try {
    const productRepo = new ProductRepository()

    // First check if products exist in database
    const existingProducts = await productRepo.getAll()

    if (existingProducts.length > 0) {
      console.log(`✅ Found ${existingProducts.length} products in database`)
      return existingProducts
    }

    // If no products in database, try loading from JSON file
    console.log("⚠️  No products in database, attempting to load from JSON file...")
    const productJsonPath = join(__dirname, "seeds", "crm_db.products.json")
    const fileContent = readFileSync(productJsonPath, "utf-8")
    const products = JSON.parse(fileContent) as Product[]

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("Invalid product data: expected non-empty array")
    }

    console.log(`✅ Loaded ${products.length} products from JSON file`)
    return products
  } catch (error) {
    console.error("❌ Failed to load products:", error instanceof Error ? error.message : error)
    throw new Error("Cannot proceed without product data. Please ensure products exist in database or JSON file.")
  }
}

/**
 * Check if customer already exists by phone or email (idempotency)
 */
async function customerExists(repo: CustomerRepository, phone: string, email?: string): Promise<boolean> {
  try {
    const customers = await repo.getAll()
    return customers.some(c =>
      c.phone === phone || (email && c.email === email)
    )
  } catch (error) {
    console.error("❌ Error checking customer existence:", error)
    return false
  }
}

/**
 * Seed customers with idempotency checks
 */
async function seedCustomers(count: number): Promise<Customer[]> {
  console.log(`\n🌱 Seeding ${count} customers...`)

  const repo = new CustomerRepository()
  const createdCustomers: Customer[] = []
  let created = 0
  let skipped = 0

  for (let i = 0; i < count; i++) {
    const name = generateVietnameseName()
    const phone = generatePhone()
    const email = Math.random() > 0.3 ? generateEmail(name) : undefined // 70% have email

    // Check if customer already exists (idempotency)
    if (await customerExists(repo, phone, email)) {
      console.log(`⏭️  Customer with phone ${phone} already exists, skipping...`)
      skipped++
      continue
    }

    const primarySource = randomItem(customerSources)

    // Generate platform IDs (1-3 platforms per customer)
    const platformCount = randomInt(1, 3)
    const platformIds = []
    const usedPlatforms = new Set<CustomerSource>()

    // Always include primary source
    platformIds.push({
      platform: primarySource,
      platformUserId: generatePlatformId()
    })
    usedPlatforms.add(primarySource)

    // Add additional platforms
    for (let j = 1; j < platformCount; j++) {
      let platform = randomItem(customerSources)
      while (usedPlatforms.has(platform)) {
        platform = randomItem(customerSources)
      }
      platformIds.push({
        platform,
        platformUserId: generatePlatformId()
      })
      usedPlatforms.add(platform)
    }

    try {
      const customer = await repo.create({
        id: new ObjectId().toString(),
        name,
        phone,
        email,
        address: Math.random() > 0.4 ? generateAddress() : undefined, // 60% have address
        platformIds,
        primarySource,
        tags: generateCustomerTags(),
        notes: Math.random() > 0.8 ? "Generated test customer" : undefined, // 20% have notes
      })

      createdCustomers.push(customer)
      created++

      if ((i + 1) % 10 === 0) {
        console.log(`📝 Created ${created}/${count} customers...`)
      }
    } catch (error) {
      console.error(`❌ Failed to create customer ${i + 1}:`, error instanceof Error ? error.message : error)
      skipped++
    }
  }

  console.log("\n✅ Customer seeding complete!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`✅ Created: ${created}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

  return createdCustomers
}

/**
 * Seed orders based on existing customers and products
 */
async function seedOrders(count: number, customers: Customer[], products: Product[]): Promise<void> {
  console.log(`\n🌱 Seeding ${count} orders...`)

  if (customers.length === 0) {
    console.error("❌ No customers available! Cannot create orders without customers.")
    return
  }

  if (products.length === 0) {
    console.error("❌ No products available! Cannot create orders without products.")
    return
  }

  const orderRepo = new OrderRepository()
  let created = 0
  let skipped = 0

  // Generate orders over the past 6 months
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const now = new Date()

  for (let i = 0; i < count; i++) {
    try {
      const customer = randomItem(customers)
      const status = getStatusDistribution()
      const paymentMethod = randomItem(paymentMethods)
      const paymentStatus = getPaymentStatus(status)

      // Generate 1-5 items per order
      const itemCount = randomInt(1, 5)
      const items: OrderItem[] = []
      let subtotal = 0

      for (let j = 0; j < itemCount; j++) {
        const product = randomItem(products)
        const quantity = randomInt(1, 10)
        const unitPrice = product.price
        const totalPrice = unitPrice * quantity

        items.push({
          productId: product.id.toString(),
          productName: product.name,
          productImage: product.image,
          quantity,
          unitPrice,
          totalPrice
        })

        subtotal += totalPrice
      }

      // Calculate pricing
      const shippingFee = randomInt(20000, 50000) // 20k-50k VND
      const discount = Math.random() > 0.7 ? randomInt(10000, 100000) : 0 // 30% have discount
      const total = subtotal + shippingFee - discount

      // Generate timestamps
      const createdAt = randomDate(sixMonthsAgo, now)
      const timestamps = generateOrderTimestamps(status, createdAt)

      // Payment info
      const payment = {
        method: paymentMethod,
        status: paymentStatus,
        amount: total,
        transactionId: paymentStatus === "success" ? `TXN${Date.now()}${randomInt(1000, 9999)}` : undefined,
        paidAt: paymentStatus === "success" ? timestamps.confirmedAt : undefined
      }

      // Delivery info
      const delivery = {
        name: customer.name || "Unknown",
        phone: customer.phone || "0901234567",
        address: customer.address || "Địa chỉ không có sẵn",
        shippingProvider: randomItem(shippingProviders),
        trackingNumber: ["shipping", "delivered", "completed"].includes(status)
          ? `TRK${randomInt(100000000, 999999999)}`
          : undefined,
        estimatedDelivery: status === "shipping"
          ? new Date(Date.now() + randomInt(1, 5) * 24 * 60 * 60 * 1000)
          : undefined,
        actualDelivery: timestamps.deliveredAt
      }

      await orderRepo.create({
        customerId: customer.id,
        status,
        items,
        delivery,
        subtotal,
        shippingFee,
        discount,
        total,
        payment,
        tags: generateOrderTags(),
        note: Math.random() > 0.8 ? "Generated test order" : undefined,
        platformSource: customer.primarySource,
        ...timestamps
      })

      created++

      if ((i + 1) % 20 === 0) {
        console.log(`📝 Created ${i + 1}/${count} orders...`)
      }
    } catch (error) {
      console.error(`❌ Failed to create order ${i + 1}:`, error instanceof Error ? error.message : error)
      skipped++
    }
  }

  console.log("\n✅ Order seeding complete!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`✅ Created: ${created}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("\n📊 Order Distribution:")
  console.log("  • Pending: ~5%")
  console.log("  • Confirmed: ~5%")
  console.log("  • Processing: ~5%")
  console.log("  • Shipping: ~10%")
  console.log("  • Delivered: ~15%")
  console.log("  • Completed: ~45%")
  console.log("  • Cancelled: ~15%")
}

/**
 * Seed inventory records with cost data for all products
 */
async function seedInventory(products: Product[], defaultStock: number = 50): Promise<void> {
  console.log(`\n🌱 Seeding inventory for ${products.length} products...`)

  const inventoryRepo = new InventoryRepository()
  const configRepo = new InventoryConfigRepository()
  let createdMovements = 0
  let createdConfigs = 0
  let skipped = 0

  for (const product of products) {
    try {
      // Check if inventory already exists
      // const existing = await inventoryRepo.getByProductId(product.id)
      // if (existing && existing.length > 0) {
      //   console.log(`⏭️  Inventory for ${product.name} already exists`)
      //   skipped++
      //   continue
      // }

      // Add cost as 40-60% of selling price (typical margin)
      const costRatio = 0.4 + Math.random() * 0.2 // 40-60%
      const cost = Math.round(product.price * costRatio)

      // Generate initial stock data
      const initialStock = Math.floor(Math.random() * (defaultStock * 2)) + defaultStock // defaultStock to defaultStock*3 units
      const reorderPoint = Math.floor(Math.random() * 30) + 20 // 20-50 units
      const reorderQuantity = Math.floor(Math.random() * 100) + 50 // 50-150 units

      // Create inventory configuration
      const existingConfig = await configRepo.getByProductId(product.id)
      if (!existingConfig) {
        await configRepo.create({
          productId: product.id,
          reorderPoint,
          reorderQuantity,
        })
        createdConfigs++
      }

      // Create initial stock movement (stock in)
      await inventoryRepo.create({
        productId: product.id,
        type: "in",
        quantity: initialStock,
        unitCost: cost,
        referenceOrderId: undefined,
        reason: "Initial stock - Nhập hàng ban đầu",
        performedBy: "system",
        notes: `Initial inventory setup with ${initialStock} units at ${cost.toLocaleString()} VND/unit`,
        createdAt: new Date()
      })
      createdMovements++

      // Randomly create some stock movements to simulate history
      const movementCount = Math.floor(Math.random() * 3) // 0-2 additional movements
      for (let i = 0; i < movementCount; i++) {
        const movementType = Math.random() > 0.5 ? "in" : "out"
        const quantity = Math.floor(Math.random() * 20) + 5 // 5-25 units
        const daysAgo = Math.floor(Math.random() * 30) + 1 // 1-30 days ago
        const movementDate = new Date()
        movementDate.setDate(movementDate.getDate() - daysAgo)

        await inventoryRepo.create({
          productId: product.id,
          type: movementType,
          quantity,
          unitCost: cost,
          reason: movementType === "in" ? "Nhập thêm hàng" : "Xuất hàng bán",
          performedBy: "system",
          notes: `${movementType === "in" ? "Stock in" : "Stock out"} simulation`,
          createdAt: movementDate
        })
        createdMovements++
      }

      if (createdMovements % 10 === 0) {
        console.log(`📝 Created ${createdMovements} movements for ${createdConfigs} products...`)
      }
    } catch (error) {
      console.error(`❌ Failed to create inventory for product ${product.id}:`, error instanceof Error ? error.message : error)
      skipped++
    }
  }

  console.log("\n✅ Inventory seeding complete!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`✅ Stock movements created: ${createdMovements}`)
  console.log(`✅ Inventory configs created: ${createdConfigs}`)
  console.log(`⏭️  Skipped: ${skipped}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

/**
 * Seed operational costs
 */
async function seedOperationalCosts(): Promise<void> {
  console.log("\n🌱 Seeding operational costs...")

  const costRepo = new OperationalCostRepository()
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

  let created = 0
  for (const costData of sampleCosts) {
    try {
      await costRepo.create(costData)
      created++
      console.log(`   ✓ ${costData.category}: ${costData.amount.toLocaleString()} VND (${costData.type})`)
    } catch (error) {
      console.error(`❌ Failed to create cost ${costData.category}:`, error instanceof Error ? error.message : error)
    }
  }

  console.log("\n✅ Operational costs seeding complete!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log(`✅ Created: ${created}/${sampleCosts.length}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
}

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

interface SeedOptions {
  seedInventory: boolean;
  seedCosts: boolean;
  seedCustomers: boolean;
  seedOrders: boolean;
  customerCount: number;
  orderCount: number;
  inventoryCount: number;
}

// Parse command line arguments
const parseArguments = (): SeedOptions => {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    seedInventory: args.includes('--inventory') || args.includes('-i'),
    seedCosts: args.includes('--costs') || args.includes('-c'),
    seedCustomers: args.includes('--customers') || args.includes('-u'),
    seedOrders: args.includes('--orders') || args.includes('-o'),
    customerCount: 100,    // Default values
    orderCount: 200,       // Default values
    inventoryCount: 50     // Default inventory count per product
  };

  // Check for --help or -h flag
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Seed CRM Data - Usage:
  npx tsx --env-file=.env scripts/seed-crm-data.ts [options] [customerCount] [orderCount] [inventoryCount]

Options:
  -i, --inventory    Seed inventory data
  -c, --costs        Seed operational costs
  -u, --customers    Seed customers
  -o, --orders       Seed orders
  --inventory-count  Set initial stock quantity for each product (overrides inventoryCount parameter)
  -h, --help         Show this help message

Examples:
  # Seed all data with default counts (100 customers, 200 orders, 50 inventory per product)
  npx tsx --env-file=.env scripts/seed-crm-data.ts

  # Seed only inventory with custom count
  npx tsx --env-file=.env scripts/seed-crm-data.ts -i --inventory-count 100

  # Seed customers and orders with custom counts
  npx tsx --env-file=.env scripts/seed-crm-data.ts -u -o 50 100
`);
    process.exit(0);
  }

  // If no specific flags are provided, seed everything
  if (!options.seedInventory && !options.seedCosts &&
    !options.seedCustomers && !options.seedOrders) {
    options.seedInventory = true;
    options.seedCosts = true;
    options.seedCustomers = true;
    options.seedOrders = true;
  }

  // Parse counts if provided
  const countArgs = args.filter(arg => /^\d+$/.test(arg));
  if (countArgs.length >= 1) {
    // First number is customer count
    options.customerCount = Math.max(1, parseInt(countArgs[0], 10)) || 100;

    // Second number is order count
    if (countArgs.length >= 2) {
      options.orderCount = Math.max(1, parseInt(countArgs[1], 10)) || 200;

      // Third number is inventory count per product
      if (countArgs.length >= 3) {
        options.inventoryCount = Math.max(1, parseInt(countArgs[2], 10)) || 50;
      }
    }
  }

  // Check for --inventory-count flag
  const inventoryCountIndex = args.findIndex(arg => arg === '--inventory-count');
  if (inventoryCountIndex !== -1 && args[inventoryCountIndex + 1]) {
    const count = parseInt(args[inventoryCountIndex + 1], 10);
    if (!isNaN(count) && count > 0) {
      options.inventoryCount = count;
    }
  }

  return options;
};

async function seedCRMData(options: SeedOptions) {
  console.log("═══════════════════════════════════════════════════════");
  console.log("🌱 CRM Data Seeding Script - Selected Options");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`📊 Configuration:`);
  console.log(`   • Seed Inventory: ${options.seedInventory ? `✅ (${options.inventoryCount} units)` : '❌'}`);
  console.log(`   • Seed Operational Costs: ${options.seedCosts ? '✅' : '❌'}`);
  console.log(`   • Seed Customers: ${options.seedCustomers ? `✅ (${options.customerCount})` : '❌'}`);
  console.log(`   • Seed Orders: ${options.seedOrders ? `✅ (${options.orderCount})` : '❌'}`);
  console.log("═══════════════════════════════════════════════════════");

  try {
    // Always load products as they're needed for inventory and orders
    const products = await loadProducts();

    // Seed inventory if requested
    if (options.seedInventory) {
      await seedInventory(products, options.inventoryCount);
    }

    // Seed operational costs if requested
    if (options.seedCosts) {
      await seedOperationalCosts();
    }

    // Seed customers if requested
    let customers: Customer[] = [];
    if (options.seedCustomers) {
      customers = await seedCustomers(options.customerCount);
    }

    // Seed orders if requested (only if we have customers)
    if (options.seedOrders) {
      if (customers.length === 0 && options.seedCustomers) {
        console.log("⚠️  No customers were created, cannot create orders.");
      } else if (customers.length === 0) {
        console.log("⚠️  No customers available. Use --customers flag to create customers first.");
      } else {
        await seedOrders(options.orderCount, customers, products);
      }
    }

    console.log("\n✨ Seeding complete!");
    console.log("═══════════════════════════════════════════════════════");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error instanceof Error ? error.message : error);
    throw error;
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

// Get options from command line
const options = parseArguments();

// Display help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log("\n📝 Usage:");
  console.log("  npx tsx --env-file=.env scripts/seed-crm-data.ts [options] [customerCount] [orderCount]");
  console.log("\n🔧 Options:");
  console.log("  -i, --inventory    Seed inventory data");
  console.log("  -c, --costs        Seed operational costs");
  console.log("  -u, --customers    Seed customers");
  console.log("  -o, --orders       Seed orders");
  console.log("  -h, --help         Show this help message");
  console.log("\n📌 Examples:");
  console.log("  # Seed everything (default: 100 customers, 200 orders)");
  console.log("  npx tsx --env-file=.env scripts/seed-crm-data.ts");
  console.log("  ");
  console.log("  # Seed specific components");
  console.log("  npx tsx --env-file=.env scripts/seed-crm-data.ts --inventory --customers");
  console.log("  ");
  console.log("  # Specify counts");
  console.log("  npx tsx --env-file=.env scripts/seed-crm-data.ts --customers --orders 50 200 100");
  console.log("  # ^ Creates 50 customers, 200 orders, and 100 initial stock per product");
  process.exit(0);
}

// Run the seeding process
seedCRMData(options)
  .then(() => {
    console.log("✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
