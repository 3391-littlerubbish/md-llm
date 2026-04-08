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
    if (immediate && !timer) {
      fn.myApply(this, value)
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.myApply(this, value)
      timer = null
    }, delay);
  }
}

const debounced = debounce(fn, false, 1000)
debounced('elle')
debounced('ellezhang')
debounced('ellezhangzhang')
