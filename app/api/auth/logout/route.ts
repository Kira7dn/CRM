import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // Delete session cookies
    cookieStore.delete("admin_user_id")
    cookieStore.delete("admin_user_role")

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    )
  }
}
