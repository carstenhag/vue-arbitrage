import Vue from 'vue'
import App from './App'
import router from './router'
import VueResource from 'vue-resource'
import moment from 'moment'

Vue.config.productionTip = false

Vue.use(VueResource)

import {store} from './store'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
