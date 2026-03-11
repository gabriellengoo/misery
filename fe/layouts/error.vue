<template>
  <main class="error-page">
    <p>page cant be found :(</p>
  </main>
</template>

<script>
export default {
  name: "ErrorPage",
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  head() {
    return {
      title: "page cant be found :(",
    };
  },
};
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.error-page p {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.1;
  text-transform: lowercase;
}
</style>
