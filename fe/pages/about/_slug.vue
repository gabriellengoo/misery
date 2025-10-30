<template>
  <div class="section-page" v-if="section">
    <div class="overlay-bg"></div>
    <div class="close-btn">   <img  @click="$router.push('/about')" class="close-btn" src="/images/close.svg" alt="logo" />
    </div>
    <!-- URLs / Video Embeds -->
    <div v-if="section.urls?.length" class="urls">
      <div v-for="(url, i) in section.urls" :key="i" class="url-item">
        <iframe
          v-if="isYoutube(url)"
          :src="embedYoutube(url)"
          frameborder="0"
          allowfullscreen
        ></iframe>
        <a v-else :href="url" target="_blank" rel="noopener">{{ url }}</a>
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
        <div class="carousel-controls">
          <button @click="prev">‹</button>
          <button @click="next">›</button>
        </div>
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
    embedYoutube(url) {
      const id = url.split("v=")[1] || url.split("/").pop();
      return `https://www.youtube.com/embed/${id}`;
    },
  },
};
</script>

<style scoped>
.content{
padding: 2vw 4vw;
overflow: scroll;
}


.section-page {
  position: relative;
  /* padding: 4rem 2rem; */
  width: 100vw;
  height: max-content;
  min-height: 100vh;
  text-align: center;
  margin: auto;

  /* color: #fff; */
  background: #ffffffb8;
  /* border-radius: 20px; */
  box-shadow: 0 0 50px rgba(255, 255, 255, 0.05);
  overflow:scroll;
  z-index: 10;
}

.overlay-bg {
  position: fixed;
  inset: 0;
  /* background: radial-gradient(ellipse at top, #1a1a1a, #000); */
  z-index: -1;
  transition: opacity 0.5s;
}

.close-btn {
  position: fixed;
  top: 1rem;
  right: 6.5rem;
  font-size: 3rem;
  font-weight: 100;
  cursor: pointer;
}
.close-btn:hover {
  transform: rotate(10deg) scale(1.1);
  text-shadow: 0 0 8px #000000;
}

.section-title {
  font-size: 2.5rem;
  text-align: center;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  text-transform: uppercase;
}

.close-btn img {
  width: 30px;
  height: 30px;
}

.accordion-list {
  margin-top: 2rem;
}
.accordion-header {
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #333;
  /* color: #fff; */
  font-size: 1.2rem;
  padding: 1rem 0;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s ease;
}
.accordion-header:hover {
  color: #ffb6c1;
  text-shadow: 0 0 5px #ffb6c1;
}
.accordion-body {
  padding: 1rem 0;
  border-bottom: 1px solid #333;
  /* color: #ccc; */
  transition: all 0.4s ease;
}
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.4s ease;
}
.accordion-enter,
.accordion-leave-to {
  max-height: 0;
}

.carousel {
  position: relative;
  text-align: center;
  margin-top: 3rem;
}
.carousel-image {
  max-width: 100%;
  border-radius: 12px;
  transition: all 0.6s ease;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 3rem;
  /* color: #fff; */
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}
.carousel-btn:hover {
  opacity: 1;
  text-shadow: 0 0 10px #ffb6c1;
}
.carousel-btn.prev {
  left: 0;
}
.carousel-btn.next {
  right: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.people-carousel {
  overflow: hidden;
  position: relative;
  margin-top: 3rem;
}
.carousel-track {
  display: flex;
  transition: transform 0.5s ease;
}
.person {
  flex: 0 0 100%;
  text-align: center;
}
.person img {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s ease, filter 0.3s;
}
.person:hover img {
  transform: scale(1.05) rotate(2deg);
  filter: brightness(1.2);
}
.person-info {
  margin-top: 1rem;
}
.person-info h3 {
  font-size: 1.2rem;
}
.person-info p {
  color: #aaa;
  font-size: 0.9rem;
}
.carousel-controls {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.carousel-controls button {
  background: none;
  color: #fff;
  font-size: 2rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.carousel-controls button:hover {
  color: #ffb6c1;
  transform: scale(1.2);
}

.urls {
  /* margin-top: 3rem; */
  text-align: center;
}
.url-item iframe {
  width: 100%;
  height: 700px;
  /* border-radius: 12px; */
}
.url-item a {
  color: #ffb6c1;
  text-decoration: none;
}
.url-item a:hover {
  text-shadow: 0 0 10px #ffb6c1;
}

.overlay-bg {
  position: fixed;
  inset: 0;
  /* background: radial-gradient(ellipse at top, #1a1a1a, #000); */
  z-index: -1;
}



.section-title {
  font-size: 1.8rem;
  font-weight: 200;
  margin-bottom: 1.5rem;
  text-transform: lowercase;
}

.portable-text {
  font-size: 0.9rem;
  font-weight: 200;
  line-height: 1.6;
  text-align: center;
}

.accordion-list {
  margin-top: 1.5rem;
  text-align: left;
}
.accordion-header {
  width: 100%;
  background: none;
  border: none;
  border-bottom: 1px solid #222;
  /* color: #fff; */
  font-size: 0.95rem;
  font-weight: 200;
  padding: 0.8rem 0;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
}
.accordion-body {
  padding: 0.5rem 0;
  /* color: #ccc; */
  font-size: 0.85rem;
  text-align: center;
}

.carousel-image {
  max-width: 90%;
  border-radius: 8px;
  margin: auto;
}

.people-carousel .person-info h3 {
  font-size: 0.95rem;
  font-weight: 200;
  text-transform: lowercase;
}
.people-carousel .person-info p {
  font-size: 0.8rem;
  font-weight: 100;
  /* color: #aaa; */
  text-transform: lowercase;
}

.url-item a {
  font-size: 0.85rem;
  text-transform: lowercase;
}
</style>
