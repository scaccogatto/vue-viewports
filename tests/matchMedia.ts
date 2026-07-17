import { vi } from 'vitest'

type ChangeListener = (event: MediaQueryListEvent) => void
type Orientation = 'portrait' | 'landscape'

interface RegisteredQuery {
  readonly media: string
  readonly listeners: Set<ChangeListener>
}

export interface MatchMediaMock {
  /** Set the simulated viewport width (px) and fire `change` on every query. */
  setWidth: (width: number) => void
  /** Set the simulated orientation and fire `change` on every query. */
  setOrientation: (orientation: Orientation) => void
  /** Spy on `addEventListener` to assert the modern (non-deprecated) API is used. */
  readonly addEventListener: ReturnType<typeof vi.fn>
}

const numberFeature = (media: string, feature: 'min-width' | 'max-width'): number | undefined => {
  const match = new RegExp(`${feature}:\\s*(\\d+(?:\\.\\d+)?)px`).exec(media)
  return match ? Number.parseFloat(match[1]!) : undefined
}

const orientationFeature = (media: string): Orientation | undefined => {
  const match = /orientation:\s*(portrait|landscape)/.exec(media)
  return (match?.[1] as Orientation | undefined) ?? undefined
}

/**
 * A `window.matchMedia` mock with a single source-of-truth width + orientation:
 * every query derives `matches` from that state (`min-width`, `max-width`,
 * `orientation`, or the literal `'all'`), and `setWidth`/`setOrientation`
 * re-evaluate and fire `change` on all registered listeners — exercising real
 * breakpoint switching.
 */
export const installMatchMediaMock = (
  initialWidth = 1024,
  initialOrientation: Orientation = 'landscape',
): MatchMediaMock => {
  let width = initialWidth
  let orientation = initialOrientation
  const queries = new Set<RegisteredQuery>()
  const addEventListener = vi.fn()

  const evaluate = (media: string): boolean => {
    if (media === 'all') return true
    const min = numberFeature(media, 'min-width')
    const max = numberFeature(media, 'max-width')
    const ori = orientationFeature(media)
    if (min === undefined && max === undefined && ori === undefined) return false
    if (min !== undefined && width < min) return false
    if (max !== undefined && width > max) return false
    if (ori !== undefined && ori !== orientation) return false
    return true
  }

  const matchMedia = (media: string): MediaQueryList => {
    const listeners = new Set<ChangeListener>()
    queries.add({ media, listeners })
    return {
      media,
      get matches() {
        return evaluate(media)
      },
      onchange: null,
      addEventListener: (type: string, listener: ChangeListener) => {
        addEventListener(type, listener)
        if (type === 'change') listeners.add(listener)
      },
      removeEventListener: (type: string, listener: ChangeListener) => {
        if (type === 'change') listeners.delete(listener)
      },
      addListener: (listener: ChangeListener) => listeners.add(listener),
      removeListener: (listener: ChangeListener) => listeners.delete(listener),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList
  }

  vi.stubGlobal('matchMedia', matchMedia)

  const notify = (): void => {
    for (const { media, listeners } of queries) {
      const event = { media, matches: evaluate(media) } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    }
  }

  const setWidth = (next: number): void => {
    width = next
    notify()
  }

  const setOrientation = (next: Orientation): void => {
    orientation = next
    notify()
  }

  return { setWidth, setOrientation, addEventListener }
}
