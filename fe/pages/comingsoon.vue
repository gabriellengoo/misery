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
      <h1 class="hero-title coming-soon-title">miseryparty.org coming soon</h1>
      <div class="coming-soon-image">
        <div class="coming-soon-spread" aria-label="Cover preview">
          <div class="coming-soon-page">
            <canvas ref="coverFrontCanvas" class="coming-soon-canvas"></canvas>
          </div>
          <div class="coming-soon-page">
            <canvas ref="coverBackCanvas" class="coming-soon-canvas"></canvas>
          </div>
          <div v-if="coverPreviewError" class="coming-soon-preview-message">
            PDF preview unavailable
          </div>
          <div v-else-if="!coverHasRendered" class="coming-soon-preview-message">
            loading cover...
          </div>
        </div>
      </div>
      <header class="preorder-hero">
        <!-- <p class="hero-eyebrow">order our cookbook!</p> -->
        <h1 class="hero-title">order our cookbook!</h1>
        <p class="hero-description">
      misery meals is a choose-your-own-adventure collection of recipes, art and resources by mad and disabled, queer and trans, global majority people world-over, to be used always, but especially when we’re feeling miserable. This is an intuitive guide for when we need to eat but aren’t sure exactly when or what or fucking how.
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
            order misery meals!
          </a>
          <p class="coming-soon-text">
           ordering is currently only available uk-wide. sign up to our newsletter to hear when we go international!
          </p>
        </div>
      </header>

      <section class="contact-card newsletter-card">
        <p class="card-label">newsletter</p>
        <h2>stay in the loop</h2>
        <p class="portable-text">
    everything we do is announced through our newsletter first! sign up for event tickets, book updates, our monthly misery messageboard and more <3
        </p>
        <a
          class="subscribe-btn"
          href="https://miseryparty.substack.com/subscribe"
          target="_blank"
          rel="noopener noreferrer"
        >
          subscribe
        </a>
      </section>

      <section class="contact-card password-card">
        <p class="card-label">site access</p>
        <h2>enter password</h2>
        <p class="portable-text">
          admin only
        </p>
        <form class="password-form" @submit.prevent="unlockSite">
          <label class="sr-only" for="site-gate-password">site password</label>
          <input
            id="site-gate-password"
            v-model="password"
            class="password-input"
            type="password"
            name="password"
            autocomplete="current-password"
            placeholder="enter password"
            :disabled="isSubmitting"
          />
          <button class="subscribe-btn password-submit" type="submit" :disabled="isSubmitting">
            {{ isSubmitting ? 'unlocking...' : 'enter site' }}
          </button>
        </form>
        <p v-if="passwordMessage" class="password-message" :class="{ 'is-error': passwordError }">
          {{ passwordMessage }}
        </p>
      </section>
    </div>
  </div>
</template>

<script>
const SHOPWIRED_PREORDER_URL = 'https://cookbook.miseryparty.org';
const COVER_PDF_PATH = '/images/cover.pdf';
const PDF_JS_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDF_JS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let pdfScriptPromise = null;
const pdfDocumentCache = new Map();

function normalizeExternalUrl(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function loadPdfJsScript() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfScriptPromise) return pdfScriptPromise;

  pdfScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pdfjs="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.pdfjsLib), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load PDF.js')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = PDF_JS_SCRIPT;
    script.async = true;
    script.dataset.pdfjs = 'true';
    script.onload = () => resolve(window.pdfjsLib);
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });

  return pdfScriptPromise;
}

function loadPdfDocument(pdfjsLib, path) {
  if (pdfDocumentCache.has(path)) {
    return pdfDocumentCache.get(path);
  }

  const promise = pdfjsLib
    .getDocument({
      url: path,
      rangeChunkSize: 65536,
      disableAutoFetch: true,
      disableStream: false,
    })
    .promise
    .catch((error) => {
      pdfDocumentCache.delete(path);
      throw error;
    });

  pdfDocumentCache.set(path, promise);
  return promise;
}

export default {
  layout: 'preorder',
  data() {
    return {
      preorderLink: SHOPWIRED_PREORDER_URL,
      hasLink: true,
      coverHasRendered: false,
      coverPreviewError: false,
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
      bodyClass: 'preorder-body-bg',
      password: '',
      isSubmitting: false,
      passwordMessage: '',
      passwordError: false,
    };
  },
  async fetch() {
    const query = `*[_type == "preorderPage"][0]{ preorderLink }`;
    const doc = await this.$sanity.fetch(query);
    if (doc?.preorderLink) {
      this.preorderLink = doc.preorderLink;
    } else {
      this.preorderLink = SHOPWIRED_PREORDER_URL;
    }
    this.hasLink = true;
  },
  computed: {
    preorderHref() {
      return this.hasLink ? normalizeExternalUrl(this.preorderLink) : '#';
    },
    preorderTarget() {
      return this.hasLink ? '_blank' : undefined;
    },
    preorderRel() {
      return this.hasLink ? 'noopener noreferrer' : undefined;
    },
  },
  mounted() {
    if (process.client) {
      document.body.classList.add(this.bodyClass);
    }
    this.renderCoverSpread();
  },
  beforeDestroy() {
    if (process.client) {
      document.body.classList.remove(this.bodyClass);
    }
  },
  methods: {
    async unlockSite() {
      if (!this.password.trim() || this.isSubmitting) {
        return;
      }

      this.isSubmitting = true;
      this.passwordMessage = '';
      this.passwordError = false;

      try {
        const response = await fetch('/api/site-gate/unlock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: this.password }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.message || 'Unable to unlock the site.');
        }

        this.password = '';
        this.passwordMessage = 'access granted. opening site...';
        window.location.assign('/');
      } catch (error) {
        this.passwordError = true;
        this.passwordMessage = error.message || 'Incorrect password.';
      } finally {
        this.isSubmitting = false;
      }
    },
    async renderCoverSpread() {
      if (this.coverHasRendered) return;

      try {
        const pdfjsLib = await loadPdfJsScript();
        if (!pdfjsLib?.GlobalWorkerOptions) {
          throw new Error('PDF.js did not initialize correctly');
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;

        const pdf = await loadPdfDocument(pdfjsLib, COVER_PDF_PATH);
        const firstCanvas = this.$refs.coverBackCanvas;
        const lastCanvas = this.$refs.coverFrontCanvas;

        if (!firstCanvas || !lastCanvas) return;

        await Promise.all([
          this.renderPdfPageToCanvas(pdf, 1, firstCanvas),
          this.renderPdfPageToCanvas(pdf, pdf.numPages, lastCanvas),
        ]);

        this.coverHasRendered = true;
      } catch {
        this.coverPreviewError = true;
      }
    },
    async renderPdfPageToCanvas(pdf, pageNumber, canvas) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const pageWidth = Math.max(140, canvas.parentElement?.clientWidth || 220);
      const scale = Math.max(0.2, Math.min(1.2, pageWidth / baseViewport.width));
      const viewport = page.getViewport({ scale });
      const context = canvas.getContext('2d', { alpha: false });

      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`;

      await page.render({ canvasContext: context, viewport }).promise;
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
  background-image:url('https://i.ibb.co/QFVGVJ8p/micbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
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

.coming-soon-title {
  text-align: center;
}

.coming-soon-image {
  width: min(100%, 42rem);
  margin: 0 auto;
  padding: 0.75rem;
  /* border-radius: 24px; */
  /* background: rgba(8, 10, 18, 0.5); */
  /* border: 1px solid rgba(255, 255, 255, 0.18); */
  /* box-shadow: 0 18px 40px rgba(0, 0, 0, 0.28); */
}

.coming-soon-spread {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  /* gap: 0.75rem; */
}

.coming-soon-page {
  /* border-radius: 18px; */
  overflow: hidden;
  /* background: rgba(255, 255, 255, 0.92); */
  min-height: 12rem;
}

.coming-soon-canvas {
  display: block;
  width: 100%;
  height: auto;
}

.coming-soon-preview-message {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  /* background: rgba(8, 10, 18, 0.68); */
  /* color: rgba(255, 255, 255, 0.92); */
  text-transform: lowercase;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
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

.password-card {
  max-width: 34rem;
}

.password-form {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  align-items: center;
  margin-top: 1.25rem;
}

.password-input {
  flex: 1 1 16rem;
  min-width: 0;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.9rem 1.1rem;
  font: inherit;
}

.password-input::placeholder {
  color: rgba(255, 255, 255, 0.55);
}

.password-input:focus {
  outline: none;
  border-color: rgba(57, 193, 211, 0.95);
  box-shadow: 0 0 0 3px rgba(57, 193, 211, 0.18);
}

.password-submit {
  margin-top: 0;
  border: none;
  cursor: pointer;
}

.password-submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.password-message {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  text-transform: lowercase;
  color: rgba(255, 255, 255, 0.88);
}

.password-message.is-error {
  color: #ffd4ea;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.subscribe-btn {
  display: inline-flex;
  margin-top: 1.25rem;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  text-transform: lowercase;
  font-weight: 600;
  background: linear-gradient(120deg, #39c1d3, #ff73f0);
  color: #050505;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.subscribe-btn:hover {
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

  .password-form {
    flex-direction: column;
    align-items: stretch;
  }

  .coming-soon-spread {
    gap: 0.5rem;
  }

}

.coming-soon-text {
  display: inline-block;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  background: rgba(8, 10, 18, 0.72);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.6;
  text-transform: lowercase;
  margin: 0;
}

</style>

<style>
.preorder-body-bg {
  background-image: url('/images/bgmis.png'), url('/images/micbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  width: 100%;
  height: 100vh;
  font-family: 'Syne', sans-serif;
  min-height: 100vh !important;
}
</style>
