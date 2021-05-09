import * as chai from 'chai'

const assert = chai.assert
import Promise from '../src/Promise'

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
    let called = false
    new Promise(() => {
      called = true
    })
    // 如果执行了 called 就不再是 false 了
    assert.isNotFalse(called)
  })

  it('new Promise(fn) 中的 fn, 执行的时候接受 resolve 和 reject 两个函数', () => {
    new Promise((resolve, reject) => {
      assert.isFunction(resolve)
      assert.isFunction(reject)
    })
  })


  it('promise.then(sucess) 里面的 sucess' + 
  '会在 resolve 执行的时候执行', done => {
    let called = false

    const promise = new Promise((resolve, reject) => {
      assert(called === false)
      resolve()
      setTimeout(() => {
        assert(called === true)
        done()
      })
    })

    promise.then(() => {
      called = true
    })
  })
})