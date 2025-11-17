import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// CORS configuration
const ALLOWED_ORIGINS = new Set([
  'https://h5.zdn.vn',
  'http://localhost:3000',
  'https://linkstrategy.io.vn',
])

const ALLOW_ALL = true
const ALLOW_CREDENTIALS = false

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    return handleCors(request)
  }

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

function handleCors(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const isAllowed = ALLOWED_ORIGINS.has(origin)
  const allowOrigin = isAllowed ? origin : (ALLOW_ALL && origin ? origin : '*')

  if (request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    setCorsHeaders(res, allowOrigin)
    return res
  }

  const res = NextResponse.next()
  setCorsHeaders(res, allowOrigin)
  return res
}

function setCorsHeaders(response: NextResponse, allowOrigin: string) {
  response.headers.set('Access-Control-Allow-Origin', allowOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (ALLOW_CREDENTIALS && allowOrigin !== '*') {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
