import VueThrottleEvent from 'vue-throttle-event'

const VueViewports = {
  install (Vue, options = { 420: 'mobile', 768: 'tablet', 1024: 'desktop' }) {
    // setup event name
    let updateEventName = 'VueViewports$updateCurrentViewport'
    Vue.prototype.$viewportsUpdateEventName = updateEventName

    // setup a global variable
    VueViewports._updateCurrentViewport.call(undefined, Vue, options)

    // setup a global event listener
    VueThrottleEvent._throttle('resize', updateEventName, window)

    // listen for update
    window.addEventListener('VueViewports$updateCurrentViewport', VueViewports._updateCurrentViewport.bind(undefined, Vue, options))
  },
  _updateCurrentViewport (Vue, options) {
    Vue.prototype.$currentViewport = VueViewports._getCurrentViewport(options)
  },
  _getCurrentViewport (options) {
    // array-like keys, sorted
    let arrayOptions = Object.keys(options).sort((a, b) => { return a - b })

    // get window width
    let windowWidth = window.innerWidth

    // get compatible value
    let compatibleValue = arrayOptions.find((value) => { return value >= windowWidth })

    return options[compatibleValue]
  }
}

export default VueViewports

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueViewports)
}
