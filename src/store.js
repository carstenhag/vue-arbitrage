import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const storeVersion = '0.1.0'

export const store = new Vuex.Store({
    plugins: [createPersistedState({key: 'vuex-arbitrage-' + storeVersion})],
    state: {

    },
    mutations: {
        
    }
})