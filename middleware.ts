import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Paths that require authentication
const protectedPaths = [
  "/admin/dashboard",
  "/admin/users",
  "/admin/profile",
  "/admin/products",
  "/admin/orders",
  "/admin/customers",
  "/admin/banners",
  "/admin/stations",
  "/admin/posts",
  "/admin/campaigns",
]

// Paths that require admin role
const adminOnlyPaths = ["/admin/users"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path requires authentication
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // Get user session from cookies
  const userId = request.cookies.get("admin_user_id")?.value
  const userRole = request.cookies.get("admin_user_role")?.value

  // If no user session, redirect to login
  if (!userId) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check if admin-only path
  const isAdminOnlyPath = adminOnlyPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isAdminOnlyPath && userRole !== "admin") {
    // Redirect to dashboard if not admin
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  // Allow request to proceed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
