import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  computeMatch,
  defaultViewports,
  resetViewports,
  setupViewports,
  toMediaQuery,
  viewportRef,
} from '../src/core'
import { installMatchMediaMock, type MatchMediaMock } from './matchMedia'

let media: MatchMediaMock

beforeEach(() => {
  media = installMatchMediaMock(1024)
})

afterEach(() => {
  resetViewports()
  vi.unstubAllGlobals()
})

describe('toMediaQuery', () => {
  it('builds a min-width media query from a legacy numeric rule', () => {
    expect(toMediaQuery('768px')).toBe('(min-width: 768px)')
  })

  it('passes a raw media-query string through verbatim', () => {
    expect(toMediaQuery('(orientation: landscape)')).toBe('(orientation: landscape)')
  })

  it('compiles a range rule with min only', () => {
    expect(toMediaQuery({ min: 600 })).toBe('(min-width: 600px)')
  })

  it('compiles a range rule with max only', () => {
    expect(toMediaQuery({ max: 900 })).toBe('(max-width: 900px)')
  })

  it('compiles a range rule with orientation only', () => {
    expect(toMediaQuery({ orientation: 'portrait' })).toBe('(orientation: portrait)')
  })

  it('compiles a range rule combining min, max and orientation', () => {
    expect(toMediaQuery({ min: 600, max: 900, orientation: 'landscape' })).toBe(
      '(min-width: 600px) and (max-width: 900px) and (orientation: landscape)',
    )
  })

  it('compiles an empty range rule to "all" (always matches)', () => {
    expect(toMediaQuery({})).toBe('all')
  })
})

describe('computeMatch — extended breakpoint forms', () => {
  it('matches an object range rule (min/max)', () => {
    const viewports = [{ rule: { min: 600, max: 900 }, label: 'mid' }]

    media.setWidth(700)
    expect(computeMatch(viewports)).toEqual({ rule: { min: 600, max: 900 }, label: 'mid' })

    media.setWidth(1000)
    expect(computeMatch(viewports)).toBeUndefined()
  })

  it('matches an orientation-only object rule', () => {
    const viewports = [{ rule: { orientation: 'portrait' as const }, label: 'tall' }]

    media.setOrientation('landscape')
    expect(computeMatch(viewports)).toBeUndefined()

    media.setOrientation('portrait')
    expect(computeMatch(viewports)).toEqual({ rule: { orientation: 'portrait' }, label: 'tall' })
  })

  it('matches a raw media-query string rule, sorted below width-based rules', () => {
    const viewports = [
      { rule: '(orientation: landscape)', label: 'wide' },
      { rule: '768px', label: 'tablet' },
    ]

    media.setWidth(400) // below 'tablet', so only the raw rule can match
    media.setOrientation('portrait')
    expect(computeMatch(viewports)).toBeUndefined()

    media.setOrientation('landscape')
    expect(computeMatch(viewports)).toEqual({ rule: '(orientation: landscape)', label: 'wide' })
  })

  it('prefers a matching width-based rule over a rule with no numeric width when both match', () => {
    const viewports = [
      { rule: { orientation: 'landscape' as const }, label: 'landscape-only' },
      { rule: '768px', label: 'tablet' },
    ]
    media.setWidth(800)
    media.setOrientation('landscape')
    expect(computeMatch(viewports)).toEqual({ rule: '768px', label: 'tablet' })
  })

  it('falls back to a rule with no numeric width when it is the only match', () => {
    const viewports = [
      { rule: { orientation: 'landscape' as const }, label: 'landscape-only' },
      { rule: '2000px', label: 'huge' },
    ]
    media.setWidth(400)
    media.setOrientation('landscape')
    expect(computeMatch(viewports)).toEqual({
      rule: { orientation: 'landscape' },
      label: 'landscape-only',
    })
  })
})

describe('computeMatch', () => {
  it('returns the largest matching viewport', () => {
    media.setWidth(1300)
    expect(computeMatch(defaultViewports)).toEqual({ rule: '1024px', label: 'desktop' })
  })

  it('returns undefined when the width is below the smallest rule', () => {
    media.setWidth(200)
    expect(computeMatch(defaultViewports)).toBeUndefined()
  })

  it('ignores configuration order and matches by width', () => {
    const unordered = [
      { rule: '1024px', label: 'desktop' },
      { rule: '320px', label: 'mobile' },
      { rule: '768px', label: 'tablet' },
    ]
    media.setWidth(800)
    expect(computeMatch(unordered)).toEqual({ rule: '768px', label: 'tablet' })
  })
})

describe('setupViewports', () => {
  it('reactively switches the current viewport on width changes (issue #6)', () => {
    setupViewports(defaultViewports)
    const current = viewportRef()

    media.setWidth(360)
    expect(current.value?.label).toBe('mobile')

    media.setWidth(800)
    expect(current.value?.label).toBe('tablet')

    media.setWidth(2000)
    expect(current.value?.label).toBe('hd-desktop')

    media.setWidth(100)
    expect(current.value).toBeUndefined()
  })

  it('uses the modern addEventListener("change") API, not the deprecated addListener', () => {
    setupViewports(defaultViewports)
    expect(media.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
    expect(media.addEventListener).toHaveBeenCalledTimes(defaultViewports.length)
  })

  it('is idempotent: re-setup tears down prior listeners so updates are not duplicated', () => {
    const teardown = setupViewports(defaultViewports)
    setupViewports([{ rule: '600px', label: 'small' }])
    const current = viewportRef()

    media.setWidth(700)
    expect(current.value?.label).toBe('small')

    teardown() // stale teardown from the first setup must not affect active state
    media.setWidth(620)
    expect(current.value?.label).toBe('small')

    // the active setup is still disposable after a stale teardown call
    resetViewports()
    media.setWidth(700)
    expect(current.value).toBeUndefined()
  })

  it('returns a teardown that stops further updates', () => {
    const teardown = setupViewports(defaultViewports)
    const current = viewportRef()
    media.setWidth(800)
    expect(current.value?.label).toBe('tablet')

    teardown()
    media.setWidth(2000)
    expect(current.value?.label).toBe('tablet')
  })

  it('defaults to the built-in viewports', () => {
    setupViewports()
    const current = viewportRef()
    media.setWidth(5000)
    expect(current.value?.label).toBe('uhd-desktop')
  })
})
