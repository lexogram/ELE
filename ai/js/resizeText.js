/** resizeText.js **
 *
 * 
**/



;(function resizeTextLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }


  class WindowResize {
    constructor(shortcuts) {
      let listener = this.windowResize.bind(this)
      window.addEventListener("resize", listener, true)


      this.elements  = []
      this.listeners = []
    }


    windowResize(event) {
      this._broadcastEvent()
    }


    register(element, callback) {
      let index = this.elements.indexOf(element)
      let listeners

      if (index < 0) {
        index = this.elements.length
        this.elements.push(element)

        listeners = []
        this.listeners[index] = listeners

      } else {
        listeners = this.listeners[index]
      }

      listeners.push(callback)
    }


    deregister(element) {
      let index = this.elements.indexOf(element)

      if (index < 0) {
        return
      }

      this.elementLUT[index] = this.listeners[index] = 0
    }


    _broadcastEvent() {
      this.elements.forEach((element, index) => {
        if (element) {
          let listeners = this.listeners[index]

          listeners.forEach((listener) => {
            listener(element)
          })
        }
      })
    }

  }


  class ResizeText {
    constructor(resizer) {
      let selector = ".fit-parent-height"
      let elements = [].slice.call(document.querySelectorAll(selector))
      let listener = this.fitParentHeight.bind(this)

      elements.forEach((element) => {
        resizer.register(element, listener)
        listener(element)
      })
    }


    fitParentHeight(element) {
      if (!element.offsetParent) {
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
        // element.offsetParent returns null when the element has
        // style.display set to none. 
        return
      }

      let fontSize = parseFloat(window.getComputedStyle(element).fontSize)
      let parent = element.parentNode
      let targetHeight = parent.getBoundingClientRect().height
      let step = 16
      let direction = "TBD"
      let increase = "increase"
      let decrease = "decrease"
      let elementHeight
        , delta

      while (elementHeight = getHeightOf(element)) {
        delta = targetHeight - elementHeight

        if (delta) {
          if (delta > 0) {
            if (delta < 24) {
              break
            }

            // INCREASE FONT SIZE
            if (direction !== increase) {
              step /= 2
              direction = increase
            }

            fontSize += step
          } else {
            // DECREASE FONT SIZE
            if (direction !== decrease) {
              step /= 2
              direction = decrease
            }

            fontSize -= step
          }

          element.style.fontSize = fontSize + "px"
        }
      }


      function getHeightOf(element) {
        let top = element.getBoundingClientRect().top
        let bottom = element.lastElementChild.getBoundingClientRect().bottom
        return bottom - top
      }
    }
  }


  jazyx.resizeText = new ResizeText(new WindowResize())

})(window)