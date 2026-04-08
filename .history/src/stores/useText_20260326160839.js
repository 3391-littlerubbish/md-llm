class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(event, fn) {
    if (this.events[event]) {
      this.events[event].push(fn)
    } else {
      this.events[event] = []
    }
  }
}

const emitter = new EventEmitter()
