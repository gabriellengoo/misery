import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _73e61194 = () => interopDefault(import('../pages/about/index.vue' /* webpackChunkName: "pages/about/index" */))
const _1fe7f368 = () => interopDefault(import('../pages/comingsoon.vue' /* webpackChunkName: "pages/comingsoon" */))
const _fe1ee038 = () => interopDefault(import('../pages/contact.vue' /* webpackChunkName: "pages/contact" */))
const _3861949d = () => interopDefault(import('../pages/cookbook.vue' /* webpackChunkName: "pages/cookbook" */))
const _2ffaaf2f = () => interopDefault(import('../pages/crisis.vue' /* webpackChunkName: "pages/crisis" */))
const _483a0f48 = () => interopDefault(import('../pages/events/index.vue' /* webpackChunkName: "pages/events/index" */))
const _b68d7c6c = () => interopDefault(import('../pages/get-involved.vue' /* webpackChunkName: "pages/get-involved" */))
const _48c8d3f7 = () => interopDefault(import('../pages/preorder.vue' /* webpackChunkName: "pages/preorder" */))
const _423ea187 = () => interopDefault(import('../pages/press.vue' /* webpackChunkName: "pages/press" */))
const _5ca20469 = () => interopDefault(import('../pages/resources.vue' /* webpackChunkName: "pages/resources" */))
const _48574696 = () => interopDefault(import('../pages/index.vue' /* webpackChunkName: "pages/index" */))
const _722f704c = () => interopDefault(import('../pages/about/_slug.vue' /* webpackChunkName: "pages/about/_slug" */))
const _46836e00 = () => interopDefault(import('../pages/events/_slug.vue' /* webpackChunkName: "pages/events/_slug" */))
const _b6b7df38 = () => interopDefault(import('../pages/recipes/_slug.vue' /* webpackChunkName: "pages/recipes/_slug" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'nuxt-link-active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/about",
    component: _73e61194,
    name: "about"
  }, {
    path: "/comingsoon",
    component: _1fe7f368,
    name: "comingsoon"
  }, {
    path: "/contact",
    component: _fe1ee038,
    name: "contact"
  }, {
    path: "/cookbook",
    component: _3861949d,
    name: "cookbook"
  }, {
    path: "/crisis",
    component: _2ffaaf2f,
    name: "crisis"
  }, {
    path: "/events",
    component: _483a0f48,
    name: "events"
  }, {
    path: "/get-involved",
    component: _b68d7c6c,
    name: "get-involved"
  }, {
    path: "/preorder",
    component: _48c8d3f7,
    name: "preorder"
  }, {
    path: "/press",
    component: _423ea187,
    name: "press"
  }, {
    path: "/resources",
    component: _5ca20469,
    name: "resources"
  }, {
    path: "/",
    component: _48574696,
    name: "index"
  }, {
    path: "/about/:slug",
    component: _722f704c,
    name: "about-slug"
  }, {
    path: "/events/:slug",
    component: _46836e00,
    name: "events-slug"
  }, {
    path: "/recipes/:slug?",
    component: _b6b7df38,
    name: "recipes-slug"
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
