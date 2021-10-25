import Vue from 'vue'
import Vuex from '../vuex'
import { cloneDeep } from 'lodash'

function logger () {
  return function (store) {
    // 所有更新操作都是基于 mutation，手动修改 state，subscribe 不会执行
    const prevState = cloneDeep(store.state)
    store.subscribe((mutation, state) => {
      console.log({
        'prev state': prevState,
        mutation,
        'next state': store.state
      })
    })
  }
}

function persists () {
  return function (store) {
    let localState = localStorage.getItem('vuex:state')
    if (localState) {
      localState = JSON.parse(localState)
    }
    localState && store.replaceState(localState)
    store.subscribe((mutation, state) => {
      localStorage.setItem('vuex:state', JSON.stringify(state))
    })
  }
}

Vue.use(Vuex)

export default new Vuex.Store({
  // strict: true,
  plugins: [
    logger(),
    persists()
  ],
  state: {
    name: 'zf',
    age: 12
  },
  mutations: {
    addAge (state, payload) {
      state.age += payload
    },
    changeName (state, payload) {
      state.name = payload
    }
  },
  actions: {
    asyncAddAge ({ commit }, payload) {
      setTimeout(() => {
        commit('addAge', payload)
      }, 1000)
    }
  },
  getters: {
    myName (state) {
      return state.name + 'px'
    }
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        name: 'a',
        age: 1
      },
      getters: {
        getName (state) {
          return state.name
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
      },
      modules: {
        c: {
          namespaced: true,
          state: {
            name: 'c',
            age: 1
          },
          getters: {
            getName (state) {
              return state.name
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
        }
      }
    },
    b: {
      namespaced: true,
      state: {
        name: 'b',
        age: 2
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
    }
  }
})
