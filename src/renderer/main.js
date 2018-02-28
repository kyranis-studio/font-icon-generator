import Vue from 'vue'

import App from './App'
import Vuetify from 'vuetify'
import router from './router'
import {store} from './store'

import 'vuetify/dist/vuetify.min.css'
import './assets/css/icons.css'
import './assets/css/font.css'
import '../../static/iconfont/material-icons.css'
Vue.use(Vuetify)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
