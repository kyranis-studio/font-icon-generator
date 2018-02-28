import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'editor',
      component: require('@/components/editor')
    },
    {
      path: '/svglib',
      name: 'svglib',
      component: require('@/components/svglib')
    },
    {
      path: '/watch',
      name: 'watch',
      component: require('@/components/watch')
    },
    {
      path: '/settings',
      name: 'settings',
      component: require('@/components/settings')
    },
    {
      path: '/preview',
      name: 'preview',
      component: require('@/components/htmlPreview')
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
