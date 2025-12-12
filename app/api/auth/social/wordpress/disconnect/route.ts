import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createDisconnectWordPressUseCase } from "../depends"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userIdCookie = cookieStore.get("admin_user_id")

    if (!userIdCookie) {
      return NextResponse.json(
        { error: "Unauthorized - Please login first" },
        { status: 401 }
      )
    }

    const userId = new ObjectId(userIdCookie.value)
    const useCase = await createDisconnectWordPressUseCase()
    const result = await useCase.execute({ userId })

    if (!result.success) {
      return NextResponse.json(
        { error: result.message || "Failed to disconnect WordPress" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: result.message || "WordPress disconnected successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("WordPress disconnect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    )
  }
}
