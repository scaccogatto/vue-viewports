import 'core-js/fn/array/find'
import 'core-js/fn/string/includes'
import { store } from './store'

const toMatchMedia = size => window.matchMedia(toMediaQuery(size.rule))

const toMediaQuery = rule => `(min-width: ${rule})`

const updateMatchStatus = ({ media, matches }) => {
  // find the store rule, matching the event
  const rule = store.sizes.find(size => media.includes(size.rule)).rule

  if (matches) {
    // if it matches, just set the rule
    store.currentMatch = store.sizes.find(size => size.rule === rule)
  } else {
    // if it does not,find the greater matching rule and apply
    store.currentMatch = store.sizes.slice(0).reverse().find(size => window.matchMedia(toMediaQuery(size.rule)).matches)
  }
}

export { toMatchMedia, toMediaQuery, updateMatchStatus }
