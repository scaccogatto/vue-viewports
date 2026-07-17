/** `orientation` media feature values. */
export type ViewportOrientation = 'portrait' | 'landscape'

/**
 * A range-based breakpoint: any combination of `min`/`max` width (px) and
 * `orientation`. Compiled to a `min-width`/`max-width`/`orientation` media
 * query, ANDed together (an empty object compiles to `all`, i.e. always matches).
 */
export interface ViewportRangeRule {
  readonly min?: number
  readonly max?: number
  readonly orientation?: ViewportOrientation
}

/**
 * A breakpoint's matching rule. One of:
 * - a legacy CSS length string used as `min-width`, e.g. `'768px'` (no parentheses);
 * - a raw media-query string, used verbatim, e.g. `'(orientation: landscape)'`
 *   (distinguished from the legacy form by containing a `(`);
 * - a {@link ViewportRangeRule} object.
 */
export type ViewportRule = string | ViewportRangeRule

/**
 * A single viewport definition.
 *
 * `rule` is the matching condition — see {@link ViewportRule}.
 * `label` is the human-readable name, e.g. `'tablet'`.
 */
export interface ViewportConfig {
  readonly rule: ViewportRule
  readonly label: string
}

/**
 * The currently matching viewport, or `undefined` when no viewport matches
 * (e.g. a width smaller than the smallest configured `rule`).
 */
export type ViewportMatch = ViewportConfig

export type ViewportConfigList = readonly ViewportConfig[]
