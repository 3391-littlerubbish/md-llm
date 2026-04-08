Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || globalThis
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}

const Person = function (name) {
  this.name = name

  return {
    age: 19
  }
}

function myNew(Constructor, ...args) {
  const obj = {}
  Person.myApply(obj, [...args])

  obj.__proto__ = Person.prototype

  return obj
}

const p = myNew(Person, 'ellezhang')

