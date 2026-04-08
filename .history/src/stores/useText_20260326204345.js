class LayMan {
  constructor(name) {
    this.queue = []

    this.queue.push(() => {
      console.log(`${name}，你好！`);

    })
  }
}
