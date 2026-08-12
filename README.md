# vue-viewports

> Named, reactive, `matchMedia`-based viewport breakpoints for Vue 3 — a tiny plugin **and** composable.

[![npm version](https://img.shields.io/npm/v/vue-viewports.svg)](https://www.npmjs.com/package/vue-viewports)
[![npm downloads](https://img.shields.io/npm/dm/vue-viewports)](https://www.npmjs.com/package/vue-viewports)
[![CI](https://github.com/scaccogatto/vue-viewports/actions/workflows/ci.yml/badge.svg)](https://github.com/scaccogatto/vue-viewports/actions/workflows/ci.yml)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/vue-viewports)](https://bundlephobia.com/package/vue-viewports)
[![license](https://img.shields.io/npm/l/vue-viewports.svg)](./LICENSE)

[Live demo](https://scaccogatto.github.io/vue-viewports/) — resize the window and watch the named breakpoint change.

Define your breakpoints once, get the **current viewport** reactively in every component. No resize listeners, no debouncing — it is backed by the browser's [`matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) and updates only when a breakpoint is actually crossed.

- **Reactive everywhere** — the current viewport is a shared `ref`; templates, `computed`, and `watch` all update automatically.
- **Two APIs** — a Vue plugin (`$currentViewport` on every component) and a `useViewport()` composable.
- **Flexible breakpoints** — a `rule` can be a `min-width` length, a `{ min, max, orientation }` range, or a raw media-query string.
- **`useMediaQuery()`** — a standalone, SSR-safe reactive wrapper around any `matchMedia` query, for one-off responsive logic outside the named breakpoints.
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

### Breakpoint rule forms

A `rule` accepts any of three forms:

```ts
setupViewports([
  { rule: '768px', label: 'tablet' }, // legacy: min-width length (unchanged)
  { rule: { min: 768, max: 1279 }, label: 'tablet-only' }, // range: min/max (px) and/or orientation
  { rule: { orientation: 'landscape' }, label: 'landscape' },
  { rule: '(prefers-color-scheme: dark)', label: 'dark-mode' }, // raw media query, used verbatim
])
```

All three compile to a plain media-query string internally and are matched the same way. When several rules match at once, the one with the largest numeric width (from the legacy form or a range's `min`) wins — exactly as before for all-numeric configs; a rule with no numeric width (raw query, or a range with only `max`/`orientation`) is only picked when it's the sole match.

### `useMediaQuery`

Reactive access to any raw `matchMedia` query, independent of the named-breakpoint system above:

```vue
<script setup lang="ts">
import { useMediaQuery } from 'vue-viewports'

const isDark = useMediaQuery('(prefers-color-scheme: dark)')
</script>

<template>
  <p>{{ isDark ? 'dark' : 'light' }} mode</p>
</template>
```

`query` may also be a `Ref<string>`; changing its value unsubscribes from the old query and subscribes to the new one. `useMediaQuery` is SSR-safe (`false` on the server) and, when called inside a component `setup()` or an `effectScope()`, removes its `matchMedia` listener automatically on scope disposal. Called outside any scope, it still works, but nothing disposes the listener for you.

## API

| Export | Description |
| --- | --- |
| `default` / `VueViewports` | Vue 3 plugin. `app.use(VueViewports, viewports?)`. |
| `useViewport()` | Composable returning `Readonly<Ref<ViewportMatch \| undefined>>`. |
| `useMediaQuery(query)` | Composable returning `Readonly<Ref<boolean>>` for any raw `matchMedia` query; `query` may be a `string` or `Ref<string>`. |
| `setupViewports(viewports?)` | Imperatively (re)configure breakpoints; returns a teardown function. Idempotent. |
| `defaultViewports` | The built-in breakpoints. |
| `toMediaQuery(rule)` | Compiles a `ViewportRule` to a media-query string, e.g. `'768px'` → `'(min-width: 768px)'`. |
| `computeMatch(viewports)` | Pure-ish helper: the largest currently matching viewport. |
| `viewportInjectionKey` | `InjectionKey` for the readonly ref provided by the plugin. |
| `$currentViewport` | Component property added by the plugin: `ViewportMatch \| undefined`. |

### Types

```ts
type ViewportOrientation = 'portrait' | 'landscape'

interface ViewportRangeRule {
  readonly min?: number // px
  readonly max?: number // px
  readonly orientation?: ViewportOrientation
}

// legacy min-width length ('768px'), a raw media-query string (contains '('),
// or a range object
type ViewportRule = string | ViewportRangeRule

interface ViewportConfig {
  readonly rule: ViewportRule
  readonly label: string // your name for the viewport, e.g. 'tablet'
}
type ViewportMatch = ViewportConfig
type ViewportConfigList = readonly ViewportConfig[]
```

For the legacy string form, `rule` is the width at which the viewport **starts** (inclusive); the matching viewport is the largest one whose `min-width` (or range `min`) is satisfied — see [Breakpoint rule forms](#breakpoint-rule-forms) for how ties resolve across mixed forms.

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
