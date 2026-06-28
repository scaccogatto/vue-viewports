import type { App, InjectionKey, Plugin } from 'vue'
import { currentViewportValue, defaultViewports, setupViewports, viewportRef } from './core'
import type { ViewportConfigList, ViewportMatch } from './types'

/** Inject key for the readonly current-viewport ref. */
export const viewportInjectionKey: InjectionKey<ReturnType<typeof viewportRef>> =
  Symbol('vue-viewports')

/**
 * Vue 3 plugin. Sets up `matchMedia` listeners for the given viewports and
 * exposes the current one as:
 *
 * - `this.$currentViewport` on every component (Options & global), and
 * - an injectable readonly ref via {@link viewportInjectionKey}.
 *
 * ```ts
 * import { createApp } from 'vue'
 * import VueViewports from 'vue-viewports'
 *
 * createApp(App).use(VueViewports).mount('#app')
 * // or with custom breakpoints:
 * createApp(App).use(VueViewports, [{ rule: '600px', label: 'small' }])
 * ```
 *
 * The plugin is authoritative: installing it always (re)configures the shared
 * state, overriding any lazy defaults a composable may have set up.
 */
export const VueViewports: Plugin<[ViewportConfigList?]> = {
  install(app: App, viewports: ViewportConfigList = defaultViewports): void {
    setupViewports(viewports)

    Object.defineProperty(app.config.globalProperties, '$currentViewport', {
      configurable: true,
      enumerable: true,
      get: (): ViewportMatch | undefined => currentViewportValue(),
    })

    app.provide(viewportInjectionKey, viewportRef())
  },
}

declare module 'vue' {
  interface ComponentCustomProperties {
    /** The current viewport, or `undefined` when none matches. */
    readonly $currentViewport: ViewportMatch | undefined
  }
}
