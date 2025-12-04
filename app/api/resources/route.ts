/**
 * Resource API Routes
 * Handles GET (list resources) and POST (upload resource)
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getResourcesUseCase, uploadResourceUseCase } from "./depends"

/**
 * GET /api/resources
 * List all resources for a user
 */
export async function GET(request: NextRequest) {
  try {
    // Get userId from HttpOnly cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get("admin_user_id")?.value
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - User not authenticated" },
        { status: 401 }
      )
    }

    const useCase = await getResourcesUseCase()
    const result = await useCase.execute({ userId })

    return NextResponse.json(result.resources)
  } catch (error) {
    console.error("[API] GET /api/resources error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch resources"
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/resources
 * Upload a new resource file
 */
export async function POST(request: NextRequest) {
  try {
    // Read userId from HttpOnly cookie
    const cookieStore = await cookies()
    const userId = cookieStore.get("admin_user_id")?.value

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - User ID missing" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = formData.get("fileType") as "md" | "txt" | "pdf"

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      )
    }

    if (!fileType || !["md", "txt", "pdf"].includes(fileType)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be md, txt, or pdf" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Execute upload use case
    const useCase = await uploadResourceUseCase()
    const result = await useCase.execute({
      userId,
      file: buffer,
      fileName: file.name,
      fileType,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] POST /api/resources error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload resource"
      },
      { status: 500 }
    )
  }
}
