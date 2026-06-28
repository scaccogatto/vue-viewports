/**
 * A single viewport definition.
 *
 * `rule` is the CSS length at which the viewport starts (used as `min-width`),
 * e.g. `'768px'`. `label` is the human-readable name, e.g. `'tablet'`.
 */
export interface ViewportConfig {
  readonly rule: string
  readonly label: string
}

/**
 * The currently matching viewport, or `undefined` when no viewport matches
 * (e.g. a width smaller than the smallest configured `rule`).
 */
export type ViewportMatch = ViewportConfig

export type ViewportConfigList = readonly ViewportConfig[]
