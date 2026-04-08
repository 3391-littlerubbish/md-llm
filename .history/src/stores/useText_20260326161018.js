class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(event, fn) {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(fn)
  }

}

const emitter = new EventEmitter()
