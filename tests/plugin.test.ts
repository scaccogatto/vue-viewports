import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, inject, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { VueViewports, viewportInjectionKey } from '../src/plugin'
import { resetViewports } from '../src/core'
import type { ViewportMatch } from '../src/types'
import { installMatchMediaMock, type MatchMediaMock } from './matchMedia'

let media: MatchMediaMock

beforeEach(() => {
  media = installMatchMediaMock(1024)
})

afterEach(() => {
  resetViewports()
  vi.unstubAllGlobals()
})

const Labeled = defineComponent({
  template: '<span>{{ $currentViewport ? $currentViewport.label : "none" }}</span>',
})

describe('VueViewports plugin', () => {
  it('re-renders components via $currentViewport when the viewport switches (issue #6)', async () => {
    const wrapper = mount(Labeled, { global: { plugins: [VueViewports] } })

    media.setWidth(360)
    await nextTick()
    expect(wrapper.text()).toBe('mobile')

    media.setWidth(800)
    await nextTick()
    expect(wrapper.text()).toBe('tablet')

    media.setWidth(100)
    await nextTick()
    expect(wrapper.text()).toBe('none')
  })

  it('honors custom viewports passed as plugin options', async () => {
    const wrapper = mount(Labeled, {
      global: { plugins: [[VueViewports, [{ rule: '600px', label: 'small' }]]] },
    })

    media.setWidth(700)
    await nextTick()
    expect(wrapper.text()).toBe('small')

    media.setWidth(400)
    await nextTick()
    expect(wrapper.text()).toBe('none')
  })

  it('provides an injectable readonly ref', async () => {
    let injected: { value: ViewportMatch | undefined } | undefined
    const Consumer = defineComponent({
      setup() {
        injected = inject(viewportInjectionKey)
        return () => h('div')
      },
    })
    mount(Consumer, { global: { plugins: [VueViewports] } })

    media.setWidth(800)
    await nextTick()
    expect(injected?.value?.label).toBe('tablet')
  })

  it('is authoritative: installing after a composable lazy-init overrides defaults', async () => {
    const { useViewport } = await import('../src/composable')
    const viewport = useViewport() // lazy default-init first
    media.setWidth(800)
    expect(viewport.value?.label).toBe('tablet') // default config sees "tablet"

    const wrapper = mount(Labeled, {
      global: { plugins: [[VueViewports, [{ rule: '600px', label: 'small' }]]] },
    })
    await nextTick()
    expect(wrapper.text()).toBe('small') // plugin's custom config wins
    expect(viewport.value?.label).toBe('small') // shared singleton reflects it
  })
})
