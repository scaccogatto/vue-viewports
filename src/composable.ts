import {
  ref,
  watch,
  isRef,
  getCurrentScope,
  onScopeDispose,
  readonly,
  type DeepReadonly,
  type Ref,
} from 'vue'
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

/**
 * Reactive `window.matchMedia` wrapper: `true` while `query` currently matches.
 *
 * SSR-safe — `false` on the server (no `matchMedia`), evaluated live on the
 * client. `query` may be a plain string or a `Ref<string>`; changing the
 * ref's value unsubscribes from the old query and subscribes to the new one.
 *
 * The underlying `matchMedia` listener is removed automatically when the
 * current effect scope (component `setup()`, or a manual `effectScope()`) is
 * disposed. Called outside any scope, it still works, but nothing disposes
 * the listener for you — clean it up yourself if that matters.
 */
export const useMediaQuery = (query: string | Ref<string>): DeepReadonly<Ref<boolean>> => {
  const matches = ref(false)
  let unsubscribe: (() => void) | undefined

  const subscribe = (mediaQuery: string): void => {
    unsubscribe?.()
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      matches.value = false
      unsubscribe = undefined
      return
    }
    const mql = window.matchMedia(mediaQuery)
    const update = (): void => {
      matches.value = mql.matches
    }
    update()
    mql.addEventListener('change', update)
    unsubscribe = (): void => mql.removeEventListener('change', update)
  }

  const stopWatch = isRef(query) ? watch(query, subscribe, { immediate: true }) : undefined
  if (!isRef(query)) subscribe(query)

  if (getCurrentScope()) {
    onScopeDispose(() => {
      stopWatch?.()
      unsubscribe?.()
    })
  }

  return readonly(matches)
}
