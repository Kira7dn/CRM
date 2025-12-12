import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/auth/tiktok/refresh
 * Manually refresh TikTok access token
 */
export async function POST() {

  return NextResponse.json(
    {
      message: "Wordpress Token No need to refresh",
    },
    { status: 200 }
  )
}
