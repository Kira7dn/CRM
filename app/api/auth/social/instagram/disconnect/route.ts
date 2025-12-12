import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { ObjectId } from "mongodb"
import { createDisconnectInstagramUseCase } from "../depends"

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
    const useCase = await createDisconnectInstagramUseCase()
    const result = await useCase.execute({ userId })

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to disconnect Instagram" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Instagram disconnect error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Disconnect failed" },
      { status: 500 }
    )
  }
}
