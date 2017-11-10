# vue-viewports

> define your custom viewports and use them in your components

## Features

- Uses [matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia)
- Exposes a fully updated viewport name

## Installation

### npm

```shell
npm install vue-viewports --save-dev
```

### Vue's main.js

```js
import VueViewports from 'vue-viewports'

const options = [
  {
    rule: '320px',
    label: 'mobile'
  },
  {
    rule: '768px',
    label: 'tablet'
  },
  {
    rule: '1024px',
    label: 'desktop'
  },
  {
    rule: '1920px',
    label: 'hd-desktop'
  },
  {
    rule: '2560px',
    label: 'qhd-desktop'
  },
  {
    rule: '3840px',
    label: 'uhd-desktop'
  }
]

Vue.use(VueViewports, options)
```

### Arguments

- options [optional]: object defining a set of `{ rule: value, label: value }` where 'rule' is the number value where the viewport starts (included) and the 'label' is the viewport's name, **defaults** on previous example

## Example

```js
{
  if (this.$currentViewport.label === 'tablet') {
    // from 768px (included) to 1024px (excluded)
  } else {
    // anything else
  }
}
```

## Variables

- `$currentViewport`: the current viewport object, defined by `rule`, `label`; `undefined` if no match.

> Feel free to contribute and ask questions!
