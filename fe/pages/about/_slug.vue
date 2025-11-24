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

    <div class="content sanity-blocks">
      <h1 class="section-title">{{ section.title }}</h1>

      <!-- Regular block content -->
      <SanityBlocks
        v-if="section.content"
        :blocks="section.content"
        class="portable-text sanity-blocks"
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
            <!-- <span class="arrow" :class="{ rotated: openAccordion === i }"
              >⌄</span
            > -->
          </button>
          <transition name="accordion">
            <div v-show="openAccordion === i" class="accordion-body">
              <SanityBlocks class="sanity-blocks" :blocks="item.accordionContent" />
            </div>
          </transition>
        </div>
      </div>

      <!-- Carousel -->
      <!-- v-if="section.sectionType === 'carousel' && section.images?.length" -->

      <div
      v-if="section.images?.length"
      class="carousel"
      >
        <transition name="fade">
          <img
            :key="currentIndex"
            :src="section.images[currentIndex]?.asset?.url"
            class="carousel-image"
          />
        </transition>
        <!-- <button class="carousel-btn prev" @click="prev">‹</button>
        <button class="carousel-btn next" @click="next">›</button> -->
      </div>

  <!-- Team / Collaborators -->
<div v-if="['team', 'collaborators'].includes(section.sectionType)" class="people-grid">
 
  <div
    class="person-card"
    v-for="(person, i) in section.people"
    :key="i"
  >
    <div class="person-image">
      <img
        v-if="person.image?.asset?.url"
        :src="person.image.asset.url"
        :alt="person.name"
      />
    </div>

    <div class="person-info">
      <h3>{{ person.name }}</h3>

      <!-- Role acts as bio preview -->
      <p class="person-role-preview">{{ truncatedBio(person.role) }}</p>

      <button
        v-if="hasRoleContent(person.role)"
        class="see-more-btn"
        @click="openOverlay(person)"
      >
        See More
      </button>
    </div>
  </div>

  <!-- Overlay -->
  <transition name="overlay-fade-slide">
    <div v-if="activePerson" class="overlay" @click.self="closeOverlay">
      <div class="overlay-content">
        <div class="overlay-image">
          <img :src="activePerson.image.asset.url" :alt="activePerson.name" />
        </div>
        <div class="overlay-text">
          <!-- <h2>{{ activePerson.name }}</h2> -->
          <SanityBlocks
            v-if="isBlockContent(activePerson && activePerson.role)"
            :blocks="activePerson.role"
            class="overlay-role overlay-sanity-blocks portable-text sanity-blocks"
          />
          <p v-else-if="activePerson && activePerson.role">{{ activePerson.role }}</p>
          <button class="close-btn" @click="closeOverlay">×</button>
        </div>
      </div>
    </div>
  </transition>
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
      activePerson: null,
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
    truncatedBio(content) {
      const text = this.extractPlainText(content);
      if (!text) return '';
      return text.length > 100 ? text.slice(0, 100) + '…' : text;
    },
    extractPlainText(content) {
      if (!content) return '';
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content
          .map(block => {
            if (!block || block._type !== 'block' || !Array.isArray(block.children)) {
              return '';
            }
            return block.children.map(child => child?.text || '').join('');
          })
          .join('\n')
          .trim();
      }
      return '';
    },
    hasRoleContent(content) {
      if (Array.isArray(content)) {
        return content.some(
          block =>
            block?._type === 'block' &&
            Array.isArray(block.children) &&
            block.children.some(child => child?.text)
        );
      }
      return Boolean(content);
    },
    isBlockContent(content) {
      return Array.isArray(content);
    },
    openOverlay(person) {
      this.activePerson = person;
      document.body.style.overflow = 'hidden';
    },
    closeOverlay() {
      this.activePerson = null;
      document.body.style.overflow = '';
    },
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
  /* background: #ffffff7f; */
  color: #111;
  color: white;
  overflow-y: auto;
  padding: 6rem 6vw 8rem;
  /* font-family: "Inter", "Helvetica Neue", sans-serif; */
  /* backdrop-filter: blur(50px) !important; */
  /* background: #ffffff; */
  /* background-color: hsl(0deg 0% 100% / 13%) !important; */
}

/* Background overlay (if needed for transitions) */
.overlay-bg {
  position: fixed;
  inset: 0;
  /* background: #f8f8f89c; */
  z-index: -1;
  transition: opacity 0.5s;
}

.carousel {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: right;
  /* align-items: center; */
  margin: 4rem 0;
}

.carousel-image{
  width: 50%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
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
  border-top: 1px solid white;
  border-bottom: 1px solid white;
  /* border: white; */
  padding: 1rem 0;
  letter-spacing: 0.5px;
}

p {
  background-image: url('/images/textbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
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
  /* margin-top: 3rem;
  border-top: 1px solid #ddd; */
  display: flex;
  width: 100%;
  flex-wrap: wrap;
    justify-content: center;
  /* flex-direction: column; */
}
/* 
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
} */

.accordion{
  padding: 2vw;
}
.accordion-header {
  width: 100%;
    background: none;
    border: none;
    padding: 2vw;
    border: 1px solid #ddd;
    font-size: 1rem;
    font-weight: 400;
    /* padding: 2vw; */
    width: max-content;
    border-radius: 50px;
    text-align: left;
    display: flex
;
    justify-content: space-between;
    cursor: pointer;
    color: white;
    transition: color 0.3s ease;
}
.accordion-header:hover {
  color: black; 
background-color: white;
}
.accordion-body {
  padding: 1rem 0 1.5rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #333;
  width: 100%;
    left: 0;
    margin-top: 8vw;
    position: absolute;
    padding: 6vw;
    min-height: max-content;
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

/* Left half: show left arrow cursor */
/* .carousel-left-hover {
  cursor: url("/images/lefta.png") 8 8, auto; 
} */
 /* Right half: show right arrow cursor */
/* .carousel-right-hover {
  cursor: url("/images/righta.png") 8 8, auto;
} */


/* .carousel-btn.prev {
  left: 0;
}
.carousel-btn.next {
  right: 0;
} */
.people-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(22vw, 1fr));
  gap: 2vw;
  justify-content: center;
  padding: 4vw;
}

.person-card {
  background: #f8f8f8;
  --bg-gradient: linear-gradient(169.78deg, hsla(0, 0%, 100%, 0.23) 4.65%, hsla(0, 0%, 100%, 0) 91.48%), radial-gradient(62.3% 67.27% at 20.42% 27.48%, #5e4b1e 0%, #2b2a28 100%), linear-gradient(112.91deg, #676561 3.51%, #242321 111.71%); 
  background: radial-gradient(circle, #215623b5, #1642189e 0, #21562396 16%, #dd56ff4d, #f3c1ff4d, #eabbf6bb, #d1c8cd3c);
    background-blend-mode: screen, overlay, normal;
    background-attachment: fixed;
    background-size: cover;
    background-position: center; 
  border-radius: 1vw;
  box-shadow: 0 0.6vw 1vw rgba(0, 0, 0, 0.08);
  overflow: hidden;
  text-align: center;
  padding: 2vw;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.person-card:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.12);
}

.person-image img {
  width: 100%;
  height: 22vw;
  object-fit: cover;
  border-radius: 1vw;
}

.person-info {
  margin-top: 1.5vw;
}

.person-info h3 {
  font-size: 1.4vw;
  font-weight: 600;
  color: #ffffff;
}

.person-role-preview {
  font-size: 1vw;
  color: #ffffff;
  margin-top: 0.8vw;
  min-height: 3vw;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.see-more-btn {
  background: none;
  border: none;
  color: #ffffff;
  font-size: 1vw;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.8vw;
  transition: color 0.2s ease;
}
.see-more-btn:hover {
  color: #ffffff;
}

/* Overlay */
.overlay {
  position: fixed;
  top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    height: 100%;
    background: rgba(20, 20, 20, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
    overflow: scroll;
}

.overlay-content {
  display: flex;
    background: white;
    --bg-gradient: linear-gradient(169.78deg, hsla(0, 0%, 100%, 0.23) 4.65%, hsla(0, 0%, 100%, 0) 91.48%), radial-gradient(62.3% 67.27% at 20.42% 27.48%, #5e4b1e 0%, #2b2a28 100%), linear-gradient(112.91deg, #676561 3.51%, #242321 111.71%); 
  background: radial-gradient(circle, #215623b5, #1642189e 0, #21562396 16%, #dd56ff4d, #f3c1ff4d, #eabbf6bb, #d1c8cd3c);
    background-blend-mode: screen, overlay, normal;
    background-attachment: fixed;
    background-size: cover;
    background-position: center; 
    border-radius: 1vw;
    max-width: 70vw;
    height: 100vh;
    height: 80vh;
    width: 100%;
    overflow: hidden;
    box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.2);
    transform: translateY(5vh);
    justify-content: center;
}

.overlay-image {
  flex: 1;
}
.overlay-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-text {
  flex: 1;
  padding: 3vw;
  position: relative;
  overflow: scroll;
}
.overlay-text h2 {
  font-size: 2vw;
  margin-bottom: 1vw;
  color: #ffffff;
}
.overlay-text p {
  font-size: 1.1vw;
  line-height: 1.6;
  color: #ffffff;
}
.overlay-text :deep(.overlay-sanity-blocks p) {
  font-size: 0.9vw;
  line-height: 1.5;
  color: #ffffff;
  margin-bottom: 0.8vw;
}
.overlay-text :deep(.overlay-sanity-blocks p em),
.overlay-text :deep(.overlay-sanity-blocks p strong) {
  font-size: inherit;
  line-height: inherit;
}

.close-btn {
  position: absolute;
  top: 1vw;
  right: 1vw;
  background: none;
  border: none;
  font-size: 2vw;
  cursor: pointer;
  color: #ffffff;
}

/* Animations */
.overlay-fade-slide-enter-active,
.overlay-fade-slide-leave-active {
  transition: opacity 0.4s ease, transform 0.5s ease;
}
.overlay-fade-slide-enter,
.overlay-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(5vh);
}

/* Mobile */
@media (max-width: 768px) {
  .overlay-content {
    flex-direction: column;
    max-width: 90vw;
  }
  .overlay-text {
    padding: 6vw;
  }
  .overlay-text h2 {
    font-size: 5vw;
  }
  .overlay-text p {
    font-size: 3.5vw;
  }
  .overlay-text :deep(.overlay-sanity-blocks p) {
    font-size: 3vw;
    line-height: 1.6;
  }
}


</style>
