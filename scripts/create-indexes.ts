/**
 * MongoDB Index Creation Script
 * Sprint 7 - Performance Optimization
 *
 * Creates all recommended indexes for optimal query performance.
 * Run: npx tsx scripts/create-indexes.ts
 */

import { MongoClient } from "mongodb";

async function createIndexes() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    console.error("❌ MONGODB_URI and MONGODB_DB must be set in .env.local");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  const client = await MongoClient.connect(uri);
  const db = client.db(dbName);

  console.log("✅ Connected successfully\n");

  try {
    // ==================== ORDERS COLLECTION ====================
    console.log("📦 Creating indexes for 'orders' collection...");
    const orders = db.collection("orders");

    await orders.createIndex(
      { createdAt: -1, status: 1 },
      { name: "idx_created_status" }
    );
    console.log("  ✓ idx_created_status");

    await orders.createIndex(
      { customerId: 1, createdAt: -1 },
      { name: "idx_customer_created" }
    );
    console.log("  ✓ idx_customer_created");

    await orders.createIndex(
      { assignedTo: 1, status: 1, createdAt: -1 },
      { name: "idx_assigned_status_created" }
    );
    console.log("  ✓ idx_assigned_status_created");

    await orders.createIndex(
      { paymentStatus: 1, createdAt: -1 },
      { name: "idx_payment_created" }
    );
    console.log("  ✓ idx_payment_created");

    await orders.createIndex({ status: 1 }, { name: "idx_status" });
    console.log("  ✓ idx_status");

    await orders.createIndex(
      { "utmParams.campaign": 1, createdAt: -1 },
      { name: "idx_campaign_created", sparse: true }
    );
    console.log("  ✓ idx_campaign_created (sparse)");

    await orders.createIndex(
      { "items.productId": 1 },
      { name: "idx_product_items" }
    );
    console.log("  ✓ idx_product_items\n");

    // ==================== CUSTOMERS COLLECTION ====================
    console.log("👥 Creating indexes for 'customers' collection...");
    const customers = db.collection("customers");

    await customers.createIndex(
      { tier: 1, createdAt: -1 },
      { name: "idx_tier_created" }
    );
    console.log("  ✓ idx_tier_created");

    await customers.createIndex(
      { platform: 1, tier: 1 },
      { name: "idx_platform_tier" }
    );
    console.log("  ✓ idx_platform_tier");

    await customers.createIndex({ name: "text" }, { name: "idx_name_text" });
    console.log("  ✓ idx_name_text (text index)");

    await customers.createIndex(
      { phone: 1 },
      { name: "idx_phone", unique: true, sparse: true }
    );
    console.log("  ✓ idx_phone (unique, sparse)");

    await customers.createIndex(
      { email: 1 },
      { name: "idx_email", unique: true, sparse: true }
    );
    console.log("  ✓ idx_email (unique, sparse)");

    await customers.createIndex(
      { zaloId: 1 },
      { name: "idx_zalo", unique: true, sparse: true }
    );
    console.log("  ✓ idx_zalo (unique, sparse)");

    await customers.createIndex(
      { facebookId: 1 },
      { name: "idx_facebook", unique: true, sparse: true }
    );
    console.log("  ✓ idx_facebook (unique, sparse)\n");

    // ==================== PRODUCTS COLLECTION ====================
    console.log("🛍️  Creating indexes for 'products' collection...");
    const products = db.collection("products");

    await products.createIndex(
      { categoryId: 1, createdAt: -1 },
      { name: "idx_category_created" }
    );
    console.log("  ✓ idx_category_created");

    await products.createIndex(
      { name: "text", description: "text" },
      { name: "idx_product_search" }
    );
    console.log("  ✓ idx_product_search (text index)");

    await products.createIndex(
      { sku: 1 },
      { name: "idx_sku", unique: true, sparse: true }
    );
    console.log("  ✓ idx_sku (unique, sparse)");

    await products.createIndex(
      { isActive: 1, categoryId: 1 },
      { name: "idx_active_category" }
    );
    console.log("  ✓ idx_active_category\n");

    // ==================== CAMPAIGNS COLLECTION ====================
    console.log("📢 Creating indexes for 'campaigns' collection...");
    const campaigns = db.collection("campaigns");

    await campaigns.createIndex(
      { status: 1, startDate: -1 },
      { name: "idx_status_start" }
    );
    console.log("  ✓ idx_status_start");

    await campaigns.createIndex(
      { platform: 1, createdAt: -1 },
      { name: "idx_platform_created" }
    );
    console.log("  ✓ idx_platform_created");

    await campaigns.createIndex({ endDate: -1 }, { name: "idx_end_date" });
    console.log("  ✓ idx_end_date\n");

    // ==================== TICKETS COLLECTION ====================
    console.log("🎫 Creating indexes for 'tickets' collection...");
    const tickets = db.collection("tickets");

    await tickets.createIndex(
      { status: 1, priority: -1, createdAt: -1 },
      { name: "idx_status_priority_created" }
    );
    console.log("  ✓ idx_status_priority_created");

    await tickets.createIndex(
      { customerId: 1, createdAt: -1 },
      { name: "idx_customer_created" }
    );
    console.log("  ✓ idx_customer_created");

    await tickets.createIndex(
      { assignedTo: 1, status: 1 },
      { name: "idx_assigned_status" }
    );
    console.log("  ✓ idx_assigned_status");

    await tickets.createIndex(
      { ticketNumber: 1 },
      { name: "idx_ticket_number", unique: true }
    );
    console.log("  ✓ idx_ticket_number (unique)");

    await tickets.createIndex(
      { dueDate: 1, status: 1 },
      { name: "idx_due_status" }
    );
    console.log("  ✓ idx_due_status\n");

    // ==================== ADMIN USERS COLLECTION ====================
    console.log("👤 Creating indexes for 'adminusers' collection...");
    const adminUsers = db.collection("adminusers");

    await adminUsers.createIndex(
      { username: 1 },
      { name: "idx_username", unique: true }
    );
    console.log("  ✓ idx_username (unique)");

    await adminUsers.createIndex({ role: 1 }, { name: "idx_role" });
    console.log("  ✓ idx_role\n");

    // ==================== CHAT MESSAGES COLLECTION ====================
    console.log("💬 Creating indexes for 'chatmessages' collection...");
    const chatMessages = db.collection("chatmessages");

    await chatMessages.createIndex(
      { userId: 1, timestamp: -1 },
      { name: "idx_user_timestamp" }
    );
    console.log("  ✓ idx_user_timestamp");

    await chatMessages.createIndex(
      { sessionId: 1, timestamp: 1 },
      { name: "idx_session_timestamp" }
    );
    console.log("  ✓ idx_session_timestamp");

    // TTL index - auto-delete messages after 90 days
    await chatMessages.createIndex(
      { timestamp: 1 },
      { name: "idx_timestamp_ttl", expireAfterSeconds: 7776000 }
    );
    console.log("  ✓ idx_timestamp_ttl (TTL: 90 days)\n");

    // ==================== MESSAGE TEMPLATES COLLECTION ====================
    console.log("📝 Creating indexes for 'messagetemplates' collection...");
    const messageTemplates = db.collection("messagetemplates");

    await messageTemplates.createIndex(
      { type: 1, createdAt: -1 },
      { name: "idx_type_created" }
    );
    console.log("  ✓ idx_type_created");

    await messageTemplates.createIndex(
      { isActive: 1 },
      { name: "idx_active" }
    );
    console.log("  ✓ idx_active\n");

    // ==================== INTERACTION HISTORY COLLECTION ====================
    console.log("📊 Creating indexes for 'interactionhistory' collection...");
    const interactionHistory = db.collection("interactionhistory");

    await interactionHistory.createIndex(
      { customerId: 1, createdAt: -1 },
      { name: "idx_customer_created" }
    );
    console.log("  ✓ idx_customer_created");

    await interactionHistory.createIndex(
      { channel: 1, createdAt: -1 },
      { name: "idx_channel_created" }
    );
    console.log("  ✓ idx_channel_created");

    await interactionHistory.createIndex(
      { needsFollowUp: 1, createdAt: -1 },
      { name: "idx_followup_created" }
    );
    console.log("  ✓ idx_followup_created\n");

    // ==================== SURVEYS COLLECTION ====================
    console.log("📋 Creating indexes for 'surveys' collection...");
    const surveys = db.collection("surveys");

    await surveys.createIndex(
      { type: 1, status: 1 },
      { name: "idx_type_status" }
    );
    console.log("  ✓ idx_type_status");

    await surveys.createIndex(
      { createdAt: -1 },
      { name: "idx_created" }
    );
    console.log("  ✓ idx_created\n");

    console.log("✅ All indexes created successfully!");
    console.log("\n📊 Index Summary:");
    console.log("  - Orders: 7 indexes");
    console.log("  - Customers: 7 indexes");
    console.log("  - Products: 4 indexes");
    console.log("  - Campaigns: 3 indexes");
    console.log("  - Tickets: 5 indexes");
    console.log("  - Admin Users: 2 indexes");
    console.log("  - Chat Messages: 3 indexes (including TTL)");
    console.log("  - Message Templates: 2 indexes");
    console.log("  - Interaction History: 3 indexes");
    console.log("  - Surveys: 2 indexes");
    console.log("  ────────────────────");
    console.log("  Total: 38 indexes\n");

    // List all indexes for verification
    console.log("🔍 Verifying indexes...");
    const collections = [
      "orders",
      "customers",
      "products",
      "campaigns",
      "tickets",
      "adminusers",
      "chatmessages",
      "messagetemplates",
      "interactionhistory",
      "surveys",
    ];

    for (const collName of collections) {
      const coll = db.collection(collName);
      const indexes = await coll.indexes();
      console.log(`  ${collName}: ${indexes.length} indexes`);
    }

    console.log("\n✅ Index creation complete!");
  } catch (error) {
    console.error("\n❌ Error creating indexes:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the script
createIndexes().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
