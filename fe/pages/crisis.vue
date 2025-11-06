<template>
   <div class="get-involved-page">
    <div class="page-container" v-if="page">
      <h1 class="page-title">{{ page.title }}</h1>
      <div v-html="renderBlockContent(page.content)" class="page-content"></div>
    </div>
   </div>
  </template>
  
  <script>
  import sanityClient from '@sanity/client';
  import BlockContent from '@sanity/block-content-to-html';
  
  const client = sanityClient({
    projectId: 'gsh23bac',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: true
  });
  
  export default {
    data() {
      return {
        page: null
      };
    },
    async fetch() {
      const query = `*[_type == "crisisPage"][0]{ title, content }`;
      this.page = await client.fetch(query);
    },
    methods: {
      renderBlockContent(blocks) {
        return blocks ? BlockContent({ blocks }) : '';
      }
    }
  };
  </script>
  
  <style scoped>
  .page-summary {
    font-size: 1.4vw;
    color: #444;
    margin-bottom: 3vw;
    line-height: 1.6;
    text-align: center;
  }
  
  .get-involved-page{
    background-color: #ffffff;
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

  .page-content div p {
    margin-bottom: 1.5vw;
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
    background: none;
    border: 1px solid #000000;
    /* border-radius: 0.5vw; */
    padding: 0.5vw 1vw;
    cursor: pointer;
    font-size: 1vw;
    transition: background 0.3s, color 0.3s, border-color 0.3s;
  }
  .page-toc button:hover {
    background: #5a6b41;
    color: #fff;
    border-color: #5a6b41;
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
  