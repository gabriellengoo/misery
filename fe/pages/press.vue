<template>
  <div class="page-container" v-if="page">
    <!-- <h1 class="page-title">{{ page.title }}</h1> -->

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
          ◀
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
            <div class="flyer-info">
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
          ▶
        </button>
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
}

.section-description {
  font-size: 1.2vw;
  color: #555;
  margin-bottom: 2vw;
}

/* Carousel wrapper */
.carousel-wrapper {
  position: relative;
}

.flyers-carousel {
  display: flex; /* changed from grid */
  gap: 2vw;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding-bottom: 1vw;
  padding-left: 1vw; /* optional small offset */
}

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
  background: #f8f8f8;
  border-radius: 1vw;
  overflow: hidden;
  text-decoration: none;
  color: #111;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.flyer-card:hover {
  transform: translateY(-0.5vw);
  box-shadow: 0 1vw 2vw rgba(0, 0, 0, 0.12);
}

.flyer-image img {
  width: 100%;
  height: 20vw;
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
  .page-title {
    font-size: 6vw;
  }
  .section-title {
    font-size: 5vw;
  }
  .section-description {
    font-size: 3.5vw;
    margin-bottom: 4vw;
  }
  .flyers-carousel {
    gap: 4vw;
  }
  .flyer-card {
    flex: 0 0 60vw;
  }
  .flyer-image img {
    height: 40vw;
  }
  .flyer-info h3 {
    font-size: 4vw;
  }
  .flyer-info p {
    font-size: 3vw;
  }
  .carousel-arrow {
    font-size: 5vw;
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
  background: #f8f8f8;
  border-radius: 1vw;
  overflow: hidden;
  text-decoration: none;
  color: #111;
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
    gap: 4vw;
  }
  .flyer-card {
    flex: 0 0 80%; /* show one card mostly on mobile */
  }
  .carousel-arrow {
    font-size: 5vw;
  }
}
</style>
