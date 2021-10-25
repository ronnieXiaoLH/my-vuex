import Module from './module'

export default class ModuleCollection {
  constructor (options) {
    this.root = null
    this.register([], options)
  }

  register (path, rawModule) {
    const newModule = new Module(rawModule)

    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = path.slice(0, -1).reduce((prev, next) => {
        return prev.getChild(next)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }

    if (rawModule.modules) {
      Object.keys(rawModule.modules).forEach(moduleName => {
        this.register(path.concat(moduleName), rawModule.modules[moduleName])
      })
    }
  }

  getNamespace (path) {
    let root = this.root
    let namespace = ''
    path.forEach(item => {
      const module = root.getChild(item)
      root = module
      namespace = module.namespaced ? namespace + item + '/' : namespace
    })
    // console.log('namespace', namespace)
    return namespace
  }
}
