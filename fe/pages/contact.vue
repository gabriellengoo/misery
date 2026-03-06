<template>
  <div class="contact-page section-page" v-if="page">
    <div class="overlay-bg"></div>

    <div class="floating-img img-right">
      <img src="https://i.ibb.co/sFyFWsf/Bald.png" alt="floating sculpture" />
    </div>

    <div class="floating-img img-left">
      <img
        src="https://i.ibb.co/TKVh7wG/Misery-Meets-Confidence-11-24-2020-1.png"
        alt="floating collage"
      />
    </div>

    <div class="floating-img img-left2">
      <img src="https://i.ibb.co/VvxBzzg/Misery-Meets2square.png" alt="floating sticker" />
    </div>

    <div class="floating-img img-orbit">
      <img src="https://i.ibb.co/1fnPWwYv/1.png" alt="floating collage 1" />
    </div>

    <div class="floating-img img-burst">
      <img src="https://i.ibb.co/1J285jQ9/Layer-19.png" alt="floating collage 2" />
    </div>

    <div class="floating-img img-drift">
      <img src="https://i.ibb.co/PspPkhDf/Layer-20.png" alt="floating collage 3" />
    </div>

    <div class="floating-img img-glow">
      <img src="https://i.ibb.co/VWmwtcLn/Layer-21.png" alt="floating collage 4" />
    </div>

    <div class="floating-img img-swirl">
      <img src="https://i.ibb.co/sdTLb7Sj/Layer-22.png" alt="floating collage 5" />
    </div>

    <div class="floating-img img-arc">
      <img src="https://i.ibb.co/Vcm8FdC4/Layer-23.png" alt="floating collage 6" />
    </div>

    <div class="contact-shell">
      <header class="contact-hero">
        <!-- <p class="eyebrow">stay connected</p> -->
        <!-- <h1 class="contact-title">{{ page.title }}</h1> -->
           <!-- Centered Logo -->
    <div class="furlogo-container">
      <img src="/images/contfur.png" alt="logo" class="furlogo" />
    </div>

        <SanityBlocks
          v-if="page.summary"
          :blocks="page.summary"
          class="portable-text intro copy"
        />
      </header>

      <div class="contact-grid">
        <section v-if="page.newsletter" class="contact-card accent">
          <p class="card-label">newsletter</p>
          <h2>{{ page.newsletter.title }}</h2>
          <SanityBlocks
            v-if="page.newsletter.description"
            :blocks="page.newsletter.description"
            class="portable-text"
          />
          <form :action="page.newsletter.formspreeUrl" method="POST" target="_blank">
            <input type="email" name="email" placeholder="your email" required />
            <button type="submit">subscribe</button>
          </form>
        </section>

        <section v-if="visibleSocialLinks.length" class="contact-card">
          <p class="card-label">social</p>
          <h2>follow us</h2>
          <ul class="contact-list">
            <li v-for="(link, i) in visibleSocialLinks" :key="i">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener"
                :aria-label="link.label"
              >
                <span>{{ link.label }}</span>
              </a>
            </li>
          </ul>
        </section>

        <section v-if="page.email || page.anonFeedback" class="contact-card">
          <p class="card-label">direct lines</p>
          <div class="contact-links">
            <div v-if="page.email" class="contact-link">
              <span>Email Us</span>
              <a :href="'mailto:' + page.email">{{ page.email }}</a>
            </div>
            <div v-if="page.anonFeedback" class="contact-link">
              <span>Anonymous Feedback</span>
              <a :href="page.anonFeedback" target="_blank" rel="noopener">Submit feedback →</a>
            </div>
          </div>
        </section>
      </div>

      <section v-if="page.content?.length" class="contact-card full portable-text">
        <SanityBlocks :blocks="page.content" class="portable-text" />
      </section>
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
    return { page: null };
  },
  computed: {
    visibleSocialLinks() {
      if (!Array.isArray(this.page?.socialLinks)) {
        return [];
      }

      return this.page.socialLinks.filter((link) => {
        const label = (link?.label || "").toLowerCase();
        const url = (link?.url || "").toLowerCase();
        return !(
          label.includes("twitter") ||
          url.includes("twitter.com") ||
          url.includes("x.com")
        );
      });
    },
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
};
</script>

<style scoped>
.section-page {
  position: relative;
  min-height: 100vh;
  padding: 6rem 5vw 8rem;
  color: white;
  /* background: radial-gradient(circle at top, rgba(255, 255, 255, 0.05), transparent) #050505; */
  overflow: hidden;
}

.overlay-bg {
  position: absolute;
  inset: 0;
  /* background: linear-gradient(120deg, rgba(0, 0, 0, 0.4), rgba(25, 25, 25, 0.9)); */
  filter: blur(60px);
  opacity: 0.9;
  z-index: 1;
}

.contact-shell {
  position: relative;
  z-index: 3;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.contact-hero {
  /* border-top: 1px solid rgba(255, 255, 255, 0.2); */
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.2); */
  padding: 1.5rem 0;
  text-transform: lowercase;
}

.eyebrow {
  letter-spacing: 0.35em;
  font-size: 0.75rem;
  /* text-transform: uppercase; */
  opacity: 0.7;
  margin-bottom: 0.75rem;
}

.contact-title {
  font-size: clamp(2rem, 4vw, 4rem);
  font-weight: 400;
  margin-bottom: 1rem;
}

.portable-text {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}

.contact-card {
  position: relative;
  padding: 1.75rem;
  /* background: rgba(0, 0, 0, 0.45); */
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.35);
}

.contact-card h2 {
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
  text-transform: lowercase;
}

.card-label {
  font-size: 0.75rem;
  /* letter-spacing: 0.25em; */
  /* text-transform: uppercase; */
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 0.75rem;
  display: block;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.contact-list a {
  color: white;
  text-decoration: none;
  font-size: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 0.2rem;
  transition: color 0.2s ease, border-color 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-list a:hover {
  color: #9efcff;
  border-color: #9efcff;
}

.contact-list svg {
  width: 34px;
  height: 34px;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-link span {
  display: block;
  font-size: 0.9rem;
  /* text-transform: uppercase; */
  /* letter-spacing: 0.2em; */
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 0.35rem;
}

.contact-link a {
  color: white;
  font-size: 1rem;
  text-decoration: underline;
  text-underline-offset: 0.2em;
  transition: color 0.2s;
}

.contact-link a:hover {
  color: #9efcff;
}

.contact-card form {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.contact-card input[type="email"] {
  flex: 1 1 220px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.contact-card input[type="email"]::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.contact-card input[type="email"]:focus {
  border-color: #9efcff;
}

.contact-card button {
  flex: 0 0 auto;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  text-transform: lowercase;
  background: linear-gradient(120deg, #ff73f0, #39c1d3);
  /* color: #050505; */
  /* font-weight: 600; */
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(57, 193, 211, 0.35);
}

.contact-card.full {
  grid-column: 1 / -1;
}

.contact-card.accent {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .contact-card {
    padding: 1.25rem;
  }

  .contact-card form {
    flex-direction: column;
  }

  .contact-card input[type="email"],
  .contact-card button {
    width: 100%;
    flex: 1 1 20px;
  }
}
</style>
