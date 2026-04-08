Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || window
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}

const fn = function (value) {
  console.log(value);
}

const debounce = function () {

}

const debounced = debounce(fn, ...values)
debounced('elle')
debounced('ellezhang')
