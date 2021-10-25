class Module {
  constructor (rawModule) {
    this._raw = rawModule
    this._children = {}
    this.state = rawModule.state
  }

  getChild (moduleName) {
    return this._children[moduleName]
  }

  addChild (moduleName, module) {
    this._children[moduleName] = module
  }

  forEachGetters (cb) {
    const getters = this._raw.getters
    getters && Object.keys(getters).forEach(key => {
      cb(key, getters[key])
    })
  }

  forEachMutations (cb) {
    const mutations = this._raw.mutations
    mutations && Object.keys(mutations).forEach(key => {
      cb(key, mutations[key])
    })
  }

  forEachActions (cb) {
    const actions = this._raw.actions
    actions && Object.keys(actions).forEach(key => {
      cb(key, actions[key])
    })
  }

  forEachChildren (cb) {
    const children = this._children
    children && Object.keys(children).forEach(key => {
      cb(key, children[key])
    })
  }

  // 用于标记当前模块是否开启了 namespaced
  get namespaced () {
    return !!this._raw.namespaced
  }
}

export default Module
