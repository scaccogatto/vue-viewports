!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.VueViewports=t():e.VueViewports=t()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,t,n){Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=1)}([function(e,t,n){!function(t,n){e.exports=n()}(this,function(){return function(e){function t(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var n={};return t.m=e,t.c=n,t.i=function(e){return e},t.d=function(e,t,n){Object.defineProperty(e,t,{configurable:!1,enumerable:!0,get:n})},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n={install:function(e){e.prototype.$throttle=n._throttle},_throttle:function(e,t,n){n=n||this.$el;var r=!1,o=function(){r||(r=!0,requestAnimationFrame(function(){n.dispatchEvent(new CustomEvent(t)),r=!1}))};n.addEventListener(e,o)}};t.default=n,"undefined"!=typeof window&&window.Vue&&window.Vue.use(n)}])})},function(e,t,n){"use strict";function r(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var o=n(0),u=r(o),i={install:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{420:"mobile",768:"tablet",1024:"desktop",1920:"hd-desktop",2560:"qhd-desktop",3840:"uhd-desktop"},n="VueViewports$updateCurrentViewport";e.prototype.$viewportsUpdateEventName=n,i._updateCurrentViewport.call(void 0,e,t),u.default._throttle("resize",n,window),window.addEventListener("VueViewports$updateCurrentViewport",i._updateCurrentViewport.bind(void 0,e,t))},_updateCurrentViewport:function(e,t){e.prototype.$currentViewport=i._getCurrentViewport(t)},_getCurrentViewport:function(e){var t=Object.keys(e).sort(function(e,t){return e-t}),n=window.innerWidth,r=t.find(function(e){return e>=n});return{label:e[r],value:r,_windowWidth:n}}};t.default=i,"undefined"!=typeof window&&window.Vue&&window.Vue.use(i)}])});