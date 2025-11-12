import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node', // Use node for integration tests with server
    globals: true,
    setupFiles: './vitest.setup.ts',
    coverage: { provider: 'v8' },
    exclude: ['backend/**', 'node_modules/**'],
    include: ['**/*.spec.ts', '**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
