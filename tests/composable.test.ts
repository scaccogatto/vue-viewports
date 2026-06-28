import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { useViewport } from '../src/composable'
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
