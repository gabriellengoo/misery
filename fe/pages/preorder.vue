<template>
  <div class="preorder-page">
    <div class="overlay-bg"></div>

    <div
      v-for="floating in floatingImages"
      :key="floating.src + floating.className"
      class="floating-img"
      :class="floating.className"
    >
      <img :src="floating.src" :alt="floating.alt" />
    </div>

    <div class="bgoverlay">
      <img src="/images/bgnew.png" alt="background" />
    </div>

    <div class="preorder-shell">
      <header class="preorder-hero">
        <p class="hero-eyebrow">preorder our cookbook!</p>
        <h1 class="hero-title">preorder our cookbook!</h1>
        <p class="hero-description">
          A handcrafted collection of queer recipes, rituals, and the anarchic energy that fuels Misery.
          The limited print run is almost ready—reserve your copy now and we will update your inbox with drop
          details and community shout-outs.
        </p>

        <div class="hero-actions">
          <a
            class="preorder-btn"
            :href="preorderHref"
            :target="preorderTarget"
            :rel="preorderRel"
            :class="{ 'is-disabled': !hasLink }"
            :aria-disabled="!hasLink"
          >
            pre order link
          </a>
          <p class="coming-soon-text">
            coming soon: collective shipping windows, prideful notes, and sneak peeks—locked in via the
            newsletter below.
          </p>
        </div>
      </header>

      <section class="contact-card newsletter-card">
        <p class="card-label">newsletter</p>
        <h2>stay in the loop</h2>
        <p class="portable-text">
          Subscribe for dispatch updates, early access, and queer-affirming secret codes from the Misery
          crew—vibes, no spam, just solidarity.
        </p>
        <form action="https://formspree.io/f/mjvlyreg" method="POST" target="_blank">
          <input type="email" name="email" placeholder="your email" required />
          <button type="submit">subscribe</button>
        </form>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'preorder',
  data() {
    return {
      preorderLink: '',
      hasLink: false,
      floatingImages: [
        {
          className: 'img-right',
          src: 'https://i.ibb.co/sFyFWsf/Bald.png',
          alt: 'floating sculpture',
        },
        {
          className: 'img-left',
          src: 'https://i.ibb.co/TKVh7wG/Misery-Meets-Confidence-11-24-2020-1.png',
          alt: 'floating collage',
        },
        {
          className: 'img-left2',
          src: 'https://i.ibb.co/VvxBzzg/Misery-Meets2square.png',
          alt: 'floating sticker',
        },
        {
          className: 'img-orbit',
          src: 'https://i.ibb.co/1fnPWwYv/1.png',
          alt: 'floating element',
        },
        {
          className: 'img-burst',
          src: 'https://i.ibb.co/1J285jQ9/Layer-19.png',
          alt: 'floating burst',
        },
        {
          className: 'img-drift',
          src: 'https://i.ibb.co/PspPkhDf/Layer-20.png',
          alt: 'floating drift',
        },
        {
          className: 'img-glow',
          src: 'https://i.ibb.co/VWmwtcLn/Layer-21.png',
          alt: 'floating glow',
        },
        {
          className: 'img-swirl',
          src: 'https://i.ibb.co/sdTLb7Sj/Layer-22.png',
          alt: 'floating swirl',
        },
        {
          className: 'img-arc',
          src: 'https://i.ibb.co/Vcm8FdC4/Layer-23.png',
          alt: 'floating arc',
        },
      ],
    };
  },
  async fetch() {
    const query = `*[_type == "preorderPage"][0]{ preorderLink }`;
    const doc = await this.$sanity.fetch(query);
    if (doc?.preorderLink) {
      this.preorderLink = doc.preorderLink;
      this.hasLink = true;
    }
  },
  computed: {
    preorderHref() {
      return this.hasLink ? this.preorderLink : '#';
    },
    preorderTarget() {
      return this.hasLink ? '_blank' : undefined;
    },
    preorderRel() {
      return this.hasLink ? 'noopener noreferrer' : undefined;
    },
  },
};
</script>

<style scoped>
.preorder-page {
  position: relative;
  min-height: 100vh;
  padding: 5rem 5vw 6rem;
  color: white;
  overflow: hidden;
}

.overlay-bg {
  position: absolute;
  inset: 0;
  filter: blur(70px);
  opacity: 0.85;
  z-index: 1;
}

.preorder-shell {
  position: relative;
  z-index: 3;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.preorder-hero {
  padding: 1.25rem 0;
  text-transform: lowercase;
}

.hero-eyebrow {
  letter-spacing: 0.5em;
  font-size: 0.8rem;
  margin-bottom: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.hero-title {
  font-size: clamp(2.75rem, 5vw, 4.2rem);
  margin: 0;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: lowercase;
}

.hero-description {
  margin: 1.5rem 0 1rem;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  max-width: 620px;
}

.hero-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.preorder-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1.2rem 3rem;
  border-radius: 999px;
  border: none;
  background: linear-gradient(120deg, #ff73f0, #39c1d3);
  color: #050505;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: lowercase;
  letter-spacing: 0.05em;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.preorder-btn:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 20px 40px rgba(57, 193, 211, 0.3);
}

.preorder-btn.is-disabled {
  pointer-events: none;
  opacity: 0.6;
  box-shadow: none;
}

.newsletter-card {
  position: relative;
  padding: 2rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(24px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
  background: rgba(0, 0, 0, 0.45);
}

.newsletter-card h2 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  margin-bottom: 0.9rem;
  font-weight: 400;
  text-transform: lowercase;
}

.card-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: 0.4rem;
  letter-spacing: 0.2em;
}

.portable-text {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
}

.newsletter-card form {
  margin-top: 1.25rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.newsletter-card input[type='email'] {
  flex: 1 1 220px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.newsletter-card input::placeholder {
  color: rgba(255, 255, 255, 0.45);
}

.newsletter-card input:focus {
  border-color: #9efcff;
}

.newsletter-card button {
  flex: 0 0 auto;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  border: none;
  text-transform: lowercase;
  background: linear-gradient(120deg, #39c1d3, #ff73f0);
  color: #050505;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.newsletter-card button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(80, 9, 110, 0.25);
}

.bgoverlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  opacity: 0.06;
  mix-blend-mode: hard-light;
}

.bgoverlay img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .preorder-page {
    padding: 4rem 4vw 5rem;
  }

  .hero-actions {
    gap: 0.75rem;
  }

  .preorder-btn {
    padding: 1rem 2.25rem;
    font-size: 1rem;
  }

  .newsletter-card {
    padding: 1.5rem;
  }

  .newsletter-card form {
  flex-direction: column;
}

.newsletter-card input,
.newsletter-card button {
    width: 100%;
    flex: 1 1 0;
  }
}

.coming-soon-text {
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.6);
  text-transform: lowercase;
  margin: 0;
}
</style>
