<template>
    <div class="press-page">
      <SiteHeader />
  
      <div class="logo-container">
        <img src="/images/misery.gif" alt="logo" class="logo" />
      </div>
  
      <div class="content">
        <div
          v-for="(section, i) in pressPage?.sections"
          :key="i"
          class="accordion"
        >
          <div class="accordion-header" @click="toggle(i)">
            <h2>{{ section.title }}</h2>
            <span class="icon">{{ activeIndex === i ? '-' : '+' }}</span>
          </div>
          <div
            class="accordion-body"
            v-show="activeIndex === i"
          >
            <SanityBlocks :blocks="section.content" />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import SiteHeader from "@/components/SiteHeader.vue";
  import SanityBlocks from "sanity-blocks-vue-component";
  
  export default {
    components: { SiteHeader, SanityBlocks },
    data() {
      return {
        pressPage: null,
        activeIndex: 0, // first accordion open
      };
    },
    async fetch() {
      const query = `*[_type == "pressPage"][0]{
        sections[]{
          title,
          content
        }
      }`;
      this.pressPage = await this.$sanity.fetch(query);
    },
    methods: {
      toggle(i) {
        this.activeIndex = this.activeIndex === i ? -1 : i;
      },
    },
  };
  </script>
  
  <style scoped>
  .press-page {
    padding: 4rem 2rem;
    max-width: 900px;
    margin: auto;
  }
  
  .logo-container {
    text-align: center;
    margin-bottom: 3rem;
  }
  
  .logo {
    height: 80px;
  }
  
  .accordion {
    border-bottom: 1px solid #ddd;
    margin-bottom: 1rem;
  }
  
  .accordion-header {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    padding: 1rem 0;
    font-weight: 700;
  }
  
  .accordion-body {
    padding: 1rem 0;
  }
  </style>
  