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
  return function curried(...args1) {
    if (args.length >= fn.length) return fn.myApply(this, args1)

    return function (...args2) {
      return curried.apply(this, args2.concat(args1))
    }
  }
}

const curried = curry(fn)
const c1 = curried(1)
const c2 = c1(2)
const result = c2(3)
console.log(result);

