import { NextRequest, NextResponse } from "next/server"
import { createUpdateAdminUserUseCase, createDeleteAdminUserUseCase } from "../../depends"
import { cookies } from "next/headers"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const cookieStore = await cookies()
    const userRole = cookieStore.get("admin_user_role")?.value

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update users" },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const useCase = await createUpdateAdminUserUseCase()
    const result = await useCase.execute({ id, ...body })

    return NextResponse.json(result.user, { status: 200 })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update user" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if user is authenticated and is admin
    const cookieStore = await cookies()
    const userRole = cookieStore.get("admin_user_role")?.value

    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete users" },
        { status: 403 }
      )
    }

    const { id } = await params

    const useCase = await createDeleteAdminUserUseCase()
    const result = await useCase.execute({ userId: id })

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
    console.error("Delete user error:", error)
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
