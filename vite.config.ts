import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({ include: ['src'], bundleTypes: true, tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueViewports',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'vue-viewports.js' : 'vue-viewports.cjs',
    },
    rollupOptions: {
      external: ['vue'],
      output: { exports: 'named' },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text', 'json-summary'] },
  },
})
