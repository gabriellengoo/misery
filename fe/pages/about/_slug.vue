<template>
  <div class="section-page" v-if="section">
    <div class="overlay-bg"></div>
    <img
      class="close-btn"
      src="/images/close.svg"
      alt="close"
      @click="$router.push('/about')"
    />

    <!-- URLs / Video Embeds -->
    <div v-if="section.urls?.length" class="urls">
      <div v-for="(url, i) in section.urls" :key="i" class="url-item">
        <div class="video-wrapper">
          <iframe
            v-if="isYoutube(url)"
            :src="embedYoutubeAutoplay(url)"
            frameborder="0"
            allow="autoplay; encrypted-media"
            allowfullscreen
          ></iframe>
        </div>
        <a
          v-if="isYoutube(url)"
          :href="url"
          target="_blank"
          rel="noopener"
          class="video-link"
        >
          Watch full video →
        </a>
        <a v-else :href="url" target="_blank" rel="noopener" class="video-link">
          Visit link →
        </a>
      </div>
    </div>

    <div class="content">
      <h1 class="section-title">{{ section.title }}</h1>

      <!-- Regular block content -->
      <SanityBlocks
        v-if="section.content"
        :blocks="section.content"
        class="portable-text"
      />

      <!-- Accordion -->
      <div v-if="section.sectionType === 'accordion'" class="accordion-list">
        <div v-for="(item, i) in section.accordions" :key="i" class="accordion">
          <button
            class="accordion-header"
            :class="{ open: openAccordion === i }"
            @click="toggleAccordion(i)"
          >
            {{ item.accordionTitle }}
            <span class="arrow" :class="{ rotated: openAccordion === i }"
              >⌄</span
            >
          </button>
          <transition name="accordion">
            <div v-show="openAccordion === i" class="accordion-body">
              <SanityBlocks :blocks="item.accordionContent" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Carousel -->
      <div
        v-if="section.sectionType === 'carousel' && section.images?.length"
        class="carousel"
      >
        <transition name="fade">
          <img
            :key="currentIndex"
            :src="section.images[currentIndex]?.asset?.url"
            class="carousel-image"
          />
        </transition>
        <button class="carousel-btn prev" @click="prev">‹</button>
        <button class="carousel-btn next" @click="next">›</button>
      </div>

      <!-- Team / Collaborators -->
      <div
        v-if="['team', 'collaborators'].includes(section.sectionType)"
        class="people-carousel"
      >
        <div class="carousel-track" :style="trackStyle">
          <div v-for="(person, i) in section.people" :key="i" class="person">
            <div class="person-card">
              <img
                v-if="person.image?.asset?.url"
                :src="person.image.asset.url"
                :alt="person.name"
              />
              <div class="person-info">
                <h3>{{ person.name }}</h3>
                <p>{{ person.role }}</p>
              </div>
            </div>
          </div>
        </div>
        <!-- Left and Right invisible zones -->
        <div class="carousel-left-hover" @click="prev"></div>
        <div class="carousel-right-hover" @click="next"></div>
      </div>
    </div>
  </div>
</template>

<script>
import SanityBlocks from "sanity-blocks-vue-component";
import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "gsh23bac",
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

export default {
  components: { SanityBlocks },
  data() {
    return {
      section: null,
      openAccordion: null,
      currentIndex: 0,
    };
  },
  watch: {
    "$route.params.slug": {
      immediate: true,
      handler(newSlug) {
        this.loadSection(newSlug);
      },
    },
  },
  async fetch() {
    const slug = this.$route.params.slug;
    const query = `*[_type == "aboutSection" && overlaySlug.current == $slug][0]{
        title,
        sectionType,
        content,
        accordions[]{accordionTitle, accordionContent},
        images[]{asset->{url}},
        people[]{name, role, image{asset->{url}}},
        urls
      }`;
    this.section = await client.fetch(query, { slug });
  },
  computed: {
    trackStyle() {
      if (!this.section?.people) return {};
      const offset = -this.currentIndex * 100;
      return { transform: `translateX(${offset}%)` };
    },
  },
  methods: {
    async loadSection(slug) {
      const query = `*[_type == "aboutSection" && overlaySlug.current == $slug][0]{
      title,
      sectionType,
      content,
      accordions[]{accordionTitle, accordionContent},
      images[]{asset->{url}},
      people[]{name, role, image{asset->{url}}},
      urls
    }`;
      this.section = await client.fetch(query, { slug });
    },
    toggleAccordion(index) {
      this.openAccordion = this.openAccordion === index ? null : index;
    },
    next() {
      const list = this.section.images || this.section.people;
      if (!list?.length) return;
      this.currentIndex = (this.currentIndex + 1) % list.length;
    },
    prev() {
      const list = this.section.images || this.section.people;
      if (!list?.length) return;
      this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
    },
    isYoutube(url) {
      return url.includes("youtube.com") || url.includes("youtu.be");
    },
    embedYoutubeAutoplay(url) {
      const id = url.split("v=")[1] || url.split("/").pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}`;
    },
  },
};
</script>

<style scoped>
.section-page {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  background: #ffffff7f;
  color: #111;
  overflow-y: auto;
  padding: 6rem 6vw 8rem;
  /* font-family: "Inter", "Helvetica Neue", sans-serif; */
  backdrop-filter: blur(50px) !important;
    /* background: #ffffff; */
    background-color: hsl(0deg 0% 100% / 13%) !important;
}

/* Background overlay (if needed for transitions) */
.overlay-bg {
  position: fixed;
  inset: 0;
  background: #f8f8f89c;
  z-index: -1;
  transition: opacity 0.5s;
}

/* Close button */
.close-btn {
  position: fixed;
  top: 1.5rem;
  right: 2rem;
  width: 26px;
  height: 26px;
  cursor: pointer;
  opacity: 0.8;
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.close-btn:hover {
  transform: rotate(10deg) scale(1.1);
  opacity: 1;
}

/* Section title */
.section-title {
  text-align: left;
  font-size: 2rem;
  font-weight: 400;
  text-transform: lowercase;
  margin-bottom: 2rem;
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  padding: 1rem 0;
  letter-spacing: 0.5px;
}

/* Portable text — main content */
.portable-text {
  text-align: left;
  font-size: 1.05rem;
  line-height: 1.75;
  font-weight: 300;
  color: #222;
  max-width: 750px;
  margin: 2rem auto;
}

.portable-text p {
  margin-bottom: 1.4rem;
}

.portable-text h2,
.portable-text h3 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 400;
  text-transform: lowercase;
}

.portable-text h2 {
  font-size: 1.4rem;
}

.portable-text h3 {
  font-size: 1.1rem;
  opacity: 0.8;
}

/* Accordions */
.accordion-list {
  margin-top: 3rem;
  border-top: 1px solid #ddd;
}

.accordion-header {
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #ddd;
  font-size: 1rem;
  font-weight: 400;
  padding: 1rem 0;
  text-align: left;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  color: #111;
  transition: color 0.3s ease;
}
.accordion-header:hover {
  color: #5a6b41; /* subtle sage tone */
}
.accordion-body {
  padding: 1rem 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
}

/* Fade transition for accordions */
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.4s ease;
}
.accordion-enter,
.accordion-leave-to {
  max-height: 0;
}

/* Carousel */
.carousel {
  position: relative;
  margin: 4rem auto;
  text-align: center;
}

.carousel-image {
  max-width: 70%;
  border-radius: 12px;
  transition: transform 0.6s ease;
  object-fit: contain;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.carousel-btn img {
  width: 24px;
  height: auto;
}

.carousel-btn:hover {
  opacity: 1;
}

.carousel-btn.prev {
  left: 3%;
}
.carousel-btn.next {
  right: 3%;
}

/* People carousel */
.people-carousel {
  margin-top: 4rem;
  overflow: hidden;
  position: relative;
  text-align: center;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s ease;
}

.person {
  flex: 0 0 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.person img {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s;
}
.person:hover img {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.person-info {
  margin-top: 1.5rem;
}
.person-info h3 {
  font-size: 1.2rem;
  font-weight: 400;
  margin-bottom: 0.3rem;
  text-transform: lowercase;
}
.person-info p {
  font-size: 0.9rem;
  color: #666;
}

/* Links + embeds */
.urls {
  margin: 3rem auto;
  text-align: center;
}
.url-item iframe {
  width: 100%;
  max-width: 800px;
  max-width: 100%;
  height: 850px;
  /* border-radius: 12px; */
  margin-bottom: 2rem;
}
.url-item a {
  color: #5a6b41;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.2s ease;
}
.url-item a:hover {
  color: #000;
}

.urls {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
}

.video-wrapper {
  pointer-events: none; /* disables clicks on the iframe */
  overflow: hidden;
  /* border-radius: 10px; */
  /* max-width: 800px; */
  margin: 0 auto;
}

.video-link {
  display: inline-block;
  margin-top: 0.75rem;
  font-size: 0.9rem;
  text-transform: lowercase;
  color: #444;
  text-decoration: none;
  transition: color 0.3s ease;
}

.video-link:hover {
  color: #8ba68c;
  text-decoration: underline;
}


/* Left half: show left arrow cursor */ .carousel-left-hover { cursor: url('/images/lefta.png') 8 8, auto; /* x y = hotspot */ } /* Right half: show right arrow cursor */ .carousel-right-hover { cursor: url('/images/righta.png') 8 8, auto; } .carousel-left-hover, .carousel-right-hover { position: absolute; top: 0; width: 50%; height: 100%; z-index: 10; pointer-events: auto; /* allow clicks */ } /* Left zone on the left half */ .carousel-left-hover { left: 0; } /* Right zone on the right half */ .carousel-right-hover { right: 0; }

.carousel { position: relative; text-align: center; margin-top: 3rem; } .carousel-image { max-width: 100%; border-radius: 12px; transition: all 0.6s ease; } .carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); font-size: 3rem; /* color: #fff; */ background: none; border: none; cursor: pointer; opacity: 0.7; transition: all 0.3s ease; } .carousel-btn:hover { opacity: 1; text-shadow: 0 0 10px #ffb6c1; } .carousel-btn.prev { left: 0; } .carousel-btn.next { right: 0; } .fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; } .fade-enter, .fade-leave-to { opacity: 0; }
.people-carousel { overflow: hidden; position: relative; margin-top: 3rem; } .carousel-track { display: flex; transition: transform 0.5s ease; } .person { flex: 0 0 100%; text-align: center; display: flex; justify-content: center; flex-direction: column; align-items: center; } .person img { width: 250px; height: 250px; width: 200px; height: 200px; margin-top: 2vw; border-radius: 50%; object-fit: cover; transition: transform 0.3s ease, filter 0.3s; } .person:hover img { transform: scale(1.05) rotate(2deg); filter: brightness(1.2); } .person-info { margin-top: 3rem; width: 60vw; } .person-info h3 { font-size: 1.2rem; } .person-info p { color: #aaa; font-size: 0.9rem; } .carousel-controls { margin-top: 1rem; display: flex; justify-content: center; gap: 1rem; } .carousel-controls button { background: none; color: #fff; font-size: 2rem; border: none; cursor: pointer; transition: all 0.3s ease; } .carousel-controls button:hover { color: #ffb6c1; transform: scale(1.2); }

.carousel-image {
  max-width: 90%;
  border-radius: 8px;
  margin: auto;
}
.people-carousel .person-info h3 {
  font-size: 1.95rem;
  margin-bottom: 2vw;
  font-weight: 200;
  text-transform: lowercase;
}
.people-carousel .person-info p {
  font-size: 0.8rem;
  font-weight: 100; /* color: #aaa; */
  text-transform: lowercase;
}

.person-card{
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>
