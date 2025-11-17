import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createGetCurrentUserUseCase } from "../depends"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("admin_user_id")?.value

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const useCase = await createGetCurrentUserUseCase()
    const result = await useCase.execute({ userId })

    return NextResponse.json(result.user, { status: 200 })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json(
      { error: "Failed to get current user" },
      { status: 500 }
    )
  }
}
