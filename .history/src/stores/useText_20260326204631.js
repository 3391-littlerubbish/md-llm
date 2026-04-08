class LayMan {
  constructor(name, fn) {
    this.queue = []

    this.queue.push(() => {
      console.log(`${name}，你好！`);
    })

    setTimeout(() => {
      this.next()
    });
  }

  next() {

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
