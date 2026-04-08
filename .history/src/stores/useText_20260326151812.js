Function.prototype.myCall = function (newThis, ...arg) {

  // 原理：将 某函数的调用 转变为 newThis调用某函数

  newThis = newThis || window
  const fn = Symbol('fn')

  newThis[fn] = this

  // this --当前myCall函数的调用者，可以往下看看，会发现调用者是greet
  // newThis[fn]=function(){} --给newThis对象添加fn属性，属性值为function(){}

  const result = newThis[fn](...arg)
  delete newThis[fn] // 记得删除newThis的fn属性，防止占用空间

  return result
}

const fn = function (value) {
  console.log(value);
}

const debounce = function (fn, immediate, delay) {
  let timer = null
  return function (value) {
    if (immediate && !timer) {
      return fn.myCall(this, value)
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.myCall(this, value)
      timer = null
    }, delay);
  }
}

const debounced = debounce(fn, true, 1000)
debounced('elle')
debounced('ellezhang')
debounced('ellezhangzhang')
