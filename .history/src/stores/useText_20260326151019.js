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

const debounce = function (fn, immediate, delay) {
  let timer = null
  return function (value) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.myApply(this, value)
    }, delay);
  }
}

const debounced = debounce(fn, true, 1000)
debounced('elle')
debounced('ellezhang')
