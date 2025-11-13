import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'
import dotenv from 'dotenv'

// Load .env.local into process.env for tests (if available)
dotenv.config({ path: '.env.local' })

declare global {
  var testServer: import('http').Server;
  var expect: typeof import('vitest')['expect'];
  var vi: typeof import('vitest')['vi'];
}

// Make expect and vi global
global.expect = expect
global.vi = vi

// Ensure environment variables are set
process.env.MONGODB_URI = process.env.MONGODB_URI
process.env.MONGODB_DB = process.env.MONGODB_DB
process.env.REDIS_URL = process.env.REDIS_URL
process.env.APP_ID = process.env.APP_ID
process.env.CHECKOUT_SDK_PRIVATE_KEY = process.env.CHECKOUT_SDK_PRIVATE_KEY
process.env.VITEST = 'true'

// Warm-up Next.js API route modules to avoid cold compile cost on first test run
// Note: chỉ import module để kích hoạt biên dịch, không gọi handler để tránh side-effects
const __warmupRoutes = [
  '@/app/api/health/route',
  '@/app/api/category/route',
  '@/app/api/category/[id]/route',
  '@/app/api/product/route',
  '@/app/api/product/[id]/route',
  '@/app/api/banner/route',
  '@/app/api/banner/[id]/route',
  '@/app/api/order/route',
  '@/app/api/order/[id]/route',
  '@/app/api/location/route',
  '@/app/api/phone/route',
  '@/app/api/checkout/link-order/route',
  '@/app/api/checkout/check-status/route',
  '@/app/api/checkout/mac/route',
  '@/app/api/checkout/callback/route',
  '@/app/api/station/route',
  '@/app/api/station/[id]/route',
  '@/app/api/user/route',
  '@/app/api/user/[id]/route',
  '@/app/api/vnpay/ipn/route',
] as const

await Promise.all(
  __warmupRoutes.map((mod) =>
    import(mod).catch(() => void 0)
  )
)

