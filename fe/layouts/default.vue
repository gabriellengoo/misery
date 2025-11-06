<template>
  <div id="app-wrapper">
    <!-- Intro animation -->
    <PageIntro v-if="showIntro" />

    <!-- Header -->
    <SiteHeader />

    <!-- Main content -->
    <main class="site-main">
      <Nuxt />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import PageIntro from "@/components/PageIntro.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import Footer from "@/components/Footer.vue";

export default {
  components: { PageIntro, SiteHeader, Footer },
  data() {
    return { showIntro: false };
  },
  mounted() {
    this.playIntro();
  },
  watch: {
    $route() {
      this.playIntro();
    },
  },
  methods: {
    playIntro() {
      this.showIntro = true;
      setTimeout(() => (this.showIntro = false), 3500);
    },
  },
};
</script>

<style>
html,
body,
#app-wrapper {
  height: 100%;
  margin: 0;
}

#app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.site-main {
  flex: 1; /* takes remaining space, pushing footer to bottom */
}
</style>
