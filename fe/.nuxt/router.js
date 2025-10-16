import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _483a0f48 = () => interopDefault(import('../pages/events/index.vue' /* webpackChunkName: "pages/events/index" */))
const _48574696 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))
const _46836e00 = () => interopDefault(import('../pages/events/_slug.vue' /* webpackChunkName: "pages/events/_slug" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/events",
    component: _483a0f48,
    name: "events"
  }, {
    path: "/",
    component: _48574696,
    name: "index"
  }, {
    path: "/events/:slug",
    component: _46836e00,
    name: "events-slug"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
