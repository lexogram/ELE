/** resize.js **
 *
 * 
**/



;(function resizeLoaded(global){
  "use strict"


  let jazyx = global.jazyx

  if (!jazyx) {
    jazyx = global.jazyx = {}
  }



  class Resize {
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


  jazyx.resize = new Resize(jazyx.shortcuts)

})(window)