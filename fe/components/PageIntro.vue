<template>
    <transition name="fade">
      <div v-if="show" class="intro-overlay">
        <div class="intro-text">
          <span class="text">ᵘ ᶜᵃⁿ ᶜʳʸ ⁱᶠ ᵘ ʷᵃⁿᵗ ²</span>
          <img src="/images/tear.webp" alt="tear" class="tear" />
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: "PageIntro",
    data() {
      return {
        show: true,
      };
    },
    mounted() {
      // hide intro after 3.5s
      setTimeout(() => {
        this.show = false;
      }, 3500);
    },
  };
  </script>
  
  <style scoped>
  .intro-overlay {
    position: fixed;
    inset: 0;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    overflow: hidden;
    font-family: "Syne", sans-serif;
  }
  
  .intro-text {
    position: relative;
    font-size: 1.5vw;
    color: rgb(0, 106, 171);
    letter-spacing: 0.05em;
    /* color: #000; */
    display: flex;
    align-items: center;
    gap: 1vw;
    animation: fadeText 2.5s ease-in-out forwards;
  }
  
  /* tear animation */
  .tear {
    width: 1.2vw;
    height: auto;
    animation: dropTear 2s ease-in-out 1.5s forwards;
    opacity: 0;
  }
  
  /* Text fades in then fades out slightly before leaving */
  @keyframes fadeText {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    20% {
      opacity: 1;
      transform: translateY(0);
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  /* Tear drops down and fades out */
  @keyframes dropTear {
    0% {
      opacity: 0;
      transform: translateY(0);
    }
    20% {
      opacity: 1;
    }
    80% {
      transform: translateY(100px);
      opacity: 1;
    }
    100% {
      transform: translateY(150px);
      opacity: 0;
    }
  }
  
  /* Fade transition for overall overlay */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s ease;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  