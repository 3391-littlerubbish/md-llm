function myInstanceOf(obj, Constructor) {
  if (typeof obj !== 'object' || typeof obj === null) return false

  let proto = Object.getPrototypeOf(obj)
  while (proto !== null) {
    if (proto === Constructor.prototype) return true
    proto = Object.getPrototypeOf(proto)
  }

  return false
}

function Person() {
  this.name = name
}

obj = new Person('ellezhang')

myInstanceOf(obj, Person)
