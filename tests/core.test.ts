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
  it('builds a min-width media query from a rule', () => {
    expect(toMediaQuery('768px')).toBe('(min-width: 768px)')
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

    teardown() // teardown from the first setup must be a no-op now
    media.setWidth(620)
    expect(current.value?.label).toBe('small')
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
