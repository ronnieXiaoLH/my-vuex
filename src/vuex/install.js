export let Vue

function install (_Vue) {
  Vue = _Vue
  // Vue.mixin 给每个组件混入 beforeCreate，在 beforeCreate 给组件身上挂载 $store
  // 这里不应该直接在 Vue.prototype 上挂载 $store，而是在 new Vue() 的时候传入了 store 才应该挂载 $store
  Vue.mixin({
    beforeCreate () {
      const options = this.$options
      if (options.store) {
        // 根组件
        this.$store = options.store
      } else {
        // 子组件从父组件身上拿$store
        if (this.$parent && this.$parent.$store) {
          this.$store = this.$parent.$store
        }
      }
    }
  })
}

export default install
