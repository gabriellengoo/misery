<template>
  <div class="misery-page">
    <!-- Header -->
    <SiteHeader />

    <!-- Background image/video -->
    <div class="bg">
      <img src="/images/bg.png" alt="background" />
    </div>

    <!-- Illustration overlays -->
    <div class="flex justify-center w-full h-full items-center">
      <img src="/images/c1.jpg" class="carolcel" alt="" />
    </div>
    <img
      src="https://i.ibb.co/VvxBzzg/Misery-Meets2square.png"
      class="overlay char-left"
      alt=""
    />
    <img
      src="https://i.ibb.co/sFyFWsf/Bald.png"
      class="overlay char-right"
      alt=""
    />

    <!-- Center text -->

    <div class="title">
  <img src="/images/misery.gif" alt="logo" />
  <!-- <div class="curved-text-container">
    <svg fill="transparent" stroke="none" viewBox="0 0 500 100" class="curved-text" preserveAspectRatio="xMidYMid meet">
        <path id="curve" d="M20,80 Q250,0 480,80" fill="transparent" stroke="none" />
        <text fill="transparent" stroke="none" width="500">
        <textPath fill="transparent" stroke="none" href="#curve" startOffset="50%" text-anchor="middle">
          u can cry if u want 2
        </textPath>
      </text>
    </svg>
    tear drops
    <img src="/images/tear.webp" class="tear" alt="tear" />
    <img src="/images/tear.webp" class="tear" alt="tear" />
  </div> -->
</div>


  </div>
</template>

<script>
import SiteHeader from "@/components/SiteHeader.vue";
export default { components: { SiteHeader } };
</script>

<style scoped>
/* Ensure .title container is wide enough and on top */
.title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10; /* above overlay and background */
  width: 60%; /* wider so SVG fits */
  text-align: center;
}

/* Curved SVG text */
.curved-text {
  width: 100%;
  height: auto;

}



.curved-text textPath {
  fill: rgb(0, 174, 255); /* blue glow */
  font-size: 2rem;
  font-weight: bold;
  text-transform: lowercase;
  filter: drop-shadow(0 0 10px rgb(0, 255, 255));
  font-family: 'Syne', sans-serif;
}

/* Tear drops */
.tear {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 70px;   /* adjust to sit under text */
  left: 420px;  /* adjust to align with end of text */
  transform: rotate(10deg);
  animation: drop 1s infinite alternate;
}

@keyframes drop {
  0% { transform: translateY(0) rotate(10deg); opacity: 1; }
  100% { transform: translateY(15px) rotate(15deg); opacity: 0.7; }
}



.misery-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: "Syne", sans-serif;
  /* background: #f4f4f4; */
}

.bg{
    position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
     /* darken & desaturate */
  filter: brightness(80%) saturate(220%);
  opacity: 0.4;
  z-index: 5;

  /* optional: overlay effect */
  /* mix-blend-mode: multiply; */
  /* mix-blend-mode: hard-light; */
}
/* base photo */
.bg img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* mix-blend-mode: hard-light; */
    /* mix-blend-mode: multiply; */
}

/* overlays */
.overlay {
  position: absolute;
  z-index: 2;
  pointer-events: none;
}
.overlay-green {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.char-left {
  bottom: 10%;
  left: 2%;
  width: 13vw;
  z-index: 6;
  mix-blend-mode: luminosity;
}
.char-right {
  bottom: 15%;
  right: 2%;
  z-index: 6;
  width: 13vw;
  mix-blend-mode: luminosity;
}

/* text */
.title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8vw;
  color: #ff5ac8; /* pink glitter feel */
  text-shadow: 4px 4px 0 #000;
  z-index: 6;
  width: 20%;
}
.subtitle {
  position: absolute;
  bottom: 12%;
  left: 50%;
  transform: translateX(-50%);
  color: #bfe2ff;
  font-size: 1.2rem;
  z-index: 3;
}

.carolcel {
  width: 93%;
  width: 89%;
  height: 93%;
  object-fit: cover;
  align-items: baseline;
  z-index: 1;
}
</style>
