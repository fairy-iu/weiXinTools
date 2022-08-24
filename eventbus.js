class Event {
  list = {}
  on(name, callback) {
    let eventName = this.list[name]
    if (!eventName) {
      eventName = []
    }
    eventName.push(callback)
    this.list[name] = eventName
  }
  off(name, fn) {
    let eventName = this.list[name]
    if (eventName && fn) {
      let index = eventName.find((item) => item === fn)
      this.list[name].splice(index, 1)
    }
  }
  emit() {
    let eventName = this.list[arguments[0]]
    let params = Array.prototype.slice.call(arguments, 1)
    if (eventName) {
      eventName.forEach((fn) => {
        fn.apply(this, params)
      })
    }
  }
  once(name, fn) {
    let wrapFnc = (...args) => {
      fn.apply(this, args)
      this.off(name, wrapFnc)
    }
    this.on(name, wrapFnc)
  }
}
