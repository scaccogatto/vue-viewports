export default class VueViewports {
  static install (Vue, options = { 320: 'mobile', 1024: 'tablet', 1920: 'desktop' }) {
    // setup event name
    let updateEventName = 'VueViewports$updateCurrentViewport'
    Vue.prototype.$viewportsUpdateEventName = updateEventName

    // setup a global variable
    VueViewports._updateCurrentViewport.call(undefined, Vue, options)

    // setup a global event listener
    VueViewports._throttle('resize', updateEventName, window)

    // listen for update
    window.addEventListener('VueViewports$updateCurrentViewport', VueViewports._updateCurrentViewport.bind(undefined, Vue, options))
  }

  static _updateCurrentViewport (Vue, options) {
    Vue.prototype.$currentViewport = VueViewports._getCurrentViewport(options)
  }

  static _getCurrentViewport (options) {
    // array-like keys, sorted
    let arrayOptions = Object.keys(options).sort((a, b) => { return a - b })

    // get window width
    let windowWidth = window.innerWidth

    // get compatible value
    let compatibleValue = arrayOptions.find((value) => { return value >= windowWidth })

    return options[compatibleValue]
  }

  static _throttle (type, name, obj) { // TODO: move this in another plugin
    // define the main context, if not defined go fo 'window' top context
    obj = obj || window

    let running = false
    let func = () => {
      if (running) return

      running = true
      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name))
        running = false
      })
    }

    obj.addEventListener(type, func)
  }
}
