import { store, defaultOptions } from './store'
import { toMatchMedia, updateMatchStatus } from './matchMedia'

const VueViewports = {
  install (Vue, options = defaultOptions) {
    // save sizes
    store.sizes = options

    // create matchMediaObjects https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia
    const matchMedia = store.sizes.map(toMatchMedia)

    // save it
    store.matchMedia = matchMedia

    // add listeners
    store.matchMedia.forEach(matchMediaObj => matchMediaObj.addEventListener('change', updateMatchStatus))

    // first trigger
    store.matchMedia.forEach(matchMediaObj => {
      const { media, matches } = matchMediaObj
      matchMediaObj.dispatchEvent(new window.MediaQueryListEvent('change', { media, matches }))
    })

    // global call
    Vue.prototype.$currentViewport = VueViewports.currentViewport
  },
  get currentViewport () {
    return store.currentMatch
  }
}

export default VueViewports

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueViewports)
}
