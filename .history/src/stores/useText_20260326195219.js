Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || globalThis
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}

const fn = function (a, b, c) {
  return a + b + c
}

const curry = function (fn) {
  return function () { }
}

const curried = curry(fn)
const c1 = curried(1)
const c2 = c(2)
const result = c(3)
console.log(result);

