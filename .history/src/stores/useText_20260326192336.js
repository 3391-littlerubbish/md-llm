class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(event, fn) {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(fn)
  }
  off(event, fn) {
    if (!this.events[event]) {
      return false
    } else {
      this.events[event] = this.events[event].filter(item => item !== fn)
      return true
    }
  }
  emit(event, ...args) {
    this.events[event].forEach(item => {
      item(...args)
    });
  }
  once(event, fn) {
    const wrapper = (...args) => {
      fn(...args)
      this.off(event, fn)
    }
    this.on(event, wrapper)
  }
}

const emitter = new EventEmitter()
