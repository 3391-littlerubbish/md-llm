Function.prototype.myApply = function (newThis, arg = []) {
  newThis = newThis || window
  const fn = Symbol('fn')

  newThis[fn] = this

  const result = newThis[fn](...arg)
  delete newThis[fn]

  return result
}

const debounce = function (fn, delay, immediate = false) {
  // fn --每次触发所调用的函数
  let timer = null
  return function (...values) {
    // 除了第一次触发，其他均删除前一次timer，使前一次timer来不及执行就开启了新一次timer，这样就达到了防抖的效果
    if (timer) clearTimeout(timer)

    // 第一次触发需发送请求
    if (immediate && !timer) {
      const res = fn.myApply(this, [...values])
      return res
    }

    timer = setTimeout(() => {
      fn.myApply(this, [...values])

      // 当最后一次的timer执行到setTimerout后，消除最后一次的timer，一遍新一轮触发能够实现immediate
      timer = null
    }, delay);
  }
}

function fn(values) {
  console.log(values);
}

const debounced = debounce(fn, 500, true)

// 模拟输入效果进行测试，参数模拟input的value
debounced('elle')
debounced('elle zhang')
