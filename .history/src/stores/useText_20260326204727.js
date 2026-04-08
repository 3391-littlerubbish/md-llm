class LayMan {
  constructor(name) {
    this.queue = []

    this.queue.push(() => {
      console.log(`${name}，你好！`);
    })

    setTimeout(() => {
      this.next()
    });
  }

  next() {
    const fn = this.queue.shift()
    fn && fn()
  }

  greet() {
    console.log('辛苦啦，未来是你的');
    this.next()
  }
  sleep() {
    setTimeout(() => {
      this.next()
    }, 2000);
  }
}
