import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// The unit tests import server utils via the `~` alias Nuxt provides at
// runtime/build time, but plain `vitest` doesn't know about it without this.
export default defineConfig({
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('.', import.meta.url)),
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  },
  test: {
    environment: 'node'
  }
})
