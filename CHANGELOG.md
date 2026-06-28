# Changelog

All notable changes to this project are documented here. This project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.0.0] - 2026-06-28

Full **Vue 3 + TypeScript** rewrite with modern, best-in-class tooling.

### Breaking

- **Requires Vue 3.3+.** Vue 2 is no longer supported. Vue 2 users can stay on `vue-viewports@3`.
- Plugin installation moved from `Vue.use(...)` to `createApp(App).use(VueViewports, options)`.
- ESM-first package with proper `exports` map (ESM + CJS + UMD). The published `main` is now `./dist/vue-viewports.cjs`.

### Added

- **`useViewport()` composable** returning a `readonly` `Ref<ViewportMatch | undefined>` — the current viewport, reactive in every component, usable in `<script setup>`.
- **`setupViewports(viewports?)`** to (re)configure breakpoints imperatively; returns a teardown function and is idempotent.
- First-class **TypeScript types** (`ViewportConfig`, `ViewportMatch`, `ViewportConfigList`) and a single bundled `index.d.ts` via `vite-plugin-dts`.
- **Injectable** readonly ref via `viewportInjectionKey`.
- **Vitest** test suite (jsdom) with a single source-of-truth `matchMedia` mock that exercises real breakpoint switching; ~98% statement coverage.
- **GitHub Actions CI** (lint, typecheck, test, build on Node 20 and 22).
- npm discovery metadata: keywords, `homepage`, `bugs`, `unpkg`/`jsdelivr` entries.

### Fixed

- **`$currentViewport` is now fully reactive** ([#6](https://github.com/scaccogatto/vue-viewports/issues/6)). The previous plain-object store bypassed Vue's reactivity, so components never re-rendered on resize. State is now backed by a `ref`.
- Replaced the deprecated `MediaQueryList.addListener` with `addEventListener('change', …)`.

### Removed

- Webpack 3, Babel 6, ESLint 4, `core-js` 2 and the bundled `matchMedia` polyfill — replaced by Vite 8 (library mode), TypeScript 6, ESLint 10 (flat config) and the native `matchMedia` API.
- Legacy `dist/vue-viewports.js` UMD-only build.

### Notes

- The package keeps the name **`vue-viewports`** for continuity ([#8](https://github.com/scaccogatto/vue-viewports/issues/8), declined — renaming would break existing installs).
- The PhantomJS test task ([#2](https://github.com/scaccogatto/vue-viewports/issues/2)) is obsolete; testing is now Vitest + jsdom.

## [3.1.2] - earlier

Last Vue 2 release. See git history.
