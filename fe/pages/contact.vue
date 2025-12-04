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

        <section v-if="page.socialLinks?.length" class="contact-card">
          <p class="card-label">social</p>
          <h2>follow us</h2>
          <ul class="contact-list">
            <li v-for="(link, i) in page.socialLinks" :key="i">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener"
                :aria-label="link.label"
              >
                <!-- <template v-if="isTwitter(link.label)"> -->
                  <!-- <svg
                    viewBox="0 0 24 24"
                    width="34"
                    height="34"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M19.7828 3.91825C20.1313 3.83565 20.3743 3.75444 20.5734 3.66915C20.8524 3.54961 21.0837 3.40641 21.4492 3.16524C21.7563 2.96255 22.1499 2.9449 22.4739 3.11928C22.7979 3.29366 23 3.6319 23 3.99986C23 5.08079 22.8653 5.96673 22.5535 6.7464C22.2911 7.40221 21.9225 7.93487 21.4816 8.41968C21.2954 11.7828 20.3219 14.4239 18.8336 16.4248C17.291 18.4987 15.2386 19.8268 13.0751 20.5706C10.9179 21.3121 8.63863 21.4778 6.5967 21.2267C4.56816 20.9773 2.69304 20.3057 1.38605 19.2892C1.02813 19.0108 0.902313 18.5264 1.07951 18.109C1.25671 17.6916 1.69256 17.4457 2.14144 17.5099C3.42741 17.6936 4.6653 17.4012 5.6832 16.9832C5.48282 16.8742 5.29389 16.7562 5.11828 16.6346C4.19075 15.9925 3.4424 15.1208 3.10557 14.4471C2.96618 14.1684 2.96474 13.8405 3.10168 13.5606C3.17232 13.4161 3.27562 13.293 3.40104 13.1991C2.04677 12.0814 1.49999 10.5355 1.49999 9.49986C1.49999 9.19192 1.64187 8.90115 1.88459 8.71165C1.98665 8.63197 2.10175 8.57392 2.22308 8.53896C2.12174 8.24222 2.0431 7.94241 1.98316 7.65216C1.71739 6.3653 1.74098 4.91284 2.02985 3.75733C2.1287 3.36191 2.45764 3.06606 2.86129 3.00952C3.26493 2.95299 3.6625 3.14709 3.86618 3.50014C4.94369 5.36782 6.93116 6.50943 8.78086 7.18568C9.6505 7.50362 10.4559 7.70622 11.0596 7.83078C11.1899 6.61019 11.5307 5.6036 12.0538 4.80411C12.7439 3.74932 13.7064 3.12525 14.74 2.84698C16.5227 2.36708 18.5008 2.91382 19.7828 3.91825ZM10.7484 9.80845C10.0633 9.67087 9.12171 9.43976 8.09412 9.06408C6.7369 8.56789 5.16088 7.79418 3.84072 6.59571C3.86435 6.81625 3.89789 7.03492 3.94183 7.24766C4.16308 8.31899 4.5742 8.91899 4.94721 9.10549C5.40342 9.3336 5.61484 9.8685 5.43787 10.3469C5.19827 10.9946 4.56809 11.0477 3.99551 10.9046C4.45603 11.595 5.28377 12.2834 6.66439 12.5135C7.14057 12.5929 7.49208 13.0011 7.49986 13.4838C7.50765 13.9665 7.16949 14.3858 6.69611 14.4805L5.82565 14.6546C5.95881 14.7703 6.103 14.8838 6.2567 14.9902C6.95362 15.4727 7.65336 15.6808 8.25746 15.5298C8.70991 15.4167 9.18047 15.6313 9.39163 16.0472C9.60278 16.463 9.49846 16.9696 9.14018 17.2681C8.49626 17.8041 7.74425 18.2342 6.99057 18.5911C6.63675 18.7587 6.24134 18.9241 5.8119 19.0697C6.14218 19.1402 6.48586 19.198 6.84078 19.2417C8.61136 19.4594 10.5821 19.3126 12.4249 18.6792C14.2614 18.0479 15.9589 16.9385 17.2289 15.2312C18.497 13.5262 19.382 11.1667 19.5007 7.96291C19.51 7.71067 19.6144 7.47129 19.7929 7.29281C20.2425 6.84316 20.6141 6.32777 20.7969 5.7143C20.477 5.81403 20.1168 5.90035 19.6878 5.98237C19.3623 6.04459 19.0272 5.94156 18.7929 5.70727C18.0284 4.94274 16.5164 4.43998 15.2599 4.77822C14.6686 4.93741 14.1311 5.28203 13.7274 5.89906C13.3153 6.52904 13 7.51045 13 8.9999C13 9.28288 12.8801 9.5526 12.6701 9.74221C12.1721 10.1917 11.334 9.92603 10.7484 9.80845Z"
                    />
                  </svg> -->
                <!-- </template> -->
                <!-- <template v-if="isInstagram(link.label)"> -->
                  <!-- <svg
                    viewBox="0 0 24 24"
                    width="34"
                    height="34"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z"
                      stroke="currentColor"
                      stroke-width="2"
                    />
                    <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  </svg> -->
                <!-- </template> -->
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
    isTwitter(label) {
      return typeof label === "string" && label.toLowerCase().includes("twitter");
    },
    isInstagram(label) {
      return typeof label === "string" && label.toLowerCase().includes("insta");
    },
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
