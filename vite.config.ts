import { defineConfig } from 'vitest/config'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      bundleTypes: true,
      tsconfigPath: './tsconfig.json',
      // The library is pure TS. Without this, unplugin-dts finds demo/App.vue
      // while scanning the project root, switches to the Vue processor and
      // fails on the missing @vue/language-core.
      processor: 'ts',
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueViewports',
      formats: ['es', 'cjs'],
      fileName: (format) =>
        format === 'es' ? 'vue-viewports.js' : 'vue-viewports.cjs',
    },
    rolldownOptions: {
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
