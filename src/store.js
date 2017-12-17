import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)

const storeVersion = '0.1.0'

export const store = new Vuex.Store({
  plugins: [createPersistedState({key: 'vuex-arbitrage-' + storeVersion})],
  strict: process.env.NODE_ENV !== 'production',
  state: {
    activeCrypto: 'litecoin',
    settings: {
      exchangeFeePercentage: '0.26',
      withdrawFeeCrypto: '0.001',
      withdrawFeeFiat: '0.15',
      tradeVolumeFiat: '500'
    }
  },
  mutations: {
    updateActiveCrypto (state, payload) {
      state.activeCrypto = payload
    },
    updateExchangeFeePercentage (state, payload) {
      state.settings.exchangeFeePercentage = payload
    },
    updateWithdrawFeeCrypto (state, payload) {
      state.settings.withdrawFeeCrypto = payload
    },
    updateWithdrawFeeFiat (state, payload) {
      state.settings.withdrawFeeFiat = payload
    },
    updateTradeVolumeFiat (state, payload) {
      state.settings.tradeVolumeFiat = payload
    }
  }
})
