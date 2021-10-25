import { Vue } from './install'

/* eslint-disable */
class Store {
  constructor (options) {
    let { state, getters, mutations, actions, module, strict } = options

    this.getters = {}
    this.mutations = {}
    this.actions = {}

    let computed = {}

    Object.keys(getters).forEach(key => {
      computed[key] = () => {
        return getters[key](this.state)
      }

      // 当去 getters 上取值的时候，代理到去 computed 上取值，利用 computed 的缓存作用
      Object.defineProperty(this.getters, key, {
        get: () => this._vm[key] // 使用箭头函数，保证 this 指向
      })
    })

    Object.keys(mutations).forEach(key => {
      this.mutations[key] = (payload) => {
        mutations[key].call(this, this.state, payload)
      }
    })

    Object.keys(actions).forEach(key => {
      this.actions[key] = (payload) => {
        actions[key].call(this, this, payload)
      }
    })

    this._vm = new Vue({
      data: {
        $$state: state
      },
      computed
    })
  }

  // store 里的 state 应该是响应式的数据，这样状态更改了页面才能更新
  get state () {
    return this._vm._data.$$state
  }

  commit = (type, palyload) => {
    this.mutations[type](palyload)
  }

  dispatch = (type, payload) => {
    this.actions[type](payload)
  }
}

export default Store
