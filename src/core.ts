import { ref, readonly, type DeepReadonly, type Ref } from 'vue'
import type { ViewportConfig, ViewportConfigList, ViewportMatch, ViewportRangeRule, ViewportRule } from './types'

/**
 * Sensible default breakpoints, ordered from smallest to largest.
 * Override them by passing your own list to the plugin or composable.
 */
export const defaultViewports: ViewportConfigList = [
  { rule: '320px', label: 'mobile' },
  { rule: '768px', label: 'tablet' },
  { rule: '1024px', label: 'desktop' },
  { rule: '1920px', label: 'hd-desktop' },
  { rule: '2560px', label: 'qhd-desktop' },
  { rule: '3840px', label: 'uhd-desktop' },
]

/** Module-level reactive singleton: the current viewport, shared app-wide. */
const currentViewport = ref<ViewportMatch | undefined>(undefined)

let teardown: (() => void) | undefined
let initialized = false

/** A string rule containing `(` is a raw media query, used verbatim. */
const isRawQuery = (rule: string): boolean => rule.includes('(')

const toPx = (rule: string): number => Number.parseFloat(rule)

const compileRangeRule = (rule: ViewportRangeRule): string => {
  const parts: string[] = []
  if (rule.min !== undefined) parts.push(`(min-width: ${rule.min}px)`)
  if (rule.max !== undefined) parts.push(`(max-width: ${rule.max}px)`)
  if (rule.orientation) parts.push(`(orientation: ${rule.orientation})`)
  return parts.length > 0 ? parts.join(' and ') : 'all'
}

/**
 * Compiles a {@link ViewportRule} to a media query string:
 * - a legacy CSS length (no parentheses), e.g. `'768px'` -> `'(min-width: 768px)'`;
 * - a string containing `(` -> used verbatim, it is already a media query;
 * - a {@link ViewportRangeRule} object -> `min-width`/`max-width`/`orientation`, ANDed.
 */
export const toMediaQuery = (rule: ViewportRule): string => {
  if (typeof rule === 'string') return isRawQuery(rule) ? rule : `(min-width: ${rule})`
  return compileRangeRule(rule)
}

/**
 * Sort key used only to break ties among matching viewports: the legacy
 * numeric form and a range rule's `min` are treated as widths (larger wins,
 * identical to pre-v4.1 behavior for the legacy form). Rules with no numeric
 * width (raw query, or a range with no `min`) sort lowest, so they are picked
 * only when no width-based rule also matches.
 */
const sortKey = (rule: ViewportRule): number => {
  if (typeof rule === 'string') return isRawQuery(rule) ? Number.NEGATIVE_INFINITY : toPx(rule)
  return rule.min ?? Number.NEGATIVE_INFINITY
}

/**
 * The largest viewport whose rule currently matches, or `undefined`
 * when none match. Pure with respect to its input: reads only `matchMedia`.
 */
export const computeMatch = (viewports: ViewportConfigList): ViewportMatch | undefined => {
  const match = [...viewports]
    .sort((a, b) => sortKey(a.rule) - sortKey(b.rule))
    .filter((viewport) => window.matchMedia(toMediaQuery(viewport.rule)).matches)
    .at(-1)
  return match ? { rule: match.rule, label: match.label } : undefined
}

/**
 * Register `matchMedia` listeners for every viewport and keep
 * {@link currentViewport} in sync. Idempotent: tears down any previous setup
 * first. Returns a teardown function that removes the listeners.
 */
export const setupViewports = (viewports: ViewportConfigList = defaultViewports): (() => void) => {
  teardown?.()

  const queries = viewports.map((viewport) => window.matchMedia(toMediaQuery(viewport.rule)))
  const update = (): void => {
    currentViewport.value = computeMatch(viewports)
  }

  queries.forEach((query) => query.addEventListener('change', update))
  update()

  initialized = true
  const dispose = (): void => {
    queries.forEach((query) => query.removeEventListener('change', update))
    if (teardown === dispose) teardown = undefined
  }
  teardown = dispose
  return dispose
}

/**
 * Lazily set up the default viewports on first read from a composable, but
 * only if a plugin (which is authoritative) has not already done so and the
 * environment exposes `matchMedia` (skipped during SSR).
 */
export const ensureViewports = (): void => {
  if (initialized) return
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  setupViewports(defaultViewports)
}

/** Readonly handle to the shared reactive state, for composables. */
export const viewportRef = (): DeepReadonly<Ref<ViewportMatch | undefined>> => readonly(currentViewport)

/** Current value without subscribing reactively — used by the plugin getter. */
export const currentViewportValue = (): ViewportMatch | undefined => currentViewport.value

/** Reset all state. Intended for tests. */
export const resetViewports = (): void => {
  teardown?.()
  initialized = false
  currentViewport.value = undefined
}

export type { ViewportConfig, ViewportConfigList, ViewportMatch }
