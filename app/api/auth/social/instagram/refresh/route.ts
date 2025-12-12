import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createRefreshInstagramTokenUseCase } from "../depends"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = new ObjectId(userIdCookie.value)
    const useCase = await createRefreshInstagramTokenUseCase()
    const result = await useCase.execute({ userId })

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to refresh Instagram token" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      expiresAt: result.socialAuth?.expiresAt,
    })
  } catch (error) {
    console.error("Instagram token refresh error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Token refresh failed" },
      { status: 500 }
    )
  }
}
