"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function createUserAction(formData: FormData) {
  const cookieStore = await cookies()
  const userId = cookieStore.get("admin_user_id")?.value

  if (!userId) {
    throw new Error("Unauthorized")
  }

  const payload = {
    email: formData.get("email")?.toString() || "",
    password: formData.get("password")?.toString() || "",
    name: formData.get("name")?.toString() || "",
    role: formData.get("role")?.toString() || "sale",
    phone: formData.get("phone")?.toString(),
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `admin_user_id=${userId}; admin_user_role=${cookieStore.get("admin_user_role")?.value}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to create user")
  }

  revalidatePath("/admin/users")
  return await response.json()
}

export async function updateUserAction(userId: string, formData: FormData) {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get("admin_user_id")?.value

  if (!currentUserId) {
    throw new Error("Unauthorized")
  }

  const payload: any = {}

  const name = formData.get("name")?.toString()
  const phone = formData.get("phone")?.toString()
  const role = formData.get("role")?.toString()
  const status = formData.get("status")?.toString()

  if (name) payload.name = name
  if (phone !== undefined) payload.phone = phone
  if (role) payload.role = role
  if (status) payload.status = status

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/users/${userId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_user_id=${currentUserId}; admin_user_role=${cookieStore.get("admin_user_role")?.value}`,
      },
      body: JSON.stringify(payload),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to update user")
  }

  revalidatePath("/admin/users")
  return await response.json()
}

export async function deleteUserAction(userId: string) {
  const cookieStore = await cookies()
  const currentUserId = cookieStore.get("admin_user_id")?.value

  if (!currentUserId) {
    throw new Error("Unauthorized")
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/auth/users/${userId}`,
    {
      method: "DELETE",
      headers: {
        Cookie: `admin_user_id=${currentUserId}; admin_user_role=${cookieStore.get("admin_user_role")?.value}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to delete user")
  }

  revalidatePath("/admin/users")
  return await response.json()
}
