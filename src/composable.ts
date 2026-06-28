import type { DeepReadonly, Ref } from 'vue'
import { ensureViewports, viewportRef } from './core'
import type { ViewportMatch } from './types'

/**
 * Reactive access to the current viewport from any component.
 *
 * ```ts
 * const viewport = useViewport()
 * watchEffect(() => console.log(viewport.value?.label))
 * ```
 *
 * If the {@link VueViewports} plugin has been installed, this returns the state
 * configured there. Otherwise it lazily initializes the default breakpoints on
 * first call (no-op during SSR). The value is `undefined` until the first match
 * is computed and whenever no viewport matches.
 */
export const useViewport = (): DeepReadonly<Ref<ViewportMatch | undefined>> => {
  ensureViewports()
  return viewportRef()
}
