import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ include: ['src'], bundleTypes: true, tsconfigPath: './tsconfig.json' }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueViewports',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) =>
        format === 'es'
          ? 'vue-viewports.js'
          : format === 'cjs'
            ? 'vue-viewports.cjs'
            : 'vue-viewports.umd.cjs',
    },
    rollupOptions: {
      external: ['vue'],
      output: { exports: 'named', globals: { vue: 'Vue' } },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    coverage: { provider: 'v8', include: ['src/**'], reporter: ['text', 'json-summary'] },
  },
})
