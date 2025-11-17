import { NextRequest, NextResponse } from "next/server"
import { createGetAllUsersUseCase } from "../depends"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const cookieStore = await cookies()
    const userRole = cookieStore.get("admin_user_role")?.value

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view all users" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as "admin" | "sale" | "warehouse" | null
    const status = searchParams.get("status") as "active" | "inactive" | null

    const useCase = await createGetAllUsersUseCase()
    const result = await useCase.execute({
      role: role || undefined,
      status: status || undefined,
    })

    return NextResponse.json(result.users, { status: 200 })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    )
  }
}
