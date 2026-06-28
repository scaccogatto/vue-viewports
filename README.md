# vue-viewports

> Named, reactive, `matchMedia`-based viewport breakpoints for Vue 3 — a tiny plugin **and** composable.

[![npm version](https://img.shields.io/npm/v/vue-viewports.svg)](https://www.npmjs.com/package/vue-viewports)
[![CI](https://github.com/scaccogatto/vue-viewports/actions/workflows/ci.yml/badge.svg)](https://github.com/scaccogatto/vue-viewports/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/vue-viewports)](https://bundlephobia.com/package/vue-viewports)
[![license](https://img.shields.io/npm/l/vue-viewports.svg)](./LICENSE)

Define your breakpoints once, get the **current viewport** reactively in every component. No resize listeners, no debouncing — it is backed by the browser's [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) and updates only when a breakpoint is actually crossed.

- **Reactive everywhere** — the current viewport is a shared `ref`; templates, `computed`, and `watch` all update automatically.
- **Two APIs** — a Vue plugin (`$currentViewport` on every component) and a `useViewport()` composable.
- **Typed** — ships first-class TypeScript types and a single bundled `.d.ts`.
- **Tiny & zero-dependency** — < 1 kB gzipped, `vue` is the only (peer) dependency.
- **ESM + CJS** — works with Vite and bundlers.

## Installation

```shell
npm install vue-viewports
```

Requires **Vue 3.3+**.

## Usage

### Composable (`<script setup>`)

```vue
<script setup lang="ts">
import { useViewport } from 'vue-viewports'

const viewport = useViewport()
// viewport.value is { rule, label } | undefined
</script>

<template>
  <p>Current viewport: {{ viewport?.label ?? 'unknown' }}</p>
  <DesktopNav v-if="viewport?.label === 'desktop'" />
  <MobileNav v-else />
</template>
```

`useViewport()` returns a `readonly` ref. It lazily initializes the [default breakpoints](#default-breakpoints) on first use, so it works without the plugin. The value is `undefined` while no breakpoint matches (e.g. a width below the smallest `rule`).

### Plugin

Install the plugin to expose `$currentViewport` on every component and to register your own breakpoints app-wide.

```ts
import { createApp } from 'vue'
import VueViewports from 'vue-viewports'
import App from './App.vue'

createApp(App)
  .use(VueViewports) // default breakpoints
  .mount('#app')
```

With custom breakpoints:

```ts
createApp(App)
  .use(VueViewports, [
    { rule: '600px', label: 'small' },
    { rule: '900px', label: 'medium' },
    { rule: '1200px', label: 'large' },
  ])
  .mount('#app')
```

Then, in any component:

```vue
<template>
  <header :class="$currentViewport?.label">…</header>
</template>
```

The plugin is **authoritative**: installing it (re)configures the shared state, overriding any defaults a composable may have lazily set up.

### Custom breakpoints with the composable

You can also configure breakpoints without the plugin by calling `setupViewports` once (e.g. in your entry file):

```ts
import { setupViewports } from 'vue-viewports'

setupViewports([{ rule: '600px', label: 'small' }, { rule: '1200px', label: 'large' }])
```

## API

| Export | Description |
| --- | --- |
| `default` / `VueViewports` | Vue 3 plugin. `app.use(VueViewports, viewports?)`. |
| `useViewport()` | Composable returning `Readonly<Ref<ViewportMatch \| undefined>>`. |
| `setupViewports(viewports?)` | Imperatively (re)configure breakpoints; returns a teardown function. Idempotent. |
| `defaultViewports` | The built-in breakpoints. |
| `toMediaQuery(rule)` | `'768px'` → `'(min-width: 768px)'`. |
| `computeMatch(viewports)` | Pure-ish helper: the largest currently matching viewport. |
| `viewportInjectionKey` | `InjectionKey` for the readonly ref provided by the plugin. |
| `$currentViewport` | Component property added by the plugin: `ViewportMatch \| undefined`. |

### Types

```ts
interface ViewportConfig {
  readonly rule: string // CSS length used as `min-width`, e.g. '768px'
  readonly label: string // your name for the viewport, e.g. 'tablet'
}
type ViewportMatch = ViewportConfig
type ViewportConfigList = readonly ViewportConfig[]
```

`rule` is the width at which the viewport **starts** (inclusive); the matching viewport is the largest one whose `min-width` is satisfied.

### Default breakpoints

| label | starts at (`min-width`) |
| --- | --- |
| `mobile` | `320px` |
| `tablet` | `768px` |
| `desktop` | `1024px` |
| `hd-desktop` | `1920px` |
| `qhd-desktop` | `2560px` |
| `uhd-desktop` | `3840px` |

## Migrating from v3 (Vue 2)

`v4` is a full Vue 3 + TypeScript rewrite. The old `v3.x` line (Vue 2) remains installable for legacy projects: `npm install vue-viewports@3`.

| v3.x (Vue 2) | v4 (Vue 3) |
| --- | --- |
| `Vue.use(VueViewports, options)` | `createApp(App).use(VueViewports, options)` |
| `this.$currentViewport` | `this.$currentViewport` (unchanged) or `useViewport()` |
| Object getters `{ rule, label }` | Plain reactive `{ rule, label }` object |
| Not reactive ([#6](https://github.com/scaccogatto/vue-viewports/issues/6)) | Fully reactive (`ref`-backed) |
| Bundled a `matchMedia` polyfill | Uses the native `matchMedia` API |

The `options` shape (`[{ rule, label }]`) is unchanged, so most apps only need to swap `Vue.use` for `createApp(...).use`.

## License

[MIT](./LICENSE) © Marco Boffo
