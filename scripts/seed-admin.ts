/**
 * Script to seed the first admin user
 * Run with: npm run seed-admin
 */

import { AdminUserRepository } from "../infrastructure/repositories/admin-user-repo"

async function seedAdmin() {
  console.log("🌱 Seeding first admin user...")

  const repo = new AdminUserRepository()

  // Check if admin already exists
  const existing = await repo.getByEmail("admin@haisanngaymoi.com")

  if (existing) {
    console.log("✅ Admin user already exists!")
    console.log("Email:", existing.email)
    console.log("Name:", existing.name)
    console.log("Role:", existing.role)
    return
  }

  // Create first admin
  const admin = await repo.create({
    email: "admin@haisanngaymoi.com",
    password: "Admin@123456", // CHANGE THIS IN PRODUCTION!
    name: "Admin",
    role: "admin",
    status: "active",
  })

  console.log("✅ Admin user created successfully!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📧 Email:", admin.email)
  console.log("🔑 Password: Admin@123456")
  console.log("👤 Name:", admin.name)
  console.log("🎭 Role:", admin.role)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("")
  console.log("⚠️  IMPORTANT: Please change the password after first login!")
  console.log("Login at: http://localhost:3000/admin/login")
}

seedAdmin()
  .then(() => {
    console.log("✨ Seeding complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error seeding admin:", error)
    process.exit(1)
  })
