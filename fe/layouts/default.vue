<template>
    <div>
      <!-- intro animation -->
      <PageIntro v-if="showIntro" />
  
      <!-- your normal layout content -->
      <SiteHeader />
      <Nuxt />
    </div>
  </template>
  
  <script>
  import PageIntro from "@/components/PageIntro.vue";
  import SiteHeader from "@/components/SiteHeader.vue";
  
  export default {
    components: { PageIntro, SiteHeader },
    data() {
      return {
        showIntro: false,
      };
    },
    watch: {
      // every time the route changes, trigger intro again
      $route() {
        this.playIntro();
      },
    },
    mounted() {
      this.playIntro(); // also play on first load
    },
    methods: {
      playIntro() {
        this.showIntro = true;
        setTimeout(() => {
          this.showIntro = false;
        }, 3500); // match the animation duration
      },
    },
  };
  </script>
  
  <style scoped>
  /* optional styling for smooth fade of underlying content */
  </style>
  