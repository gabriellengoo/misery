<template>
  <div >
    <!-- <SiteHeader /> -->

  <div class="misery-page">
      <!-- Illustration overlays -->
      <div
      class="carousel-container flex justify-center w-full h-full items-center"
    >
      <img :src="images[currentIndex]" class="carolcel" alt="carousel" />
    </div>

    <div class="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]">
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

    <!-- Center title -->
    <div class="title">
      <img src="/images/misery.gif" alt="logo" />
    </div>

    <!-- Background -->
    <div class="bg">
      <img src="/images/bg.png" alt="background" />
    </div>
  </div>

    <!-- Events section -->
    <div class="all-events">
      <!-- Filter bar -->
      <div class="filters">
        <span class="show">show</span>
        <button
          class="btn"
          :class="{ active: showAll, inactive: !showAll }"
          @click="showAll = true"
        >
          all events
        </button>
        <button
          class="btn"
          :class="{ active: !showAll, inactive: showAll }"
          @click="showAll = false"
        >
          current events only
        </button>
      </div>

      <!-- Events grid -->
      <div class="grid">
        <div
          v-for="(event, i) in filteredEvents"
          :key="i"
          class="event-card"
          :class="{ past: isPast(event.date) }"
          @click="goToEvent(event)"
        >
          <img
            :src="event.image"
            :class="{ upcoming: isUpcoming(event.date) }"
            alt=""
            class="event-img"
          />
          <div class="event-info">
            <span class="date">{{ event.date }}</span>
            <h3 class="titlee">{{ event.title }}</h3>
            <span class="location">{{ event.location }}</span>
          </div>
        </div>
      </div>

      <!-- See more link -->
      <div class="see-more">
        <router-link to="/events">see more →</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import SiteHeader from "@/components/SiteHeader.vue";

export default {
  components: { SiteHeader },
  data() {
    return {
      images: [],
      events: [],
      currentIndex: 0,
      intervalId: null,
      showAll: true,
    };
  },
  async fetch() {
    // Fetch homepage document
    const homepage = await this.$sanity.fetch(`*[_type == "homepage"][0]{
      carousel[]{ "url": asset->url },
      featuredEvents[]->{
        title,
        "slug": slug.current,
        date,
        location,
        "image": image.asset->url
      }
    }`);

    this.images = homepage.carousel.map((img) => img.url);
    this.events = homepage.featuredEvents;
  },
  mounted() {
    this.intervalId = setInterval(this.nextImage, 3000);
  },
  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  computed: {
    filteredEvents() {
    if (!this.events) return [];
    let list = this.showAll ? this.events : this.events.filter(e => !this.isPast(e.date));
    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  },
  methods: {
    nextImage() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    },
    goToEvent(event) {
      this.$router.push(`/events/${event.slug}`);
    },
    isPast(date) {
      return new Date(date) < new Date();
    },
    isUpcoming(date) {
      return new Date(date) > new Date();
    },
  },
};
</script>


<style scoped>
.carousel-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.carolcel {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 1s ease-in-out;
}

/* Events section */
.image-wrapper {
  position: relative;
  overflow: hidden;
}

.event-img {
  width: 100%;
  height: 20vw;
  object-fit: cover;
  transition: all 0.4s ease;
}

/* Pink filter for upcoming events */
/* .event-img.upcoming {
  filter: brightness(0.9) sepia(0.3) saturate(1.8) hue-rotate(310deg);
  transition: filter 0.3s ease;
} */

/* Remove tint on hover */
.event-card:hover .event-img.upcoming {
  filter: none;
}

/* Filter Bar */
.filters {
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 3vw;
  justify-content: left;
}

.show {
  font-size: 1vw;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn {
  border: 1px solid #50096e;
  padding: 0.6vw 1.4vw;
  font-size: 0.9vw;
  border-radius: 30px;
  cursor: pointer;
  background: transparent;
  color: #50096e;
  transition: all 0.3s ease;
}
.btn.inactive {
  background: #e0e0e0;
  color: #555;
}
.btn.active {
  background: #50096e;
  color: #fff;
  box-shadow: 0 4px 8px rgba(80, 9, 110, 0.25);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(80, 9, 110, 0.15);
}

.all-events {
  /* margin-top: 15vw; */
  background: #fff;
  min-height: max-content;
  padding: 5vw 8vw;
  position: relative;
  z-index: 10;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(100% / 6), 1fr));
  gap: 1vw;
  justify-items: center;
}

/* Card styling */
.event-card {
  background: #fafafa;
  border-radius: 1vw;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: all 0.35s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.event-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
}

/* Image */
.event-img {
  width: 100%;
  height: 20vw;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-img {
  transform: scale(1.05);
}

/* Text block */
.event-info {
  padding: 1.2vw;
  text-align: left;
}

.event-info .date {
  color: #777;
  font-size: 0.9vw;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-info .titlee {
  font-size: 1.3vw;
  margin: 0.6vw 0;
  color: #222;
  text-transform: lowercase;
  transition: color 0.3s ease;
}

.event-info .location {
  color: #888;
  font-size: 1vw;
}

.event-card:hover .event-info .titlee {
  color: #50096e;
}

/* --- Filter Toolbar --- */
.filter-toolbar {
  padding: 2vw;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2vw;
  /* margin-bottom: 3vw; */
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  background: #f8f6fa;
  border: 1px solid #50096e;
  border-radius: 30px;
  padding: 0.6vw 1.4vw;
  color: #50096e;
  font-size: 0.95vw;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(80, 9, 110, 0.08);
}

.filter-btn:hover {
  background: #50096e;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(80, 9, 110, 0.25);
}

.filter-icon {
  width: 1.2vw;
  height: 1.2vw;
  stroke: currentColor;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .filter-toolbar {
    gap: 3vw;
  }

  .filter-btn {
    font-size: 2.5vw;
    padding: 1.5vw 4vw;
    border-radius: 40px;
  }

  .filter-icon {
    width: 3vw;
    height: 3vw;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .btn {
    font-size: 1.1vw;
    padding: 0.8vw 2vw;
  }

  .event-info .titlee {
    font-size: 1.5vw;
  }

  .event-info .date {
    font-size: 1.1vw;
  }
}

@media (max-width: 768px) {
  .logo {
    width: 20vw;
  }

  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 4vw;
  }

  .event-card {
    border-radius: 2vw;
  }

  .event-info {
    padding: 3vw;
  }

  .event-info .titlee {
    font-size: 3.5vw;
  }

  .event-info .date,
  .event-info .location {
    font-size: 2.5vw;
  }

  .btn {
    font-size: 2.5vw;
    padding: 1vw 3vw;
  }
}

.misery-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  /* overflow: hidden; */
  font-family: "Syne", sans-serif;
  /* background: #f4f4f4; */
}

.bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* darken & desaturate */
  /* filter: brightness(100%) saturate(220%); */
  opacity: 0.3;
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
  /* border-radius: 50%; */
  /* mix-blend-mode: hard-light; */
  /* mix-blend-mode: multiply; */
}

/* overlays */
.overlay {
  position: absolute;
  z-index: 2;
  filter: saturate(0.9) brightness(1);
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
  bottom: 25%;
  left: 2%;
  width: 13vw;
  z-index: 6;
  mix-blend-mode: luminosity;
}
.char-right {
  bottom: 45%;
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
  width: 30%;
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
  border-radius: 5%;
  object-fit: cover;
  align-items: baseline;
  z-index: 1;
}
</style>
