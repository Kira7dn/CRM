import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const ALLOWED_ORIGINS = new Set([
  'https://h5.zdn.vn',
  'http://localhost:3000',
  'https://linkstrategy.io.vn',
])

const ALLOW_ALL = true
const ALLOW_CREDENTIALS = false

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (!pathname.startsWith('/api/')) return NextResponse.next()

  const origin = req.headers.get('origin') || ''
  const isAllowed = ALLOWED_ORIGINS.has(origin)
  const allowOrigin = isAllowed ? origin : (ALLOW_ALL && origin ? origin : '*')

  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    res.headers.set('Access-Control-Allow-Origin', allowOrigin)
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if (ALLOW_CREDENTIALS && allowOrigin !== '*') res.headers.set('Access-Control-Allow-Credentials', 'true')
    return res
  }

  const res = NextResponse.next()
  res.headers.set('Access-Control-Allow-Origin', allowOrigin)
  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (ALLOW_CREDENTIALS && allowOrigin !== '*') res.headers.set('Access-Control-Allow-Credentials', 'true')
  return res
}

export const config = {
  matcher: ['/api/:path*'],
}
