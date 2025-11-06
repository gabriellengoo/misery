<template>
    <div class="page-container" v-if="page">
      <h1>{{ page.title }}</h1>
      <div v-html="renderBlockContent(page.summary)"></div>
  
      <!-- Newsletter -->
      <section v-if="page.newsletter">
        <h2>{{ page.newsletter.title }}</h2>
        <div v-html="renderBlockContent(page.newsletter.description)"></div>
        <form :action="page.newsletter.formspreeUrl" method="POST" target="_blank">
          <input type="email" name="email" placeholder="Your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </section>
  
      <!-- Socials -->
      <section v-if="page.socialLinks?.length">
        <h2>Follow Us</h2>
        <ul>
          <li v-for="(link, i) in page.socialLinks" :key="i">
            <a :href="link.url" target="_blank">{{ link.label }}</a>
          </li>
        </ul>
      </section>
  
      <!-- Email -->
      <section v-if="page.email">
        <h2>Email Us</h2>
        <a :href="'mailto:' + page.email">{{ page.email }}</a>
      </section>
  
      <!-- Anonymous Feedback -->
      <section v-if="page.anonFeedback">
        <h2>Anonymous Feedback</h2>
        <a :href="page.anonFeedback" target="_blank">Submit Feedback</a>
      </section>
  
      <!-- Main Content -->
      <section v-if="page.content?.length">
        <div v-html="renderBlockContent(page.content)"></div>
      </section>
    </div>
  </template>
  
  <script>
  import sanityClient from '@sanity/client';
  import BlockContent from '@sanity/block-content-to-html';
  
  const client = sanityClient({
    projectId: 'gsh23bac',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: true,
  });
  
  export default {
    data() {
      return { page: null };
    },
    async fetch() {
      const query = `*[_type == "contactPage"][0]{
        title,
        summary,
        newsletter{title, description, formspreeUrl},
        socialLinks[]{label, url},
        email,
        anonFeedback,
        content
      }`;
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
  .page-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 4vw 2vw;
    font-family: sans-serif;
    color: #111;
    /* background-color: white; */
  }
  
  .page-container h1 {
    font-size: 3vw;
    font-weight: 700;
    text-align: center;
    margin-bottom: 2vw;
  }
  
  .page-container h2 {
    font-size: 2vw;
    margin-top: 3vw;
    margin-bottom: 1vw;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
    padding-bottom: 0.5vw;
  }
  
  .page-container p,
  .page-container a,
  .page-container li {
    font-size: 1vw;
    line-height: 1.6;
  }
  
  .page-container section {
    margin-bottom: 4vw;
  }
  
  form {
    display: flex;
    flex-wrap: wrap;
    gap: 1vw;
    margin-top: 1vw;
  }
  
  form input[type="email"] {
    flex: 1 1 auto;
    padding: 0.8vw 1vw;
    font-size: 1vw;
    border: 1px solid #ccc;
    border-radius: 0.3vw;
    background: #fff;
    outline: none;
    transition: border 0.2s;
  }
  
  form input[type="email"]:focus {
    border-color: #5a6b41;
  }
  
  form button {
    padding: 0.8vw 1.5vw;
    font-size: 1vw;
    border: none;
    border-radius: 0.3vw;
    background: #5a6b41;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  form button:hover {
    background: #3c482d;
  }
  
  ul {
    list-style: none;
    padding: 0;
  }
  
  ul li {
    margin-bottom: 0.5vw;
  }
  
  ul li a {
    text-decoration: underline;
    color: #111;
    transition: color 0.2s;
  }
  
  ul li a:hover {
    color: #5a6b41;
  }
  
  a {
    color: #111;
    text-decoration: underline;
    transition: color 0.2s;
  }
  
  a:hover {
    color: #5a6b41;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .page-container h1 {
      font-size: 6vw;
    }
    .page-container h2 {
      font-size: 5vw;
    }
    .page-container p,
    .page-container a,
    .page-container li,
    form input,
    form button {
      font-size: 3vw;
    }
    form {
      flex-direction: column;
    }
    form input,
    form button {
      width: 100%;
    }
  }
  </style>
  