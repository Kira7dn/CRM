/**
 * Comprehensive CRM data seeding script
 * Merges customer and order seeding with proper referential integrity
 *
 * Run with: npx tsx --env-file=.env scripts/seed-crm-data.ts [customers] [orders]
 * Example: npx tsx --env-file=.env scripts/seed-crm-data.ts 100 200
 * Default: 100 customers, 200 orders
 */

import { readFileSync } from "fs"
import { join } from "path"
import { ObjectId } from "mongodb"
import { CustomerRepository } from "../infrastructure/repositories/customer-repo"
import { OrderRepository } from "../infrastructure/repositories/order-repo"
import { ProductRepository } from "../infrastructure/repositories/product-repo"
import type { CustomerSource, CustomerTier, CustomerStatus } from "../core/domain/managements/customer"
import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingProvider,
  OrderItem
} from "../core/domain/managements/order"
import type { Product } from "../core/domain/managements/product"
import type { Customer } from "../core/domain/managements/customer"

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

const customerSources: CustomerSource[] = ["zalo", "facebook", "website", "tiktok", "telegram"]
const customerTiers: CustomerTier[] = ["new", "regular", "vip", "premium"]
const customerStatuses: CustomerStatus[] = ["active", "inactive"]

const customerTagPool = [
  "high-value", "frequent-buyer", "wholesale", "retail", "seafood-lover",
  "bulk-order", "seasonal-buyer", "vip-member", "corporate", "individual"
]

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
  for (let i = 0; i < count; i++) {
    const tag = randomItem(customerTagPool)
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
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

const orderTagPool = [
  "wholesale", "retail", "gift", "bulk-order", "repeat-customer",
  "first-time", "seasonal", "promotion", "urgent", "corporate"
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
  for (let i = 0; i < count; i++) {
    const tag = randomItem(orderTagPool)
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
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

    // Tier distribution: 50% new, 30% regular, 15% vip, 5% premium
    const tierRand = Math.random()
    let tier: CustomerTier
    if (tierRand < 0.5) tier = "new"
    else if (tierRand < 0.8) tier = "regular"
    else if (tierRand < 0.95) tier = "vip"
    else tier = "premium"

    const status = Math.random() > 0.1 ? "active" : "inactive" // 90% active

    try {
      const customer = await repo.create({
        id: new ObjectId().toString(),
        name,
        phone,
        email,
        address: Math.random() > 0.4 ? generateAddress() : undefined, // 60% have address
        platformIds,
        primarySource,
        tier,
        status,
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

// ============================================================================
// MAIN ORCHESTRATION
// ============================================================================

async function seedCRMData(customerCount: number, orderCount: number) {
  console.log("═══════════════════════════════════════════════════════")
  console.log("🌱 CRM Data Seeding Script")
  console.log("═══════════════════════════════════════════════════════")
  console.log(`📊 Configuration:`)
  console.log(`   • Customers to create: ${customerCount}`)
  console.log(`   • Orders to create: ${orderCount}`)
  console.log("═══════════════════════════════════════════════════════")

  try {
    // Step 1: Load and validate products
    const products = await loadProducts()

    // Step 2: Seed customers with idempotency
    const customers = await seedCustomers(customerCount)

    // Step 3: Seed orders based on created customers and existing products
    await seedOrders(orderCount, customers, products)

    console.log("\n✨ All seeding complete!")
    console.log("═══════════════════════════════════════════════════════")
    console.log("📊 Summary:")
    console.log(`   • Products available: ${products.length}`)
    console.log(`   • Customers created: ${customers.length}`)
    console.log(`   • Orders created: Check logs above`)
    console.log("═══════════════════════════════════════════════════════")
  } catch (error) {
    console.error("\n❌ Seeding failed:", error instanceof Error ? error.message : error)
    throw error
  }
}

// ============================================================================
// CLI ENTRY POINT
// ============================================================================

// Parse command line arguments
const customerCount = process.argv[2] ? parseInt(process.argv[2], 10) : 100
const orderCount = process.argv[3] ? parseInt(process.argv[3], 10) : 200

if (isNaN(customerCount) || customerCount < 1) {
  console.error("❌ Invalid customer count. Please provide a positive number.")
  console.log("Usage: npx tsx --env-file=.env scripts/seed-crm-data.ts [customers] [orders]")
  console.log("Example: npx tsx --env-file=.env scripts/seed-crm-data.ts 100 200")
  process.exit(1)
}

if (isNaN(orderCount) || orderCount < 1) {
  console.error("❌ Invalid order count. Please provide a positive number.")
  console.log("Usage: npx tsx --env-file=.env scripts/seed-crm-data.ts [customers] [orders]")
  console.log("Example: npx tsx --env-file=.env scripts/seed-crm-data.ts 100 200")
  process.exit(1)
}

seedCRMData(customerCount, orderCount)
  .then(() => {
    console.log("✅ Script completed successfully!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Script failed:", error)
    process.exit(1)
  })
