Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || globalThis
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}

const fn = function (value) {
  console.log(value);

}

const throttle = function (fn, interval) {
  let last = 0
  return function (value) {
    const now = Date.now()
    if (now - last >= interval) {
      fn.myApply(this, [value])
      last = now
    }
  }
}
const th = throttle(fn, 1)

th('e')
th('el')
th('ell')
th('elle')
th('elle ')
th('elle z')
th('elle zh')
th('elle zha')
th('elle zhan')
th('elle zhang')
th('elle zhang h')
th('elle zhang he')
th('elle zhang hel')
th('elle zhang hell')
th('elle zhang hello')
