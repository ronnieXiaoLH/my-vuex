export function mapState (stateList) {
  const obj = {}
  for (let i = 0; i < stateList.length; i++) {
    const stateName = stateList[i]
    obj[stateName] = function () {
      return this.$store.state[stateName]
    }
  }
  return obj
}

export function mapGetters (gettersList) {
  const obj = {}
  for (let i = 0; i < gettersList.length; i++) {
    const getterName = gettersList[i]
    obj[getterName] = function () {
      return this.$store.getters[getterName]
    }
  }
  return obj
}

export function mapMutations (mutationList) {
  const obj = {}
  for (let i = 0; i < mutationList.length; i++) {
    const mutationName = mutationList[i]
    obj[mutationName] = function (payload) {
      this.$store.commit(mutationName, payload)
    }
  }
  return obj
}

export function mapActions (actionsList) {
  const obj = {}
  for (let i = 0; i < actionsList.length; i++) {
    const actionName = actionsList[i]
    obj[actionName] = function (payload) {
      this.$store.dispatch(actionName, payload)
    }
  }
  return obj
}
