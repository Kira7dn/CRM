"use server"

import { createDeleteAdminUserUseCase, createRegisterAdminUserUseCase, createUpdateAdminUserUseCase } from "@/app/api/auth/depends"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"


export async function createUserAction(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("admin_user_id")?.value
  const userRole = cookieStore.get("admin_user_role")?.value

  if (!userId) {
    throw new Error("Unauthorized")
  }

  // Only admin can create users
  if (userRole !== "admin") {
    throw new Error("Forbidden: Only admins can create users")
  }

  const useCase = await createRegisterAdminUserUseCase()
  const role = formData.get("role")?.toString() || "sale"

  // Validate role
  if (!["admin", "sale", "warehouse"].includes(role)) {
    throw new Error("Invalid role")
  }

  const result = await useCase.execute({
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    name: formData.get("name")?.toString() || "",
    role: role as "admin" | "sale" | "warehouse",
    phone: formData.get("phone")?.toString(),
  })

  revalidatePath("/crm/users")
  return result.user
}

export async function updateUserAction(userId: string, formData: FormData) {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get("admin_user_id")?.value
  const userRole = cookieStore.get("admin_user_role")?.value

  if (!currentUserId) {
    throw new Error("Unauthorized")
  }

  // Only admin can update users
  if (userRole !== "admin") {
    throw new Error("Forbidden: Only admins can update users")
  }

  const payload: any = { id: userId }

  const name = formData.get("name")?.toString()
  const phone = formData.get("phone")?.toString()
  const role = formData.get("role")?.toString()
  const status = formData.get("status")?.toString()

  if (name) payload.name = name
  if (phone !== undefined) payload.phone = phone
  if (role) payload.role = role
  if (status) payload.status = status

  const useCase = await createUpdateAdminUserUseCase()
  const result = await useCase.execute(payload)

  revalidatePath("/crm/users")
  return result.user
}

export async function deleteUserAction(userId: string) {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get("admin_user_id")?.value
  const userRole = cookieStore.get("admin_user_role")?.value

  if (!currentUserId) {
    throw new Error("Unauthorized")
  }

  // Only admin can delete users
  if (userRole !== "admin") {
    throw new Error("Forbidden: Only admins can delete users")
  }

  const useCase = await createDeleteAdminUserUseCase()
  const result = await useCase.execute({ userId })

  revalidatePath("/crm/users")
  return result.success
}
