import Vue from 'vue'
import Module from './module/module'
import ModuleCollection from './module/module-collection'

function getNewState (store, path) {
  return path.reduce((prev, next) => {
    return prev[next]
  }, store.state)
}

function installModules (store, rootState, path, module) {
  const namespace = store._modules.getNamespace(path)
  module.forEachGetters((key, fn) => {
    store._wrapperGetters[namespace + key] = function () {
      // return fn.call(store, module.state)
      return fn.call(store, getNewState(store, path)) // 这里使用 getNewState 主要是因为如果插件中使用了 store 的 replaceState 方法，state 中的数据会变化，所以使用 getNewState 方法获取最新的 state
    }
  })

  module.forEachMutations((key, fn) => {
    store.mutations[namespace + key] = store.mutations[namespace + key] || []
    store.mutations[namespace + key].push((payload) => {
      // fn.call(store, module.state, payload)
      store._withCommit(() => {
        fn.call(store, getNewState(store, path), payload)
      })
      store._subscribes.forEach(fn => {
        fn({ type: namespace + key, payload }, store.state)
      })
    })
  })

  module.forEachActions((key, fn) => {
    store.actions[namespace + key] = store.actions[namespace + key] || []
    store.actions[namespace + key].push((payload) => {
      fn.call(store, store, payload)
    })
  })

  // 将子模块的 state 挂载到根上
  if (path.length > 0) {
    const parent = path.slice(0, -1).reduce((prev, next) => {
      return prev[next]
    }, rootState)
    store._withCommit(() => {
      Vue.set(parent, path[path.length - 1], module.state)
    })
  }

  module.forEachChildren((key, childModule) => {
    // console.log(key, childModule)
    installModules(store, rootState, path.concat(key), childModule)
  })
}

function resetVM (store, state) {
  const oldVm = store._vm
  store.getters = {}
  const computed = {}
  Object.keys(store._wrapperGetters).forEach(key => {
    computed[key] = store._wrapperGetters[key]

    // 将对 getters 的获取，代理到从 Vue 的实例上获取，利用 Vue computed 的缓存特性
    Object.defineProperty(store.getters, key, {
      get: () => store._vm[key]
    })
  })

  store._vm = new Vue({
    data: {
      $$state: state
    },
    computed
  })

  // 深度监听 store 中的状态，通过 store._committing 来判断是否是通过 mutation 修改的状态，如果不是这输出错误提示信息
  // 使用同步 watcher 是因为状态变化后，回调函数可以立即执行，异步 watcher 的回调函数是异步执行
  store.strict && store._vm.$watch(() => store._vm._data.$$state, () => {
    console.assert(store._committing, 'Error: [vuex] do not mutate vuex store state outside mutation handlers.')
  }, {
    deep: true,
    sync: true
  })
  // console.log(oldVm, store._vm)

  // 每次动态注册模块，创建了一个新的 Vue 实例，我们要销毁旧的 Vue 实例
  if (oldVm) {
    Vue.nextTick(() => {
      oldVm.$destroy()
    })
  }
}

class Store {
  constructor (options) {
    // 将用户配置转换为属性结构
    this._modules = new ModuleCollection(options)
    this._wrapperGetters = {}
    this.mutations = {}
    this.actions = {}

    this._subscribes = []

    this.strict = options.strict // 标记是否是严格模式
    this._committing = false // 默认更改状态不是在 mutation 中修改的

    // 没有 namespaced 的时候，getters 都放在根上，actions 和 mutations 会被合并成数组
    const state = options.state
    installModules(this, state, [], this._modules.root)

    resetVM(this, state)

    options.plugins.forEach(plugin => {
      plugin(this)
    })
  }

  get state () {
    return this._vm._data.$$state
  }

  commit = (type, payload) => {
    this.mutations[type] && this.mutations[type].forEach(fn => {
      fn(payload)
    })
  }

  dispatch = (type, payload) => {
    console.log(type, this.actions[type])
    this.actions[type] && this.actions[type].forEach(fn => {
      fn(payload)
    })
  }

  subscribe (fn) {
    this._subscribes.push(fn)
  }

  replaceState (newState) {
    this._withCommit(() => {
      this._vm._data.$$state = newState
    })
  }

  registerModule (path, module) {
    if (typeof path === 'string') {
      path = [path]
    }
    // 调用配置项的注册方法，把新增模块的配置项加入到 root 上
    this._modules.register(path, module)
    module = new Module(module)
    // 调用注册模块的方法，注册新增模块的 mutations，actions，getters 只是挂载到了 _wrapperGetters 上
    installModules(this, this.state, path, module)
    // 重新创建 Vue 的实例是为了把新增模块的 getters 注册到 Store 的 getters 上
    resetVM(this, this.state)
  }

  // 对通过 mutation 更改状态的方法进行包装，修改前将 _committing 置为 true，表明此次修改时通过 mutation 修改的
  _withCommit (fn) {
    this._committing = true
    fn()
    this._committing = false
  }
}

export default Store
