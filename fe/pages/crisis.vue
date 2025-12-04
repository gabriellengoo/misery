<template>
   <div class="crisis-page">
    <div class="page-container" v-if="page">
      <h1 class="page-title">{{ page.title }}</h1>
      <div v-html="renderBlockContent(page.content)" class="page-content crisis-body"></div>
    </div>
    <button class="back-to-top" @click="scrollToTop">back to top ↑</button>
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
      },
      scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  .crisis-page{
    background-color: #ffffff;
    padding: 4vw 0 8vw;
    min-height: 100vh;
    transition: background-color 0.3s ease;
  }
  body.dark-mode .crisis-page {
    background-color: #050505;
    color: white;
  }
  body.dark-mode .crisis-page .page-container {
    color: white;
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
  
  :deep(.crisis-body) {
    font-size: 1.5vw;
    line-height: 1.7;
  }
  :deep(.crisis-body p) {
    margin-bottom: 1.5vw;
  }
  :deep(.crisis-body a) {
    color: #39c1d3;
    text-decoration: underline;
    border-bottom: none;
    transition: color 0.2s ease, background 0.2s ease;
  }
  :deep(.crisis-body a:hover) {
    color: #fff;
    background: #39c1d3;
  }

  :deep(.crisis-body strong) {
    background: rgba(57, 193, 211, 0.3);
    color: #050505;
    padding: 0.15em 0.45em;
    border-radius: 0.2em;
    font-size: 1.7vw;
    display: inline-block;
  }
  
  .page-container {
    /* background-color: white; */
    padding: 4vw;
    max-width: 900px;
    margin: 0 auto;
    font-family: "Helvetica Neue", sans-serif;
    line-height: 1.6;
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
    z-index: 49;
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .back-to-top:hover {
    transform: translateY(-4px);
    background: #39c1d3;
    color: #050505;
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
    .page-title { font-size: 6vw;     padding-top: 10vw; }
    .page-toc button { font-size: 3vw; padding: 1vw 2vw; margin-bottom: 2vw; }
    .section-title { font-size: 5vw; }
    .section-description { font-size: 3.5vw; margin-bottom: 4vw; }
    .carousel-item { min-width: 60vw; }
    .page-summary {
      font-size: 4vw;
      margin-bottom: 6vw;
    }
    .crisis-body {
    font-size: 3.5vw;
    line-height: 1.7;
    }
  }
  </style>
  
