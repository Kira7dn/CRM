import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createDisconnectTikTokUseCase } from "../depends"

/**
 * POST /api/auth/tiktok/disconnect
 * Disconnects TikTok account from current user
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from session
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const userId = new ObjectId(userIdCookie.value)

    // Execute disconnect use case
    const useCase = await createDisconnectTikTokUseCase()
    const result = await useCase.execute({ userId })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to disconnect TikTok" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: result.message || "TikTok disconnected successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("TikTok disconnect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    )
  }
}
