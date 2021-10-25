<template>
  <div class="home">
    <div>
      root: {{$store.state.age}} -- getters: {{$store.getters.myName}}
      <div>辅助函数 --- {{age}} - {{myName}}</div>
      <button @click="$store.state.age++">非法addAge</button>
      <button @click="addAge(10)">addAge</button>
      <button @click="asyncAddAge(20)">asyncAddAge</button>
    </div>
    <div>
      a-module: {{$store.state.a.name}} -- {{$store.state.a.age}} -- {{$store.getters['a/getName']}}
      <button @click="$store.commit('a/addAge', 10)">a addAge</button>
      <button @click="$store.dispatch('a/asyncAddAge', 20)">a asyncAddAge</button>
    </div>
    <div>
      b-module: {{$store.state.b.name}} -- {{$store.state.b.age}}
      <button @click="$store.commit('b/addAge', 10)">b addAge</button>
      <button @click="$store.dispatch('b/asyncAddAge', 20)">b asyncAddAge</button>
    </div>

    <div>
      <h3>动态注册模块</h3>
      <button @click="registerModule">注册模块</button><button @click="$store.commit('d/addAge', 1)">d addAge</button>
      {{$store.state.d && $store.state.d.name}} -- {{$store.state.d && $store.state.d.age}} -- {{$store.getters['d/getModuleName']}}
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import store from '../store'
// import store from '../my-store'
// import Vuex, { mapState, mapGetters, mapMutations, mapActions } from '../vuex'

export default {
  name: 'Home',
  computed: {
    // age () {
    //   return this.$store.state.age
    // },
    // myName () {
    //   return this.$store.getters.myName
    // }
    ...mapState(['age']),
    ...mapGetters(['myName'])
  },
  mounted () {
    console.log(this.$store)
    setTimeout(() => {
      this.$store.commit('changeName', 'zhufeng')
    }, 2000)
  },
  methods: {
    // addAge (payload) {
    //   this.$store.commit('addAge', payload)
    // },
    // asyncAddAge (payload) {
    //   this.$store.dispatch('asyncAddAge', payload)
    // },
    ...mapMutations(['addAge']),
    ...mapActions(['asyncAddAge']),
    registerModule () {
      store.registerModule('d', {
        namespaced: true,
        state: {
          name: 'd',
          age: 4
        },
        getters: {
          getModuleName (state) {
            return state.name + '!'
          }
        },
        mutations: {
          addAge (state, payload) {
            state.age += payload
          }
        },
        actions: {
          asyncAddAge ({ commit }, payload) {
            setTimeout(() => {
              commit('addAge', payload)
            }, 1000)
          }
        }
      })
      console.log(this.$store)
    }
  }
}
</script>
