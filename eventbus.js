class Event {
  list = {}
  /**
   * 添加消息订阅
   * @param {Sting} name
   * @param {Function} callback
   */
  on(name, callback) {
    let eventName = this.list[name]
    if (!eventName) {
      eventName = []
    }
    eventName.push(callback)
    this.list[name] = eventName
  }
  /**
   * 移除消息订阅
   * @param {Sting} name
   * @param {Function} fn
   */
  off(name, fn) {
    let eventName = this.list[name]
    if (eventName && fn) {
      let index = eventName.find((item) => item === fn)
      this.list[name].splice(index, 1)
    }
  }
  /**
   * 发布消息
   * @param {String} name
   * @param  {...any} args
   */
  emit(name, ...args) {
    let eventName = this.list[name]
    if (eventName) {
      eventName.forEach((fn) => {
        fn.apply(this, args)
      })
    }
  }
  // emit() {
  //   let eventName = this.list[arguments[0]]
  //   let params = Array.prototype.slice.call(arguments, 1)
  //   if (eventName) {
  //     eventName.forEach((fn) => {
  //       fn.apply(this, params)
  //     })
  //   }
  // }
  /**
   * 只执行一次
   * @param {String} name
   * @param {Function} fn
   */
  once(name, fn) {
    let wrapFnc = (...args) => {
      fn.apply(this, args)
      this.off(name, wrapFnc)
    }
    this.on(name, wrapFnc)
  }
}
