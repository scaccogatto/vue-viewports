const assert      = require('assert')
const jsdom       = require('mocha-jsdom')
const shuffle     = require('knuth-shuffle').knuthShuffle
const arrayEquals = require('array-equal')

const VueViewports = require('../dist/vue-viewports.js').default

describe('VueViewports', () => {
  // DOM teardown
  jsdom()
  let Vue
  let defaults, shuffled

  beforeEach (() => {
    defaults = { 420: 'mobile', 768: 'tablet', 1024: 'desktop', 1920: 'hd-desktop', 2560: 'qhd-desktop', 3840: 'uhd-desktop' }
    shuffled = { 768: 'tablet', 420: 'mobile', 2560: 'qhd-desktop', 3840: 'uhd-desktop', 1024: 'desktop', 1920: 'hd-desktop' }
    Vue = { prototype: {} }

    let integerDefaults = Object.keys(defaults).map(Number)
    window.innerWidth = Math.abs(Math.floor(Math.random() * (Math.min.apply(null, integerDefaults) - (Math.max.apply(null, integerDefaults) + 1)) + Math.min.apply(null, integerDefaults)))
  })

  describe('variables', () => {
    it ('Vue should be an Object', () => {
      assert.strictEqual(typeof Vue, 'object')
    })

    it ('Vue.prototype should be an Object', () => {
      assert.strictEqual(typeof Vue.prototype, 'object')
    })

    it ('window should be an Object', () => {
      assert.strictEqual(typeof window, 'object')
    })

    it ('window.innerWidth should be an Integer', () => {
      assert.ok(Number.isInteger(window.innerWidth))
    })
  })

  describe('_sortOptions', () => {
    it ('should have the same lenght between input and output', () => {
      assert.equal(Object.keys(defaults).lenght, VueViewports._sortOptions(defaults).lenght)
    })

    it ('should sort numeric keys on a Object', () => {
      assert.ok(arrayEquals(Object.keys(defaults).map(Number), VueViewports._sortOptions(shuffled)))
    })
  })

  describe('_getCurrentViewport', () => {
    it ('should output a valid Object', () => {
      assert.strictEqual(typeof VueViewports._getCurrentViewport(defaults), 'object')
    })

    it ('should respect the doc labels', () => {
      assert.ok(arrayEquals(Object.keys(VueViewports._getCurrentViewport(defaults)), ['label', 'value', '_windowWidth']))
    })

    it ('should return a matching label with the value', () => {
      let currentViewport = VueViewports._getCurrentViewport(defaults)
      assert.equal(currentViewport.label, defaults[currentViewport.value])
    })

    it ('should return the mathing labels when the viewports are on the edge', () => {
      let test = () => {
        let iterable = new Map(Object.entries(defaults))
        for (let [key, value] of iterable) {
          window.innerWidth = key
          if (VueViewports._getCurrentViewport(defaults).label != defaults[key]) return false
        }

        return true
      }

      assert.ok(test())
    })
  })

  describe('_updateCurrentViewport', () => {
    it ('should update Vue.prototype.$currentViewport', () => {
      let currentValue = Vue.prototype.$currentViewport
      VueViewports._updateCurrentViewport(Vue, defaults)

      assert.notEqual(currentValue, Vue.prototype.$currentViewport)
    })
  })

  describe('install', () => {
    it ('should set the event\'s name correctly', () => {
      VueViewports.install(Vue, defaults)
      assert.equal(Vue.prototype.$viewportsUpdateEventName, 'VueViewports$updateCurrentViewport')
    })

    it ('should fire _updateCurrentViewport when event is fired', () => {
      VueViewports.install(Vue, defaults)
      window.dispatchEvent(new window.CustomEvent(Vue.prototype.$viewportsUpdateEventName))
      assert.notStrictEqual(typeof Vue.prototype.$currentViewport, 'undefined')
    })
  })
})
