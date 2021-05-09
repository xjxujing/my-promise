import * as chai from 'chai'
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
chai.use(sinonChai)

const assert = chai.assert
import Promise from '../src/Promise'

// promise A+ doc: https://juejin.cn/post/6844903649852784647

describe('Promise', () => {
  it('是一个类', () => {
    // JS 中类就是函数
    // assert(typeof Promise === 'function') 
    // // 函数才会有 prototype 属性, 普通的对象是没有的
    // assert(typeof Promise.prototype === 'object')

    // 这里是简写
    assert.isFunction(Promise)
    assert.isObject(Promise.prototype)
  })

  it('new Promise() 必须接受一个函数', () => {
    assert.throw(() => {
      new Promise(132) // 接受数字会报错
    })
    assert.throw(() => {
      new Promise(false) // 接受布尔值会报错
    })
  })


  it('new Promise(fn) 生成的对象，对象有 then 方法', () => {
    assert.isFunction(new Promise(() => { }).then)
  })


  it('new Promise(fn) 中的 fn 立即执行', () => {
    // 老方法
    // let called = false
    // new Promise(() => {
    //   called = true
    // })
    // // 如果执行了 called 就不再是 false 了
    // assert.isNotFalse(called)

    // 使用 sinon, 更语义化
    const fn = sinon.fake() // 生成一个假的函数
    new Promise(fn)
    assert(fn.called) // 判断函数有没有执行
  })

  it('new Promise(fn) 中的 fn, 执行的时候接受 resolve 和 reject 两个函数', done => {
    new Promise((resolve, reject) => {
      assert.isFunction(resolve)
      assert.isFunction(reject)
      done() // 确保 assert 运行了，再结束
    })
  })


  it('promise.then(sucess) 里面的 sucess' +
    '会在 resolve 执行的时候执行', done => {

      const success = sinon.fake()
      const promise = new Promise((resolve, reject) => {
        assert.isFalse(success.called) // sucess 还没有调用
        resolve()
        setTimeout(() => {
          assert.isTrue(success.called) // sucess 调用过了
          done()
        })
      })
      promise.then(success)
    })

  it('promise.then(fail) 里面的 fail' +
    '会在 reject 执行的时候执行', done => {

      const fail = sinon.fake()
      const promise = new Promise((resolve, reject) => {
        assert.isFalse(fail.called) // sucess 还没有调用
        reject()
        setTimeout(() => {
          assert.isTrue(fail.called) // sucess 调用过了
          done()
        })
      })
      promise.then(null, fail)
    })


  it('2.2.1 如果 onFulfilled不是函数，必须忽略' +
    '如果 onRejected不是函数，必须忽略', () => {
      const promise = new Promise((resolve, reject) => {
        reject()
      })
      promise.then(false, null)
    })

  it('2.2.2' +
    'onFulfilled 必须在promise 完成(fulfilled)后被调用,并把 promise 的值作为它的第一个参数，' +
    '此函数在promise完成(fulfilled)之前绝对不能被调用，' +
    '此函数绝对不能被调用超过一次', done => {
      const fulfilled = sinon.fake()
      const promise = new Promise(resolve => {
        // assert(promise.state === 'pending') // 先不测
        assert.isFalse(fulfilled.called)
        resolve('第一次')
        resolve('第二次')
        setTimeout(() => {
          assert(promise.state === 'fulfilled')
          assert.isTrue(fulfilled.calledOnce)
          assert(fulfilled.calledWith('第一次'))
          done()
        })
      })

      promise.then(fulfilled)
    })


  it('2.2.3' +
    'onRejected 必须在promise rejected 后被调用,并把 promise 的值作为它的第一个参数，' +
    '此函数在promise rejected 之前绝对不能被调用，' +
    '此函数绝对不能被调用超过一次', done => {
      const rejected = sinon.fake()
      const promise = new Promise((resolve, reject) => {
        // assert(promise.state === 'pending') // 先不测
        assert.isFalse(rejected.called)
        reject('第一次')
        reject('第二次')
        setTimeout(() => {
          assert(promise.state === 'rejected')
          assert.isTrue(rejected.calledOnce)
          assert(rejected.calledWith('第一次'))
          done()
        })
      })

      promise.then(null, rejected)
    })

  it('2.2.4 代码执行完之前不能调用 then 传的两个函数 成功的回调', done => {
    const succced = sinon.fake()
    const promise = new Promise(resolve => {
      resolve()
    })
    promise.then(succced)
    // 下面是之后的代码
    assert.isFalse(succced.called)
    setTimeout(() => {
      assert.isTrue(succced.called)
    })
    done()
  })

  it('2.2.4 代码执行完之前不能调用 then 传的两个函数 失败的回调', done => {
    const filled = sinon.fake()
    const promise = new Promise((resolve, reject) => {
      reject()
    })
    promise.then(null, filled)
    // 下面是之后的代码
    assert.isFalse(filled.called)
    setTimeout(() => {
      assert.isTrue(filled.called)
    })
    done()
  })

  it('2.2.5 onFulfilled 和 onRejected 必须被当做函数调用 不要有 this', done => {
    const promise = new Promise(resolve => {
      resolve()
    })
    promise.then(() => {
      'use strict'
      assert(this === undefined)
      done()
    })
  })

  it('2.2.6 then 可以在同一个 promise 调用多次, resovle', done => {
    const promise = new Promise(resolve => {
      resolve()
    })

    const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
    promise.then(callbacks[0])
    promise.then(callbacks[1])
    promise.then(callbacks[2])

    setTimeout(() => {
      assert(callbacks[0].called)
      assert(callbacks[1].called)
      assert(callbacks[2].called)
      assert(callbacks[1].calledAfter(callbacks[0]))
      assert(callbacks[2].calledAfter(callbacks[1]))
      done()
    })

  })

  it('2.2.6 then 可以在同一个 promise 调用多次, reject', done => {
    const promise = new Promise((resolve, reject) => {
      reject()
    })

    const callbacks = [sinon.fake(), sinon.fake(), sinon.fake()]
    promise.then(null, callbacks[0])
    promise.then(null, callbacks[1])
    promise.then(null, callbacks[2])

    setTimeout(() => {
      assert(callbacks[0].called)
      assert(callbacks[1].called)
      assert(callbacks[2].called)
      assert(callbacks[1].calledAfter(callbacks[0]))
      assert(callbacks[2].calledAfter(callbacks[1]))
      done()
    })

  })
})