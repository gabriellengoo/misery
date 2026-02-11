export default {
  // Target: https://go.nuxtjs.dev/config-target
  // target: 'static',
  // devtools: { enabled: true },
  target: "server",

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Misery",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    
      // Existing Syne font
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;700&display=swap",
      },
    
      // NEW: Antic Didone (plus others if you want)
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Antic+Didone&display=swap",
      }
    ],
    script: [
      {
        src: "https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js",
        type: "module",
        defer: true,
      },
    ],
    
  },

  app: {
    baseURL: "/misery/",
  },

  // Alternatively, ensure static is used correctly
  dir: {
    static: "public", // If you're using 'public' as the folder
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    "@/assets/css/main.css",
    //   '@/assets/css/typography.css',
  ],

  modules: [
    //   '@nuxtjs/vuex-persistedstate',
    //   '@nuxtjs/axios'
  ],
  vuex: {
    // persist only the cart module
    persist: {
      paths: ["cart"],
    },
  },

  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/sanity/module',
    // "@nuxtjs/sanity",
  ],

  router: {
    scrollBehavior(to, from, savedPosition) {
      // If the user used browser back/forward, restore saved position
      if (savedPosition) {
        return savedPosition;
      }
      // Otherwise, always scroll to top
      return { x: 0, y: 0 };
    },
  },

  // modules: ['@nuxtjs/axios', '@nuxtjs/proxy'],

  // axios: {
  //   // proxy: true,
  //   baseURL: 'https://tasc-core-prod-282330786703.us-central1.run.app',
  // },

  image: {
    sanity: {
      projectId: "gsh23bac",
      dataset: "production",
    },
  },

  sanity: {
    projectId: "gsh23bac",
    dataset: "production",
    apiVersion: "2023-01-01", // optional, but good to set
    useCdn: true, // `false` if you need fresh data (like previews)
  },

  plugins: [
    '~/plugins/sanity.js',
    // '~/plugins/tarteaucitron.client.js',
    //   '~/plugins/firebase.js','~/plugins/sanity.js', '~/plugins/init.client.js', '~/plugins/cart-persist.js', '~/plugins/api.js',  '~/plugins/axios.js',
  ],

  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.module.rules.push({
          test: /\.js$/,
          exclude: /(node_modules\/three)/,
        });
      }
    },
    transpile: ['@portabletext/to-html', '@nuxtjs/composition-api'],
    alias: {
      vue$: 'vue/dist/vue.runtime.esm.js',
    },
    postcss: {
      plugins: {
        tailwindcss: {},
        autoprefixer: {},
      },
    },
  },

  compatibilityDate: "2025-01-17",
};
