import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ===== Types =====
type Role = "admin" | "sale" | "warehouse";
type Permission = "full" | "read" | "write" | "stock" | "status" | "none";

interface AuthRule {
  path: string;
  admin: Permission;
  sale: Permission;
  warehouse: Permission;
}

// ===== Authorization Matrix =====
const AUTH_RULES: AuthRule[] = [
  { path: "/crm/managements", admin: "full", sale: "read", warehouse: "read" },
  { path: "/crm/managements/products", admin: "full", sale: "read", warehouse: "stock" },
  { path: "/crm/managements/categories", admin: "full", sale: "read", warehouse: "none" },
  { path: "/crm/managements/orders", admin: "full", sale: "write", warehouse: "status" },
  { path: "/crm/managements/customers", admin: "full", sale: "read", warehouse: "none" },
  { path: "/crm/managements/banners", admin: "full", sale: "read", warehouse: "none" },
  { path: "/crm/managements/posts", admin: "full", sale: "read", warehouse: "none" },
  { path: "/crm/managements/campaigns", admin: "full", sale: "read", warehouse: "none" },
  { path: "/crm/users", admin: "full", sale: "none", warehouse: "none" },
  { path: "/crm/analytics", admin: "full", sale: "none", warehouse: "none" }
];

// ===== CORS Configuration =====
const ALLOWED_ORIGINS = new Set([
  'https://h5.zdn.vn',
  'http://localhost:3000',
  'https://linkstrategy.io.vn'
]);
const ALLOW_CREDENTIALS = true;

// ===== Helper to match module =====
function matchModule(pathname: string) {
  return AUTH_RULES.find(rule => pathname.startsWith(rule.path));
}

// ===== CORS handler =====
function handleCors(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin') || '';
  const isAllowed = ALLOWED_ORIGINS.has(origin);
  const allowOrigin = isAllowed ? origin : '*';

  // Preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', allowOrigin);
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (ALLOW_CREDENTIALS && allowOrigin !== '*') {
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return res;
  }

  // For other requests, just set CORS headers
  const res = NextResponse.next();
  res.headers.set('Access-Control-Allow-Origin', allowOrigin);
  if (ALLOW_CREDENTIALS && allowOrigin !== '*') {
    res.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  return res;
}

// ===== Proxy Middleware =====
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS first
  const corsRes = handleCors(request);
  if (request.method === 'OPTIONS') return corsRes;

  // Only protect /crm routes
  if (!pathname.startsWith("/crm")) {
    return corsRes;
  }

  // Allow login page
  if (pathname.startsWith("/crm/login")) {
    return corsRes;
  }

  // Get session cookies
  const userId = request.cookies.get("admin_user_id")?.value;
  const role = request.cookies.get("admin_user_role")?.value as Role | undefined;

  // Not logged in → redirect
  if (!userId) {
    const loginUrl = new URL("/crm/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Identify module
  const module = matchModule(pathname);

  // If module not found → allow
  if (!module) {
    return corsRes;
  }

  // Get permission
  const permission: Permission = role ? module[role] : "none";

  // No access → redirect to dashboard
  if (permission === "none") {
    return NextResponse.redirect(new URL("/crm/dashboard", request.url));
  }

  // Read-only restriction
  if (permission === "read" && request.method !== "GET") {
    return new NextResponse(
      JSON.stringify({ message: "You do not have permission to modify this module." }),
      { status: 403, headers: corsRes?.headers || {} }
    );
  }

  // Stock-only for warehouse in Products
  if (permission === "stock") {
    if (request.method !== "GET" && !pathname.includes("stock")) {
      return new NextResponse(
        JSON.stringify({ message: "Warehouse can only modify stock." }),
        { status: 403, headers: corsRes?.headers || {} }
      );
    }
  }

  // Order status-only for warehouse
  if (permission === "status") {
    if (request.method !== "GET" && !pathname.includes("status")) {
      return new NextResponse(
        JSON.stringify({ message: "Warehouse can only update order status." }),
        { status: 403, headers: corsRes?.headers || {} }
      );
    }
  }

  // Full access → allow
  return corsRes;
}

// ===== Middleware matcher =====
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
