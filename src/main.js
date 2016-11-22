import { install } from './install'

export default class VueViewports {
  static install () {}

  constructor(options = { test: 'test' }) {
    this.options = options
  }
}

VueViewports.install = install
