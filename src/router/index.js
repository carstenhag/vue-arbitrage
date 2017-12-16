import Vue from 'vue'
import Router from 'vue-router'
import Meta from 'vue-meta'
import Home from '@/components/Home'

Vue.use(Router)
Vue.use(Meta)

export default new Router({
  routes: [
    {
      path: '*',
      name: 'Home',
      component: Home
    }
  ]
})
