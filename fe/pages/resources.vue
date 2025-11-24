<template>
  <div class="get-involved-page">
    <div class="page-container" v-if="page">
 <div class="page-header">
       <!-- <h1 class="page-title">{{ page.title }}</h1> -->
       <img src="/images/resofur.png" alt="logo" class="furlogo2" />
       <!-- <h1 class="page-title">{{ page.title }}</h1> -->
      <!-- Page Summary -->
      <!-- <div v-if="page.summary" class="page-summary" v-html="renderBlockContent(page.summary)"></div> -->
      <p class="page-summary">{{ page.title }} <nuxt-link to="/crisis" class="font-bold" v-if="page.summary" >*click here for crisis support*</nuxt-link></p>

      
  
      <!-- Table of Contents -->
      <nav class="page-toc" v-if="page.sections?.length">
        <ul>
          <li v-for="(section, i) in page.sections" :key="i">
            <button @click="scrollToSection(i)">{{ section.title }}</button>
          </li>
        </ul>
      </nav>
      </div>
  
      <!-- Sections -->
      <div
        v-for="(section, i) in page.sections"
        :key="i"
        class="page-section"
        :ref="'section' + i"
      >
        <h2 class="section-title">{{ section.title }}</h2>

        <div class="resources-body" v-html="renderBlockContent(section.content)"></div>

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
    <button class="back-to-top" @click="scrollToTop">back to top ↑</button>
  </div>
  </template>
  
  <script>
  import sanityClient from "@sanity/client";
  import BlockContent from "@sanity/block-content-to-html";
  
  const client = sanityClient({
    projectId: "gsh23bac",
    dataset: "production",
    apiVersion: "2023-01-01",
    useCdn: true,
  });
  
  export default {
    data() {
      return { page: null };
    },
    async fetch() {
      const query = `*[_type == "resourcesPage"][0]{
        title,
        summary,
        sections[]{
          title,
          content,
          links[]{text,url},
          images[]{asset->{url}}
        }
      }`;
      this.page = await client.fetch(query);
    },
    methods: {
      renderBlockContent(blocks) {
        return blocks ? BlockContent({ blocks }) : '';
      },
      scrollToSection(index) {
        const sectionEl = this.$refs['section' + index][0];
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
      scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }; 
  </script>
  
  <style scoped>
:deep(.resources-body a) {
  color: #39c1d3;
  text-decoration: underline;
  border-bottom: none;
}

:deep(.resources-body a:hover) {
  color: #fff;
  background: #39c1d3;
}


  .page-summary {
    font-size: 1.4vw;
    /* color: #444; */
    margin-bottom: 3vw;
    line-height: 1.6;
    text-align: center;
  }

  a:hover{
    text-decoration: underline;
  }
  
  .get-involved-page{
    background-color: #f9f9f9c7;
    background-color: #ffffff;
    padding: 2vw 0;
    transition: background-color 0.3s ease;
  }
  body.dark-mode .get-involved-page {
    background-color: #050505;
    color: white;
  }
  body.dark-mode .get-involved-page .page-container {
    color: white;
  }

  .back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #111;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 0.8rem 1.5rem;
    text-transform: lowercase;
    letter-spacing: 0.15em;
    cursor: pointer;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    z-index: 50;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .back-to-top:hover {
    transform: translateY(-4px);
    background: #39c1d3;
    color: #050505;
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
    padding: 4vw;
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
    border: 1px solid #000000;
    padding: 0.6vw 1.4vw;
    font-size: 1.2vw;
    border-radius: 30px;
    cursor: pointer;
    /* background: #1a1a1a; */
    /* color: white; */
    transition: all 0.3s ease;
}
.page-toc button:hover {
  background: #39c1d3;
    border: 0px solid #39c1d3;
    /* color: #fff; */
    box-shadow: 0 4px 8px rgba(80, 9, 110, 0.25);
}

.page-toc button.dark-mode{
  border: 1px solid #ffffff;
    color: white;
}
body.dark-mode .page-toc button {
  border-color: #ffffff;
  color: #ffffff;
}
  
  /* Sections */
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
  
:deep(.resources-body) {
  font-size: 1.5vw;
  line-height: 1.7;
}
:deep(.resources-body p) {
  margin-bottom: 1.5vw;
}
:deep(.resources-body a) {
  color: #39c1d3;
  text-decoration: underline;
  border-bottom: none;
  transition: color 0.2s ease, background 0.2s ease;
}
:deep(.resources-body a:hover) {
  color: #fff;
  background: #39c1d3;
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
  
