#!/usr/bin/env tsx

/**
 * Standalone script to run Scheduled Post Worker
 * Usage: npm run worker:scheduled-posts
 */

import { initializeScheduledPostWorker, closeScheduledPostWorker } from '../infrastructure/queue/scheduled-post-worker'

console.log('[ScheduledPostWorker] Starting worker...')

// Initialize worker
const worker = initializeScheduledPostWorker()

// Graceful shutdown
const shutdown = async () => {
  console.log('[ScheduledPostWorker] Shutting down...')
  await closeScheduledPostWorker()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

console.log('[ScheduledPostWorker] Worker is running. Press Ctrl+C to stop.')
