export function install (Vue) {
  if (install.installed) return
  install.installed = true

  Object.defineProperty(Vue.prototype, '$viewports', {
    get () {
      console.log('testing vue directives ' + this.options.test)
    }
  })
}
