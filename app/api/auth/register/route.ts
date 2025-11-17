import { NextRequest, NextResponse } from "next/server"
import { createRegisterAdminUserUseCase } from "../depends"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const cookieStore = await cookies()
    const userRole = cookieStore.get("admin_user_role")?.value

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can register new users" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const useCase = await createRegisterAdminUserUseCase()
    const result = await useCase.execute(body)

    return NextResponse.json(result.user, { status: 201 })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    )
  }
}
