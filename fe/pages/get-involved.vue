<template>
 <div class="get-involved-page">
  <div class="page-container" v-if="page">

    <div class="page-header">
      <!-- <h1 class="page-title">{{ page.title }}</h1> -->
      <!-- <div class="furlogo-container"> -->
      <img src="/images/getinfur.png" alt="logo" class="furlogo2" />
    <!-- </div> -->

    <p v-if="page.summary" class="page-summary">{{ page.summary }}</p>

    <nav class="page-toc" v-if="page.sections?.length">
      <ul>
     
        <li v-for="(section, i) in page.sections" :key="i">
          <button @click="scrollToSection(i)">{{ section.title }}</button>
        </li>
      
      </ul>
   
    </nav>
    <!-- <div class="text-[white]">   *•̩̩͙✩•̩̩͙*˚</div>s -->
    </div>

    <div
      v-for="(section, i) in page.sections"
      :key="i"
      class="page-section"
      :ref="'section' + i"
    >
      <h2 class="section-title">{{ section.title }}</h2>

      <!-- Rich text description -->
      <SanityBlocks v-if="section.description" :blocks="section.description" class="section-description" />

      <ul v-if="section.links?.length" class="section-links">
        <li v-for="(link, idx) in section.links" :key="idx">
          <a :href="link.url" target="_blank">{{ link.text }}</a>
        </li>
      </ul>

      <div v-if="section.images?.length" class="section-carousel">
        <div v-for="(img, idx) in section.images" :key="idx" class="carousel-item">
          <img :src="img.asset.url" :alt="section.title + ' image ' + idx" />
        </div>
      </div>
    </div>
  </div>
 </div>
</template>

<script>
import sanityClient from "@sanity/client";
import SanityBlocks from "sanity-blocks-vue-component";

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
      page: null,
    };
  },
  async fetch() {
    const query = `*[_type == "getInvolvedPage"][0]{
      title,
      summary,
      sections[]{
        title,
        description,
        links[]{text, url},
        images[]{asset->{url}}
      }
    }`;
    this.page = await client.fetch(query);
  },
  methods: {
    scrollToSection(index) {
      const sectionEl = this.$refs['section' + index][0];
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
  },
};
</script>


<style scoped>
.page-summary {
  font-size: 1.4vw;
  color: #444;
  margin-bottom: 3vw;
  line-height: 1.6;
  text-align: center;
  font-size: 1.5vw;
    color: #fff;
    /* letter-spacing: 0.05em; */
    /* font-family: 'Antic Didone', serif; */
    text-shadow: 0 0 10px rgba(0, 150, 255, 1), 0 0 20px rgba(0, 150, 255, 0.9), 0 0 40px rgba(0, 100, 255, 0.8), 0 0 60px rgba(0, 100, 255, 0.7), 0 0 90px rgba(0, 150, 255, 0.6);
}

.get-involved-page{
  /* background-color: #f9f9f9c7; */
  padding: 2vw 0;
}

.page-header {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  /* margin-bottom: 6vw; */
}

.page-container {
  /* background-color: white; */
  /* padding: 4vw; */
  max-width: 900px;
  margin: 0 auto;
  font-family: "Helvetica Neue", sans-serif;
  line-height: 1.6;
}

/* Page Title */
.page-title {
  font-size: 3vw;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3vw;
}

/* Table of Contents / Top Nav */
.page-toc {
  margin-bottom: 8vw;
  text-align: center;
}
.page-toc ul {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2vw;
}
.page-toc button {
  border: 1px solid #ffffff;
    padding: 0.6vw 1.4vw;
    font-size: 1.2vw;
    border-radius: 30px;
    cursor: pointer;
    /* background: #1a1a1a; */
    color: white;
    transition: all 0.3s ease;
}
.page-toc button:hover {
  background: #39c1d3;
    border: 0px solid #39c1d3;
    color: #fff;
    box-shadow: 0 4px 8px rgba(80, 9, 110, 0.25);
}

/* Sections */
.page-section {
  margin-bottom: 6vw;
  font-size: 1.05rem;
    line-height: 1.8;
    /* color: #222; */
    background-image: url('/images/textbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;

  margin-bottom: 6vw;
    font-size: 1.05rem;
    line-height: 1.8;
    /* color: #ffffff; */
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.section-title {
  font-size: 2vw;
  font-weight: 600;
  margin-bottom: 1vw;
  font-size: 4vw;
    font-family: "Antic Didone", serif;
    color: #39c1d3;
}

.section-description {
  font-size: 1.2vw;
  color: #555;
  margin-bottom: 2vw;
}

.page-section div p {
  margin-bottom: 1.5vw;
}

/* Links */
.section-links {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.5vw;
  margin-bottom: 2vw;
}
.section-links a {
  color: #5a6b41;
  text-decoration: underline;
  transition: color 0.3s ease;
}
.section-links a:hover {
  color: #3c482d;
}

/* Image carousel */
.section-carousel {
  display: flex;
  overflow-x: auto;
  gap: 1vw;
  padding-bottom: 1vw;
}
.carousel-item {
  min-width: 25vw;
  border-radius: 1vw;
  overflow: hidden;
}
.carousel-item img {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 1vw;
}

/* Mobile */
@media (max-width: 768px) {
  .page-title { font-size: 6vw; }
  .page-toc button { font-size: 3vw; padding: 1vw 2vw; margin-bottom: 2vw; }
  .section-title { font-size: 5vw; }
  .section-description { font-size: 3.5vw; margin-bottom: 4vw; }
  .carousel-item { min-width: 60vw; }
}
</style>
