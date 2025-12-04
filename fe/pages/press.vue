<template>
  <div class="page-container" v-if="page">
    <!-- <h1 class="page-title">{{ page.title }}</h1> -->
    <!-- Centered Logo -->
    <div class="furlogo-container mb-[8vw]">
      <img src="/images/pressfur.png" alt="logo" class="furlogo" />
    </div>

    <div
      v-for="(section, i) in page.sections"
      :key="i"
      class="page-section"
    >
      <h2 class="section-title">{{ section.title }}</h2>
      <p class="section-description">{{ section.description }}</p>

      <div class="carousel-wrapper">
        <!-- Left arrow -->
        <button
          v-if="section.articles.length > 3"
          class="carousel-arrow left"
          @click="scrollLeft(i)"
        >
        <svg class="leftarr" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11 9L8 12M8 12L11 15M8 12H16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
        </button>

        <!-- Flex container for horizontal scroll -->
        <div class="flyers-carousel" :ref="'carousel' + i">
          <a
            v-for="(article, idx) in section.articles"
            :key="idx"
            :href="article.url"
            target="_blank"
            class="flyer-card"
          >
            <div class="flyer-image" v-if="article.image?.asset?.url">
              <img :src="article.image.asset.url" :alt="article.title" />
            </div>
            <div v-if="article.title || article.shortDescription" class="flyer-info">
              <h3>{{ article.title }}</h3>
              <p>{{ article.shortDescription }}</p>
            </div>
          </a>
        </div>

        <!-- Right arrow -->
        <button
          v-if="section.articles.length > 3"
          class="carousel-arrow right"
          @click="scrollRight(i)"
        >
        <svg class="righttarr" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M13 15L16 12M16 12L13 9M16 12H8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>        </button>
      </div>
    </div>
  </div>
</template>

<script>
import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "gsh23bac",
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

export default {
  data() {
    return {
      page: null,
    };
  },
  async fetch() {
    const query = `*[_type == "pressPage"][0]{
      title,
      sections[]{
        title,
        description,
        articles[]{
          title,
          url,
          shortDescription,
          image{asset->{url}}
        }
      }
    }`;
    this.page = await client.fetch(query);
  },
  methods: {
    scrollLeft(sectionIndex) {
      const carousel = this.$refs['carousel' + sectionIndex][0];
      carousel.scrollBy({ left: -carousel.clientWidth * 0.8, behavior: 'smooth' });
    },
    scrollRight(sectionIndex) {
      const carousel = this.$refs['carousel' + sectionIndex][0];
      carousel.scrollBy({ left: carousel.clientWidth * 0.8, behavior: 'smooth' });
    },
  },
};
</script>

<style scoped>
.page-container {
  padding: 4vw;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 3vw;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3vw;
}

.page-section {
  margin-bottom: 6vw;
}

.section-title {
  font-size: 2vw;
  font-weight: 600;
  margin-bottom: 1vw;
  font-size: 4vw;
  font-family: "Antic Didone", serif;
  color: #ffffff;
  text-shadow: 0 0 7px #39c1d3, 0 0 16px #6cbaad;
  transition: text-shadow 0.3s ease;
  text-align: center;
}

.section-description {
  font-size: 1.2vw;
  color: #555;
  margin-bottom: 2vw;
}

/* Carousel wrapper */
.carousel-wrapper {
  position: relative;
  padding: 0vw 4vw;
}

.flyers-carousel {
  display: flex;
  gap: 2vw;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1vw;
  padding-left: 1vw;
  align-content: center;
  align-items: center;
  scroll-snap-type: x proximity;
}
/* 
.flyers-carousel:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.12);
} */

/* Peek effect: show partial next card */
.flyers-carousel::after {
  content: '';
  min-width: 2vw;
  display: block;
}

/* Hide scrollbar */
.flyers-carousel::-webkit-scrollbar {
  display: none;
}
.flyers-carousel {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.flyer-card {
  flex: 0 0 18vw; /* fixed width for horizontal layout */
  display: flex;
  flex-direction: column;
  /* background: #f8f8f8; */
  --bg-gradient: linear-gradient(169.78deg, hsla(0, 0%, 100%, 0.23) 4.65%, hsla(0, 0%, 100%, 0) 91.48%), radial-gradient(62.3% 67.27% at 20.42% 27.48%, #5e4b1e 0%, #2b2a28 100%), linear-gradient(112.91deg, #676561 3.51%, #242321 111.71%); 
  background: radial-gradient(circle, #215623b5, #1642189e 0, #21562396 16%, #dd56ff4d, #f3c1ff4d, #eabbf6bb, #d1c8cd3c);
    background-blend-mode: screen, overlay, normal;
    background-attachment: fixed;
    background-size: cover;
    background-position: center; 
  border-radius: 1vw;
  overflow: hidden;
  text-decoration: none;
  color: #ffffff;
  height: max-content;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  scroll-snap-align: start;
}

.flyer-card:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.12);
}

.flyer-image img {
  width: auto;
  height: auto;
  object-fit: cover;
}

.flyer-info {
  padding: 1vw;
}

.flyer-info h3 {
  font-size: 1.2vw;
  margin-bottom: 0.5vw;
  font-weight: 600;
}

.flyer-info p {
  font-size: 1vw;
  color: #555;
  line-height: 1.4;
}

/* Minimalistic carousel arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 2.5vw;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s, color 0.2s;
}



.carousel-arrow.left {
  left: -0.5vw;
}

.carousel-arrow.right {
  right: -0.5vw;
}

/* Mobile */
@media (max-width: 768px) {
  .page-container {
    padding: 10vw 6vw;
    padding-right: 0;
  }
  .page-title {
    font-size: 6vw;
  }
  .furlogo-container{
    padding-bottom: 12vw;
  }
  .section-title {
    font-size: 5vw;
  }
  .section-description {
    font-size: 3.5vw;
    margin-bottom: 4vw;
    text-align: center;
  }
  .flyers-carousel {
    gap: 6vw;
    padding: 0 4vw 6vw;
    scroll-snap-type: x mandatory;
  }
  .flyer-card {
    flex: 0 0 90%;
    border-radius: 6vw;
    padding: 4vw;
    scroll-snap-align: start;
  }
  .flyer-image img {
    height: 50vw;
    border-radius: 4vw;
  }
  .flyer-info h3 {
    font-size: 5vw;
    margin-bottom: 2vw;
  }
  .flyer-info p {
    font-size: 3.6vw;
    line-height: 1.6;
  }
  .carousel-arrow {
    font-size: 7vw;
    top: auto;
    bottom: -3vw;
  }
  .carousel-wrapper {
    padding: 0;
  }
}

.flyers-carousel {
  display: flex;
  gap: 2vw;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1vw;
  padding-left: 1vw;
}

/* Each card takes ~1/3 of the visible width minus gaps */
.flyer-card {
  flex: 0 0 calc((100% - 4vw) / 3); /* 3 cards with 2vw gap */
  display: flex;
  flex-direction: column;
  /* background: #f8f8f8; */
  border-radius: 1vw;
  overflow: hidden;
  text-decoration: none;
  /* color: #111; */
  width: 50vw;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flyer-card:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.12);
}

/* Minimalistic carousel arrows */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 2.5vw;
  cursor: pointer;
  z-index: 10;
  transition: transform 0.3s ease, color 0.3s ease;
}



.carousel-arrow.left {
  left: -0.5vw;
}

.carousel-arrow.right {
  right: -0.5vw;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .flyers-carousel {
    gap: 6vw;
  }
  .flyer-card {
    flex: 0 0 90%;
  }
  .carousel-arrow {
    font-size: 7vw;
  }
}
</style>
