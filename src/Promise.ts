class MyPromise {

  // 实例的属性， static 开头的是类的属性
  sucessedFn = null
  failedFn = null


  resolve() {
    setTimeout(() => {
      this.sucessedFn()
    })
  }

  reject() {
    setTimeout(() => {
      this.failedFn()
    })
  }

  constructor(fn) {
    if (typeof fn !== 'function') {
      throw new Error('接受的必须是函数')
    }
    fn(this.resolve.bind(this), this.reject)
  }

  then(sucessedFn: () => void, failedFn?: () => void) {
    this.sucessedFn = sucessedFn
    this.failedFn = failedFn
  }
}

export default MyPromise