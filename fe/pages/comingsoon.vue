<template>
  <div class="coming-soon-page">
    <p class="coming-soon-text">coming soon <3 </p>
  </div>
</template>

<script>
export default {
  layout: "preorder",
};
</script>

<style scoped>
.coming-soon-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 1.5rem;
  background: #fff;
}

.coming-soon-text {
  margin: 0;
  font-size: clamp(2.5rem, 6vw, 6rem);
  font-weight: 700;
  /* letter-spacing: 0.08em; */
  /* text-transform: uppercase; */
  color: #111;
}
</style>
