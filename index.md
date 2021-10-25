## Vuex

Vuex 是一个插件，Vuex 内部实现了一个 install 方法和一个 Store 类

### install

install 方法内部通过 Vue.mixin ，在 beforeCreate 声明周期中给每个组件挂载 $store
- 根组件直接从 this.$options.store 里拿
- 子组件从父组件的 $store 里拿

### Store类

Store 类实例化的时候：
1. 要把用户传递过来的 state 中的数据变成响应式数据，这样在 state 的状态发生变化时，页面可以更新。
2. getters 里的同一个数据，在页面中多次获取的时候，是应该不需要多次获取的。

基于一二两点，Vuex 的内部实例化了一个 Vue 的实例，把用户传过来的 state 放在 Vue 的 data 中，这样它的数据就是响应式的，当我们获取 state 中的数据的时候，就在 Vue 的实例上获取。对 getters 中的数据获取，代理到 computed 上，利用 computed 的缓存

### Vuex模块化

1. 首先将用户传过来的配置项 options 转换为树形结构，建立模块之间的父子关系
2. 将子模块中的 getters，mutations，actions都挂载 store 的根上(递归)
3. 根据子模块是否有开启 namespaced 拼接 getters，mutations，actions 中 key 的值

### Vuex模块动态注册

重要：销毁旧的 Vue 实例，创建新的 Vue 实例。

1. 首先将子模块的配置项添加到已转换为树形结构的根配置上
2. 注册子模块(将子模块中的 mutations，actions 都挂载 store 的根上，getters 是挂载到了 _wrapperGetters 上)
3. 创建一个新的 Vue 实例，因为新增的子模块 getters 中的数据并没有和 Vue 实例产生关联，也没有挂载到 store 的 getters 上
4. 销毁旧的 Vue 实例

### Vuex插件的原理

1. 首先遍历配置项中的 plugins 数组，执行这些方法，并把 store 传给这些方法
2. plugins 中的方法中如果使用了 store 的 subscribe 方法，把这些回调函数存储起来(_subscribes)
3. 在 mutation 执行完成后，依次调用 _subscribes 中存储起来的方法，并把 mutation 和 state 传给这些方法(发布订阅模式)

### Vuex严格模式的原理

1. 首先用 strict 标记是否开启了严格模式
2. 用 _committing 标记默认更改 store 的状态不是通过 mutation
3. 用 _withCommit 方法对所有合法的更改(通过 mutation 更改状态等)的方法进行包装，在更改状态之前将 _committing 置为 true，更改完之后再将 _committing 置为 false
4. 严格模式下，使用同步 watch 深度监听 store 的状态，如果不是通过 mutation 更改状态的输出错误提示信息

### Vuex辅助函数(mapState,mapGettters,mapMutations,mapActions)

本质就是对 store 的操作封装到函数里面

1. 封装一个函数，函数返回一个对象
2. 依次遍历 mapState 传过来的数组，并作为对象的 key
3. key 对应的值是一个函数，函数里面去操作this.$store