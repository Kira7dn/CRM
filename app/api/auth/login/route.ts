import { NextRequest, NextResponse } from "next/server"
import { createLoginUseCase } from "../depends"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const useCase = await createLoginUseCase()
    const result = await useCase.execute(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      )
    }

    // Set session cookie (simple session - can be improved with JWT)
    const cookieStore = await cookies()
    cookieStore.set("admin_user_id", result.user!.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    cookieStore.set("admin_user_role", result.user!.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return NextResponse.json(result.user, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 500 }
    )
  }
}
