import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: './vitest.setup.ts',
    // Only exclude common paths, allow integration tests
    exclude: ['backend/**', 'node_modules/**', '.next/**'],
    include: ['__tests__/integration/**/*.test.ts'],
  },
  server: {
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return (
        sourcePath.includes('/.next/') ||
        sourcePath.includes('\\.next\\') ||
        (sourcemapPath ? sourcemapPath.includes('/.next/') || sourcemapPath.includes('\\.next\\') : false)
      )
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
