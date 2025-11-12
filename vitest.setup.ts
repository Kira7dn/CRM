import '@testing-library/jest-dom'
import { expect, vi } from 'vitest'

// Load .env.local into process.env for tests (if available)
require('dotenv').config({ path: '.env.local' })

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
process.env.REDIS_HOST = process.env.REDIS_HOST
process.env.REDIS_PORT = process.env.REDIS_PORT
process.env.REDIS_PASSWORD = process.env.REDIS_PASSWORD
process.env.APP_ID = process.env.APP_ID
process.env.CHECKOUT_SDK_PRIVATE_KEY = process.env.CHECKOUT_SDK_PRIVATE_KEY
process.env.VITEST = 'true'

