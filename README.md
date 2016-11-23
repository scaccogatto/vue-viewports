# vue-viewports

> define your custom viewports and use them in your components

## Features

- Uses [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- Exposes a fully updated viewport name
- Exposes the event name fired by requestAnimationFrame

## Installation

### npm
```
$ npm install vue-viewports
```

### Vue's main.js
```js
import VueViewports from 'vue-viewports'

Vue.use(VueViewports, {
  320: 'mobile',
  1024: 'tablet',
  1920: 'desktop'
})
```
### Arguments
- options [optional]: object defining a set of `{ key: value }` where 'key' is the number value (px) where the viewport ends and the 'value' is the viewport's name

## Example
```js
{
  if (this.$currentViewport === 'mobile') {
    // mobile viewport
  } else {
    // more than mobile
  }
}
```

## API

## Variables
- `$currentViewport`: the current viewport name (updated as the window resizes)
- `$viewportsUpdateEventName`: the event name, called on window (you can catch it if needed)
