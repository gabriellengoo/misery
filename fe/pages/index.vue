<template>
  <div>
    <SiteHeaderhome />

    <div class="h-full w-full relative overflow-hidden">
      <div class="misery-page">
        <!-- Illustration overlays -->
        <div class="carousel-wrapper">
          <div class="carousel-track">
            <img
              v-for="(image, index) in [...images, ...images]"
              :key="index"
              :src="image"
              class="carousel-image"
              alt="carousel image"
            />
          </div>
        </div>

        <div class="floating-img img-right">
          <img src="https://i.ibb.co/sFyFWsf/Bald.png" alt="" />
        </div>

        <div class="floating-img img-left">
          <img
            src="https://i.ibb.co/TKVh7wG/Misery-Meets-Confidence-11-24-2020-1.png"
            alt=""
          />
        </div>

        <div class="floating-img img-left2">
          <img src="https://i.ibb.co/VvxBzzg/Misery-Meets2square.png" alt="" />
        </div>

        <!-- <div
            class="absolute top-0 left-0 w-full h-full pointer-events-none z-[1]"
          >
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
          </div> -->

        <!-- Center title -->
        <!-- <div class="title">
            <img src="/images/misery.gif" alt="logo" />
          </div> -->
        <div class="title">
          <img src="/images/misery-logo.png" alt="logo" />
        </div>
        <!-- <div class="title">
          <img src="/images/mis-logo.png" alt="logo" />
        </div> -->

        <!-- Background -->
        <div class="bgoverlay">
          <img src="/images/bgnew.png" alt="background" />
        </div>
      </div>
    </div>

    <!-- Events section -->
    <div class="all-events">
         <!-- See more link -->
         <div class="see-more">
          <p class="see-more" to="/events">what's on</p>
        </div>

      <!-- Filter bar -->
      <div class="filters">
        <span class="show">*•̩̩͙✩•̩̩͙*˚ show *•̩̩͙✩•̩̩͙*˚</span>
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
            <!-- <span class="date">{{ event.date }}</span> -->
            <h3 class="titlee">{{ event.title }}</h3>
            <p class="location flex items-center gap-2">
              <svg
                class="w-[2vw] fill-black dark:fill-[#a36cba]"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 352.518 352.518"
                xml:space="preserve"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <g>
                    <g>
                      <path
                        d="M176.259,0c-76.645,0-139,62.355-139,139c0,28.248,8.428,55.441,24.374,78.639c14.717,21.411,34.875,38.124,58.495,48.551 l45.251,79.983c2.218,3.921,6.375,6.345,10.879,6.345s8.661-2.424,10.879-6.345l45.251-79.983 c23.62-10.427,43.778-27.14,58.495-48.551c15.948-23.197,24.376-50.391,24.376-78.639C315.259,62.355,252.903,0,176.259,0z M218.923,244.742c-2.621,1.06-4.807,2.976-6.198,5.436l-36.466,64.455l-36.466-64.455c-1.392-2.46-3.577-4.376-6.198-5.436 C90.26,227.238,62.259,185.732,62.259,139c0-62.86,51.14-114,114-114c62.86,0,114,51.14,114,114 C290.259,185.732,262.258,227.238,218.923,244.742z"
                      ></path>
                      <path
                        d="M176.259,85.759c-28.949,0-52.5,23.551-52.5,52.5s23.551,52.5,52.5,52.5s52.5-23.551,52.5-52.5 S205.208,85.759,176.259,85.759z M176.259,165.759c-15.164,0-27.5-12.336-27.5-27.5s12.336-27.5,27.5-27.5s27.5,12.336,27.5,27.5 S191.423,165.759,176.259,165.759z"
                      ></path>
                    </g>
                  </g>
                </g>
              </svg>
              {{ event.location }}
            </p>
          </div>
        </div>
        <!-- See more link -->
        <div class="see-more">
          <router-link class="see-more" to="/events">see more →</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SiteHeaderhome from "@/components/SiteHeaderhome.vue";

export default {
  components: { SiteHeaderhome },
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

    // --- Fade in carousel on scroll ---
    // const carousel = document.querySelector('.carousel-container');
    // const observer = new IntersectionObserver(entries => {
    //   entries.forEach(entry => {
    //     if (entry.isIntersecting) {
    //       carousel.classList.add('visible');
    //       observer.unobserve(carousel);
    //     }
    //   });
    // }, { threshold: 0.2 });
    // observer.observe(carousel);

    // --- Fly away from cursor effect ---
    const floatingImgs = document.querySelectorAll(".floating-img");
    floatingImgs.forEach((img) => {
      img.addEventListener("mousemove", (e) => {
        const rect = img.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        img.style.setProperty("--x", `${x * -50}px`);
        img.style.setProperty("--y", `${y * -50}px`);
      });
      img.addEventListener("mouseleave", () => {
        img.style.setProperty("--x", "0px");
        img.style.setProperty("--y", "0px");
      });
    });

    // --- Logo transform on scroll ---
    const logo = document.querySelector(".title img");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const maxScroll = 400; // when it stops moving/shrinking
  const progress = Math.min(scrollY / maxScroll, 1);

  // Move upward and shrink
  logo.style.transform = `
    translateY(-${progress * 200}px)
    scale(${1 - progress * 0.7})
  `;

  // Fade in (from 0 → 1)
  logo.style.opacity = progress;
});


  },

  beforeDestroy() {
    clearInterval(this.intervalId);
  },
  computed: {
    filteredEvents() {
      if (!this.events) return [];
      let list = this.showAll
        ? this.events
        : this.events.filter((e) => !this.isPast(e.date));
      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
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
  z-index: 1;
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
  /* drop-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); */
  /* filter: drop-shadow(0 4px 8px rgba(1, 1, 1, 0.25)); */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.649);
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
  font-size: 1.5vw;
  /* color: #444; */
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn {
  border: 1px solid #a36cba;
  padding: 0.6vw 1.4vw;
  font-size: 0.9vw;
  border-radius: 30px;
  cursor: pointer;
  background: transparent;
  color: #a36cba;
  transition: all 0.3s ease;
}
.btn.inactive {
  background: #e0e0e0;
  color: #555;
}
.btn.active {
  background: #a36cba;
  color: #fff;
  box-shadow: 0 4px 8px rgba(80, 9, 110, 0.25);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(80, 9, 110, 0.15);
}

.all-events {
  /* margin-top: 15vw; */
  /* background: #fff; */
  min-height: max-content;
  padding: 5vw 8vw;
  position: relative;
  z-index: 10;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(100% / 5), 1fr));
  gap: 1vw;
  justify-items: center;
}

/* Card styling */
.event-card {
  /* background: #fafafa; */
  /* border-radius: 1vw; */
  overflow: hidden;
  padding: 0.5vw;
  /* box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08); */
  transition: all 0.35s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.event-card:hover {
  transform: translateY(-8px) scale(1.02);
  /* box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15); */
}

/* Image */
.event-img {
  width: 100%;
  height: 30vw;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-img {
  /* transform: scale(1.05); */
}

/* Text block */
.event-info {
  /* padding: 1.2vw; */
  text-align: left;
}

.event-info .date {
  /* color: #777; */
  font-size: 0.9vw;
  font-size: 1.2vw;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-info .titlee {
  font-size: 1.5vw;
  margin: 0.6vw 0;
  /* color: #222; */
  text-transform: lowercase;
  transition: color 0.3s ease;
}

.event-info .location {
  /* color: #888; */
  font-size: 1.2vw;
}

.event-card:hover .event-info .titlee {
  color: white; /* keep the original color */
  text-shadow: 0 0 7px #39c1d3, 0 0 16px #6cbaad;
  transition: text-shadow 0.3s ease;
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
  border: 1px solid #a36cba;
  border-radius: 30px;
  padding: 0.6vw 1.4vw;
  color: #a36cba;
  font-size: 0.95vw;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(80, 9, 110, 0.08);
}

.filter-btn:hover {
  background: #a36cba;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(80, 9, 110, 0.25);
}

.filter-icon {
  width: 1.2vw;
  height: 1.2vw;
  stroke: currentColor;
}

/* --- Fade-in Carousel --- */
/* .carousel-container {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 1.2s ease, transform 1.2s ease;
}
.carousel-container.visible {
  opacity: 1;
  transform: translateY(0);
} */

/* --- Logo image before scroll --- */
.title img {
  height: 20vw; /* starting size */
  transition: transform 0.3s ease-out;
  position: relative;
  z-index: 100000;
  opacity: 0.2;
  transition: transform 0.2s ease-out, opacity 0.4s ease-out;
  will-change: transform, opacity;
  transform-origin: center top;
}




.carousel-wrapper {
  width: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.carousel-track {
  display: flex;
  width: max-content;
  animation: scroll-carousel 30s linear infinite;
}

.carousel-image {
  /* width: 40vw; */
  height: 100vh;
  /* margin-right: 2vw; */
  flex-shrink: 0;
  -o-object-fit: cover;
  object-fit: cover;
  /* border-radius: 8px; */
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.05);
}

@keyframes scroll-carousel {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.carousel-track:hover {
  animation-play-state: paused;
}

/* Stops shrinking around height ~3vw */
@media (min-width: 768px) {
  .title img {
    /* max-height: 3vw; */
  }
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
    font-size: 1.3vw;
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
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 8vw;
  color: #ff5ac8; /* pink glitter feel */
  text-shadow: 4px 4px 0 #000;
  z-index: 6;
  /* opacity: 0.2; */
  /* width: 30%; */
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
  /* width: 93%;
  width: 89%;
  height: 93%;
  border-radius: 5%; */
  object-fit: cover;
  align-items: baseline;
  z-index: 1;
}
</style>
