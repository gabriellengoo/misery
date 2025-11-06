export { default as SanityContent } from '../../node_modules/@nuxtjs/sanity/dist/components/sanity-content.js'
export { default as SanityFile } from '../../node_modules/@nuxtjs/sanity/dist/components/sanity-file.js'
export { default as SanityImage } from '../../node_modules/@nuxtjs/sanity/dist/components/sanity-image.js'
export { default as Footer } from '../../components/Footer.vue'
export { default as PageIntro } from '../../components/PageIntro.vue'
export { default as SiteHeader } from '../../components/SiteHeader.vue'

// nuxt/nuxt.js#8607
function wrapFunctional(options) {
  if (!options || !options.functional) {
    return options
  }

  const propKeys = Array.isArray(options.props) ? options.props : Object.keys(options.props || {})

  return {
    render(h) {
      const attrs = {}
      const props = {}

      for (const key in this.$attrs) {
        if (propKeys.includes(key)) {
          props[key] = this.$attrs[key]
        } else {
          attrs[key] = this.$attrs[key]
        }
      }

      return h(options, {
        on: this.$listeners,
        attrs,
        props,
        scopedSlots: this.$scopedSlots,
      }, this.$slots.default)
    }
  }
}
