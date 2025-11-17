import { NextRequest, NextResponse } from "next/server"
import { createChangePasswordUseCase } from "../depends"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const cookieStore = await cookies()
    const userId = cookieStore.get("admin_user_id")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const useCase = await createChangePasswordUseCase()
    const result = await useCase.execute({
      userId,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: result.message },
      { status: 200 }
    )
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to change password" },
      { status: 500 }
    )
  }
}
