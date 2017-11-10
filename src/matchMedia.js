import 'core-js/fn/array/find'
import { store } from './store'

const toMatchMedia = size => window.matchMedia(toMediaQuery(size.rule))

const toMediaQuery = rule => `(min-width: ${rule})`

const updateMatchStatus = e => {
  // find the store rule, matching the event
  const rule = store.sizes.find(size => e.media.includes(size.rule)).rule

  if (e.matches) {
    // if it matches, just set the rule
    store.currentMatch = store.sizes.find(size => size.rule === rule)
  } else {
    // if it does not,find the greater matching rule and apply
    store.currentMatch = store.sizes.slice(0).reverse().find(size => window.matchMedia(toMediaQuery(size.rule)).matches)
  }
}

export { toMatchMedia, toMediaQuery, updateMatchStatus }
