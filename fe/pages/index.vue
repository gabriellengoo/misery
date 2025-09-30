<template>
  <div class="misery-page">
    <!-- Header -->
    <SiteHeader />

  

    <!-- Illustration overlays -->
    <div class="flex justify-center w-full h-full items-center ">
      <img src="/images/c1.jpg" class="carolcel" alt="" />
    </div>
  <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">
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
  </div>

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

  <!-- Background image/video -->
  <div class="bg">
      <img src="/images/bg.png" alt="background" />
    </div>

 <!-- Events section -->
 <section class="events">
      <!-- Filter bar -->
      <div class="filters">
        <span class="show">show</span>
        <button class="btn inactive">all events</button>
        <button class="btn active">current events only</button>
      </div>

      <!-- Events grid -->
      <div class="grid">
        <div class="event-card" v-for="(event, i) in events" :key="i">
          <img :src="event.image" alt="" class="event-img" />
          <div class="event-info">
            <span class="date">{{ event.date }}</span>
            <h3 class="titlee">{{ event.title }}</h3>
            <span class="location">{{ event.location }}</span>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script>
import SiteHeader from "@/components/SiteHeader.vue";
export default { components: { SiteHeader },
data() {
    return {
      events: [
        {
          date: "fri, 19 sep",
          title: "friday late",
          location: "V&A",
          image: "/images/event1.jpeg",
        },
        {
          date: "fri, 19 sep",
          title: "friday late",
          location: "V&A",
          image: "/images/event1.jpeg",
        },
        {
          date: "fri, 19 sep",
          title: "friday late",
          location: "V&A",
          image: "/images/event1.jpeg",
        },
        {
          date: "fri, 26 nov",
          title: "Hope This Finds You Well",
          location: "V&A",
          image: "/images/event1.jpeg",
        },
      ],
    };
  },
};

</script>

<style scoped>

/* Events section */
.events {
  background: #fff;
  padding: 4vw 2vw;
  z-index: 6;
  position: relative;
  /* margin-top: 100vh; */
}
.filters {
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 2vw;
}
.show {
  /* font-weight: bold; */
  font-size: 1.4vw;
}
.btn {
  border: none;
  /* border-radius: 20px; */
  padding: 0.4vw 1vw;
  font-size: 0.9vw;
  cursor: pointer;
}
.btn.inactive {
  background: #e0e0e0;
  color: #555;
}
.btn.active {
  background: #50096e;
  color: #fff;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5vw;
}
.event-card {
  display: flex;
  flex-direction: column;
}
.event-img {
  height: 100%;
  /* border-radius: 8px; */
  margin-bottom: 0.5vw;
}
.event-info {
  font-size: 1.3vw;
}
.event-info .date {
  /* font-weight: bold; */
  color: #333;
}
.event-info .titlee {
  font-size: 1.4vw;
  margin: 0.25vw 0;
}
.event-info .location {
  color: #999;
}






.misery-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  /* overflow: hidden; */
  font-family: "Syne", sans-serif;
  /* background: #f4f4f4; */
}

.bg{
    position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
     /* darken & desaturate */
  /* filter: brightness(100%) saturate(220%); */
  opacity: 0.4;
  z-index: 5;

  /* optional: overlay effect */
  /* mix-blend-mode: multiply; */
  mix-blend-mode: hard-light;
}
/* base photo */
.bg img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 6;
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
  bottom: 35%;
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
  font-size: 1.2vw;
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
