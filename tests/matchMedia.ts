import { vi } from 'vitest'

type ChangeListener = (event: MediaQueryListEvent) => void

interface RegisteredQuery {
  readonly media: string
  readonly listeners: Set<ChangeListener>
}

export interface MatchMediaMock {
  /** Set the simulated viewport width (px) and fire `change` on every query. */
  setWidth: (width: number) => void
  /** Spy on `addEventListener` to assert the modern (non-deprecated) API is used. */
  readonly addEventListener: ReturnType<typeof vi.fn>
}

const minWidthOf = (media: string): number | undefined => {
  const match = /min-width:\s*(\d+(?:\.\d+)?)px/.exec(media)
  return match ? Number.parseFloat(match[1]!) : undefined
}

/**
 * A `window.matchMedia` mock with a single source-of-truth width: every query
 * derives `matches` from that width, and `setWidth` re-evaluates and fires
 * `change` on all registered listeners — exercising real breakpoint switching.
 */
export const installMatchMediaMock = (initialWidth = 1024): MatchMediaMock => {
  let width = initialWidth
  const queries = new Set<RegisteredQuery>()
  const addEventListener = vi.fn()

  const matchMedia = (media: string): MediaQueryList => {
    const listeners = new Set<ChangeListener>()
    queries.add({ media, listeners })
    const matches = (): boolean => {
      const min = minWidthOf(media)
      return min === undefined ? false : width >= min
    }
    return {
      media,
      get matches() {
        return matches()
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

  const setWidth = (next: number): void => {
    width = next
    for (const { media, listeners } of queries) {
      const min = minWidthOf(media)
      const event = { media, matches: min !== undefined && width >= min } as MediaQueryListEvent
      listeners.forEach((listener) => listener(event))
    }
  }

  return { setWidth, addEventListener }
}
