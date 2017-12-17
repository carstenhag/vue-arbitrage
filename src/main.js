import Vue from 'vue'
import App from './App'
import router from './router'
import {store} from './store'
import VueResource from 'vue-resource'
//import moment from 'moment'

import 'vue-awesome/icons'
import Icon from 'vue-awesome/components/Icon'

import FlatSurfaceShader from 'vue-flat-surface-shader'

Vue.config.productionTip = false

Vue.use(VueResource)
Vue.component('icon', Icon)
Vue.use(FlatSurfaceShader)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
