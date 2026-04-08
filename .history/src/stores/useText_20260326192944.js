Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || globalThis
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}
