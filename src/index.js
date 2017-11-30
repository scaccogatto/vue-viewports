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
    store.matchMedia.forEach(matchMediaObj => matchMediaObj.addListener(updateMatchStatus))

    // first trigger
    store.matchMedia.forEach(updateMatchStatus)

    // global call
    window.Object.defineProperty(Vue.prototype, '$currentViewport', {
      get: () => VueViewports._getPublicObject()
    })
  },
  get currentViewport () {
    return store.currentMatch
  },
  _getPublicObject () {
    const { currentViewport } = VueViewports
    if (typeof currentViewport !== 'undefined') {
      const { rule, label } = VueViewports.currentViewport
      return {
        get rule () {
          return rule
        },
        get label () {
          return label
        }
      }
    }
  }
}

export default VueViewports

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueViewports)
}
