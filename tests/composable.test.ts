import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, effectScope, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useMediaQuery, useViewport } from '../src/composable'
import { resetViewports } from '../src/core'
import { installMatchMediaMock, type MatchMediaMock } from './matchMedia'

let media: MatchMediaMock

beforeEach(() => {
  media = installMatchMediaMock(1024)
})

afterEach(() => {
  resetViewports()
  vi.unstubAllGlobals()
})

describe('useViewport', () => {
  it('lazily initializes default breakpoints and reacts to width changes', async () => {
    const Component = defineComponent({
      setup() {
        return { viewport: useViewport() }
      },
      template: '<p>{{ viewport ? viewport.label : "none" }}</p>',
    })
    const wrapper = mount(Component)

    media.setWidth(360)
    await nextTick()
    expect(wrapper.text()).toBe('mobile')

    media.setWidth(1300)
    await nextTick()
    expect(wrapper.text()).toBe('desktop')
  })

  it('returns a readonly ref whose value cannot be mutated', () => {
    const viewport = useViewport()
    media.setWidth(800)
    expect(viewport.value?.label).toBe('tablet')

    // @ts-expect-error readonly ref must reject writes at compile time
    viewport.value = { rule: '0px', label: 'hacked' }
    expect(viewport.value?.label).toBe('tablet')
  })

  it('shares a single reactive source across multiple call sites', () => {
    const a = useViewport()
    const b = useViewport()
    media.setWidth(2000)
    expect(a.value?.label).toBe('hd-desktop')
    expect(b.value?.label).toBe('hd-desktop')
  })

  it('is a no-op when matchMedia is unavailable (SSR guard)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const viewport = useViewport()
    expect(viewport.value).toBeUndefined()
  })
})

describe('useMediaQuery', () => {
  it('reflects a plain string query and reacts to changes', () => {
    const matches = useMediaQuery('(min-width: 768px)')
    expect(matches.value).toBe(true) // initial width (1024) already matches

    media.setWidth(400)
    expect(matches.value).toBe(false)

    media.setWidth(800)
    expect(matches.value).toBe(true)
  })

  it('returns a readonly ref whose value cannot be mutated', () => {
    const matches = useMediaQuery('(min-width: 768px)')
    media.setWidth(800)
    expect(matches.value).toBe(true)

    // @ts-expect-error readonly ref must reject writes at compile time
    matches.value = false
    expect(matches.value).toBe(true)
  })

  it('re-subscribes when a reactive (Ref) query changes', async () => {
    const query = ref('(min-width: 2000px)')
    const matches = useMediaQuery(query)
    expect(matches.value).toBe(false) // width 1024 < 2000

    query.value = '(min-width: 600px)'
    await nextTick()
    expect(matches.value).toBe(true) // width 1024 >= 600, re-evaluated for the new query

    // at width 900 the old query (2000px) would still read false, but the new
    // one (600px) reads true — proves the old listener was actually dropped,
    // not just that the new query happens to agree with a stale one
    media.setWidth(900)
    expect(matches.value).toBe(true)

    media.setWidth(400)
    expect(matches.value).toBe(false)
  })

  it('is false and a no-op when matchMedia is unavailable (SSR guard)', () => {
    vi.stubGlobal('matchMedia', undefined)
    const matches = useMediaQuery('(min-width: 600px)')
    expect(matches.value).toBe(false)
  })

  it('is false on the server when window itself is undefined (SSR)', () => {
    vi.stubGlobal('window', undefined)
    const matches = useMediaQuery('(min-width: 600px)')
    expect(matches.value).toBe(false)
  })

  it('removes the matchMedia listener when its effect scope is disposed', () => {
    const scope = effectScope()
    let matches!: ReturnType<typeof useMediaQuery>
    scope.run(() => {
      matches = useMediaQuery('(min-width: 600px)')
    })

    media.setWidth(700)
    expect(matches.value).toBe(true)

    scope.stop()

    media.setWidth(400) // would flip to false if the listener were still attached
    expect(matches.value).toBe(true)
  })

  it('works outside any effect scope (no automatic cleanup)', () => {
    const matches = useMediaQuery('(min-width: 600px)')
    media.setWidth(700)
    expect(matches.value).toBe(true)
  })
})
