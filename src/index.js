import VueThrottleEvent from 'vue-throttle-event'

const VueViewports = {
  install (Vue, options = { 420: 'mobile', 768: 'tablet', 1024: 'desktop', 1920: 'hd-desktop', 2560: 'qhd-desktop', 3840: 'uhd-desktop' }) {
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
    let arrayOptions = VueViewports._sortOptions(options)

    // get window width
    let windowWidth = window.innerWidth

    // get compatible value 1024
    let compatibleValue = arrayOptions.reverse().find(value => { return windowWidth >= value })

    return {
      label: options[compatibleValue],
      value: compatibleValue,
      _windowWidth: windowWidth
    }
  },
  _sortOptions (options) {
    return Object.keys(options).map(Number).sort((a, b) => { return a - b })
  }
}

export default VueViewports

// in-browser load
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(VueViewports)
}
