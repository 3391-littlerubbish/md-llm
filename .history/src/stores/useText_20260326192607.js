class EventEmitter {
  constructor() {
    this.events = []
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

function fn(value) {
  console.log(value);
}

const emitter = new EventEmitter()
emitter.on('click', fn)
emitter.emit('click', 1)
emitter.off('click', fn)
emitter.emit('click', 2)
