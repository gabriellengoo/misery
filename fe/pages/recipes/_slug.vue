<template>
  <main class="recipe-pdf-page">
    <nav class="recipe-topbar" aria-label="Recipe navigation">
      <button type="button" class="recipe-topbar__btn" @click="goBack">Back</button>
      <nuxt-link to="/miserymeals" class="recipe-topbar__btn">miserymeals</nuxt-link>
      <nuxt-link to="/recipes" class="recipe-topbar__btn">View all recipes</nuxt-link>
    </nav>

    <header class="recipe-header">
      <h1 class="recipe-title">{{ recipe.title }}</h1>
      <p class="recipe-meta">
        <span>{{ recipe.chef || 'Misery collective' }}</span>
        <span aria-hidden="true">·</span>
        <span class="recipe-meta-spoons">
          <span class="recipe-spoon-icons" :aria-label="spoonLabel">
            <img
              v-for="n in spoonIcons"
              :key="`meta-spoon-${n}`"
              src="/images/spoon.png"
              alt=""
              aria-hidden="true"
              class="recipe-spoon-icon"
            />
            <span v-if="spoonIcons.length === 0">no spoons :'(</span>
          </span>
        </span>
      </p>
    </header>

    <section
      class="pdf-scroll-viewer"
      :class="{ 'pdf-scroll-viewer--single': renderedPages.length === 1 }"
      aria-label="Recipe PDF pages"
    >
      <p v-if="loading" class="pdf-status pdf-status--loading">
        <img
          v-if="cornerMascot"
          :src="cornerMascot"
          alt=""
          aria-hidden="true"
          class="pdf-status-mascot"
        />
        <span>
          Loading pages
          <span class="pdf-status-dots" aria-hidden="true"><span>.</span><span>.</span><span>.</span></span>
        </span>
      </p>
      <p v-else-if="loadError" class="pdf-status pdf-status--error">{{ loadError }}</p>

      <div
        v-for="(row, rowIndex) in pageRows"
        :key="`pdf-row-${rowIndex}`"
        class="pdf-page-row"
        :class="{ 'pdf-page-row--single': renderedPages.length === 1 }"
      >
        <article
          v-for="page in row"
          :key="`pdf-page-${page.pageNumber}`"
          class="pdf-page-card"
        >
          <div class="pdf-page-inner" :style="{ '--page-aspect': page.aspectRatio }">
            <canvas
              :ref="`canvas-${page.pageNumber}`"
              class="pdf-canvas"
              :aria-label="`Cookbook page ${page.pageNumber}`"
            ></canvas>

            <div v-if="page.hotspots.length" class="hotspot-layer">
              <button
                v-for="(hotspot, index) in page.hotspots"
                :key="`hs-${page.pageNumber}-${index}`"
                type="button"
                class="hotspot"
                :style="hotspotStyle(hotspot)"
                @click="handleHotspotClick(hotspot, page.pageNumber, index)"
              >
                <span class="hotspot-dot"></span>
                <img
                  v-if="hotspot.type === 'spoon'"
                  class="hotspot-spoon"
                  src="/images/spoon.png"
                  alt=""
                  aria-hidden="true"
                  :class="{ 'hotspot-spoon--visible': activeSpoonKey === spoonKey(page.pageNumber, index) }"
                />
                <span class="sr-only">{{ hotspot.type }} hotspot</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      <div v-if="showZeroSpoonsCta" class="recipe-end-cta">
        <nuxt-link to="/recipes?spoons=0" class="recipe-end-cta__link">
          See all 0 spoon recipes
        </nuxt-link>
      </div>
    </section>

    <HotspotModal
      :open="modal.open"
      :type="modal.type"
      :text="modal.text"
      :audio-url="modal.audioUrl"
      :video-url="modal.videoUrl"
      @close="closeModal"
    />

    <img
      v-if="cornerMascot"
      :src="cornerMascot"
      alt=""
      aria-hidden="true"
      class="recipe-mascot-corner"
    />
  </main>
</template>

<script>
import sanityClient from '@/plugins/sanity'
import HotspotModal from '@/components/HotspotModal.vue'
import { resolveSpoonColor } from '@/utils/spoonColors'
import { resolveSpoonMascot } from '@/utils/spoonMascots'

const PDF_JS_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDF_JS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clampPercent(value) {
  const num = toNumber(value, 0)
  return Math.max(0, Math.min(100, num))
}

export default {
  components: {
    HotspotModal,
  },
  async asyncData({params, error}) {
    const query = `*[_type == "recipe" && websiteListed == true && slug.current == $slug][0]{
      title,
      chef,
      spoonLevel,
      pageStart,
      pageEnd,
      pdfPath,
      hotspots[]{
        pageNumber,
        x,
        y,
        w,
        h,
        type,
        text,
        audioUrl,
        videoUrl
      }
    }`

    const recipe = await sanityClient.fetch(query, {slug: params.slug})

    if (!recipe) {
      error({statusCode: 404, message: 'Recipe not found'})
      return
    }

    return {recipe}
  },
  data() {
    return {
      loading: true,
      loadError: '',
      renderedPages: [],
      modal: {
        open: false,
        type: '',
        text: '',
        audioUrl: '',
        videoUrl: '',
      },
      activeSpoonKey: '',
    }
  },
  computed: {
    spoonLabel() {
      const count = Math.max(0, Math.min(5, toNumber(this.recipe?.spoonLevel, 0)))
      return `${count} spoon${count === 1 ? '' : 's'}`
    },
    spoonIcons() {
      const count = Math.max(0, Math.min(5, toNumber(this.recipe?.spoonLevel, 0)))
      return Array.from({length: count}, (_, index) => index + 1)
    },
    effectiveSpoonLevel() {
      const raw = Array.isArray(this.$route.query?.spoons)
        ? this.$route.query.spoons[0]
        : this.$route.query?.spoons
      const parsed = Number.parseInt(raw, 10)
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 5) return parsed
      return this.recipe?.spoonLevel
    },
    cornerMascot() {
      return resolveSpoonMascot(this.effectiveSpoonLevel)
    },
    showZeroSpoonsCta() {
      return this.$route?.params?.slug === 'appetite-regulation-spread'
    },
    normalizedHotspots() {
      if (!Array.isArray(this.recipe?.hotspots)) return []
      return this.recipe.hotspots
        .map((hotspot) => ({
          pageNumber: toNumber(hotspot?.pageNumber, 0),
          x: clampPercent(hotspot?.x),
          y: clampPercent(hotspot?.y),
          w: clampPercent(hotspot?.w),
          h: clampPercent(hotspot?.h),
          type: String(hotspot?.type || '').trim().toLowerCase(),
          text: String(hotspot?.text || '').trim(),
          audioUrl: String(hotspot?.audioUrl || '').trim(),
          videoUrl: String(hotspot?.videoUrl || '').trim(),
        }))
        .filter((hotspot) => hotspot.pageNumber > 0 && ['audio', 'text', 'spoon', 'video'].includes(hotspot.type))
    },
    pageRows() {
      const rows = []
      for (let index = 0; index < this.renderedPages.length; index += 2) {
        rows.push(this.renderedPages.slice(index, index + 2))
      }
      return rows
    },
  },
  watch: {
    effectiveSpoonLevel: {
      immediate: true,
      handler() {
        this.applyBodyBackground()
      },
    },
  },
  async mounted() {
    if (!process.client || typeof document === 'undefined') return
    this.applyBodyBackground()
    await this.renderPdfPages()
  },
  beforeDestroy() {
    if (!process.client || typeof document === 'undefined') return
    document.body.style.background = ''
  },
  methods: {
    applyBodyBackground() {
      if (!process.client || typeof document === 'undefined') return
      document.body.style.background = resolveSpoonColor(this.effectiveSpoonLevel)
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
        return
      }
      this.$router.push('/recipes')
    },
    spoonKey(pageNumber, index) {
      return `${pageNumber}-${index}`
    },
    hotspotStyle(hotspot) {
      return {
        left: `${hotspot.x}%`,
        top: `${hotspot.y}%`,
        width: `${hotspot.w}%`,
        height: `${hotspot.h}%`,
      }
    },
    handleHotspotClick(hotspot, pageNumber, index) {
      if (hotspot.type === 'spoon') {
        const key = this.spoonKey(pageNumber, index)
        this.activeSpoonKey = this.activeSpoonKey === key ? '' : key
        return
      }

      this.modal = {
        open: true,
        type: hotspot.type,
        text: hotspot.text || '',
        audioUrl: hotspot.audioUrl || '',
        videoUrl: hotspot.videoUrl || '',
      }
    },
    closeModal() {
      this.modal = {
        open: false,
        type: '',
        text: '',
        audioUrl: '',
        videoUrl: '',
      }
    },
    loadPdfJsScript() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)

      return new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-pdfjs="true"]')
        if (existing) {
          existing.addEventListener('load', () => resolve(window.pdfjsLib), {once: true})
          existing.addEventListener('error', () => reject(new Error('Failed to load PDF.js')), {once: true})
          return
        }

        const script = document.createElement('script')
        script.src = PDF_JS_SCRIPT
        script.async = true
        script.dataset.pdfjs = 'true'
        script.onload = () => resolve(window.pdfjsLib)
        script.onerror = () => reject(new Error('Failed to load PDF.js'))
        document.head.appendChild(script)
      })
    },
    pageHotspots(pageNumber) {
      return this.normalizedHotspots.filter((hotspot) => hotspot.pageNumber === pageNumber)
    },
    async renderPdfPages() {
      this.loading = true
      this.loadError = ''

      try {
        const pdfjsLib = await this.loadPdfJsScript()
        if (!pdfjsLib?.GlobalWorkerOptions) {
          throw new Error('PDF.js did not initialize correctly')
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER

        const configuredPath = String(this.recipe?.pdfPath || '').trim()
        const candidatePaths = [configuredPath, '/cookbook.pdf', '/images/cookbook.pdf'].filter(Boolean)

        let pdf = null
        let lastError = null
        for (const path of candidatePaths) {
          try {
            // eslint-disable-next-line no-await-in-loop
            pdf = await pdfjsLib.getDocument(path).promise
            break
          } catch (error) {
            lastError = error
          }
        }
        if (!pdf) {
          throw new Error(lastError?.message || 'Unable to load cookbook PDF from configured paths')
        }

        const pageStart = Math.max(1, toNumber(this.recipe?.pageStart, 1))
        const requestedPageEnd = Math.max(pageStart, toNumber(this.recipe?.pageEnd, pageStart))
        const pageEnd = Math.min(pdf.numPages, requestedPageEnd)

        const pages = []

        for (let pageNumber = pageStart; pageNumber <= pageEnd; pageNumber += 1) {
          // eslint-disable-next-line no-await-in-loop
          const page = await pdf.getPage(pageNumber)
          const viewport = page.getViewport({scale: 1})

          pages.push({
            page,
            pageNumber,
            width: viewport.width,
            height: viewport.height,
            aspectRatio: `${viewport.width} / ${viewport.height}`,
            hotspots: this.pageHotspots(pageNumber),
          })
        }

        this.renderedPages = pages
        await new Promise((resolve) => this.$nextTick(resolve))
        for (const item of this.renderedPages) {
          const canvasRef = this.$refs[`canvas-${item.pageNumber}`]
          const canvas = Array.isArray(canvasRef) ? canvasRef[0] : canvasRef
          if (!canvas) continue

          const context = canvas.getContext('2d', {alpha: false})
          const displayWidth = Math.max(260, canvas.clientWidth || 0)
          const targetWidth = displayWidth * Math.min(window.devicePixelRatio || 1, 2)
          const scale = Math.max(0.65, targetWidth / item.width)
          const viewport = item.page.getViewport({scale})

          canvas.width = Math.floor(viewport.width)
          canvas.height = Math.floor(viewport.height)

          // eslint-disable-next-line no-await-in-loop
          await item.page.render({canvasContext: context, viewport}).promise
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        this.loadError = error?.message || 'Failed to render PDF pages.'
      }
    },
  },
  head() {
    return {
      title: this.recipe ? `${this.recipe.title} · Misery Meals` : 'Recipe',
    }
  },
}
</script>

<style scoped>
.recipe-pdf-page {
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 88px 0 48px;
}

.recipe-topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  width: min(760px, 92vw);
  margin-left: auto;
  margin-right: auto;
}

.recipe-topbar__btn {
  border: 1px solid rgba(255, 79, 184, 0.45);
  border-radius: 999px;
  background: #fff;
  color: #c33770;
  font-family: "Inter", sans-serif;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
  padding: 8px 14px;
  cursor: pointer;
}

.recipe-header {
  width: min(760px, 92vw);
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 16px;
}

.recipe-title {
  margin: 0;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  line-height: 1.15;
  color: #4b2b3d;
}

.recipe-meta {
  margin: 8px 0 0;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  color: #8a4e6e;
  font-size: 0.95rem;
}

.recipe-meta-spoons {
  display: inline-flex;
  align-items: center;
}

.recipe-spoon-icons {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 236, 84, 0.98);
  border-radius: 999px;
  padding: 4px 10px;
  color: #6f3d59;
  font-size: 0.82rem;
  line-height: 1;
}

.recipe-spoon-icon {
  width: clamp(18px, 2vw, 26px);
  height: auto;
  object-fit: contain;
}

.pdf-scroll-viewer {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: min(980px, 82vw);
  margin: 0 auto;
}

.pdf-scroll-viewer--single {
  width: min(520px, 82vw);
}

.pdf-status {
  grid-column: 1 / -1;
  margin: 0;
  color: #6f3d59;
  font-family: "Inter", sans-serif;
}

.pdf-status--loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9f2b62;
  font-weight: 700;
}

.pdf-status-mascot {
  width: 20px;
  height: 20px;
  object-fit: contain;
  animation: pdf-loading-mascot-jitter 0.34s ease-in-out infinite;
}

.pdf-status-dots {
  display: inline-flex;
  min-width: 16px;
}

.pdf-status-dots span {
  animation: pdf-loading-dot 0.9s infinite;
  opacity: 0.25;
}

.pdf-status-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.pdf-status-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

.pdf-status--error {
  color: #a12d52;
}

.pdf-page-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 0;
  padding: 0;
  box-shadow: none;
  will-change: transform;
}

.pdf-page-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 0;
  will-change: transform;
}

.pdf-page-row--single {
  grid-template-columns: minmax(0, 1fr);
  justify-items: center;
}

.pdf-page-row:hover {
  animation: pdf-soft-float 1.8s ease-in-out infinite;
}

.pdf-page-inner {
  position: relative;
  width: 100%;
  aspect-ratio: var(--page-aspect);
  background: #fff;
  overflow: hidden;
}

.pdf-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.hotspot-layer {
  position: absolute;
  inset: 0;
}

.hotspot {
  position: absolute;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.hotspot-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 13px;
  height: 13px;
  border-radius: 999px;
  background: #ff4fb8;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 0 rgba(255, 79, 184, 0.55);
  animation: hotspot-pulse 1.7s infinite;
}

.hotspot:hover .hotspot-dot {
  background: #de2e9d;
}

.hotspot-spoon {
  position: absolute;
  left: 50%;
  top: 50%;
  width: clamp(24px, 3.5vw, 42px);
  transform: translate(-50%, -50%) scale(0.65);
  opacity: 0;
  transition: opacity 140ms ease, transform 140ms ease;
  pointer-events: none;
}

.hotspot:hover .hotspot-spoon,
.hotspot-spoon--visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@keyframes hotspot-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 79, 184, 0.5);
  }
  80% {
    box-shadow: 0 0 0 12px rgba(255, 79, 184, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 79, 184, 0);
  }
}

@keyframes pdf-soft-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes pdf-loading-dot {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

@keyframes pdf-loading-mascot-jitter {
  0%, 100% { transform: translateX(-2px) rotate(-3deg); filter: brightness(0.95); }
  50% { transform: translateX(2px) rotate(3deg); filter: brightness(1.15); }
}

.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
}

.recipe-mascot-corner {
  position: fixed;
  right: clamp(10px, 2vw, 24px);
  bottom: clamp(10px, 2vw, 24px);
  width: clamp(88px, 10vw, 152px);
  z-index: 30;
  pointer-events: none;
  opacity: 0.95;
  animation: mascot-corner-bob 7.2s ease-in-out infinite;
}

@keyframes mascot-corner-bob {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-10px) rotate(1.5deg); }
}

.recipe-end-cta {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin: 6px 0 16px;
}

.recipe-end-cta__link {
  border: 1px solid rgba(60, 91, 153, 0.52);
  border-radius: 999px;
  background: #fff;
  color: #264b84;
  text-decoration: none;
  padding: 10px 16px;
  font-family: "Inter", sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
}

@media (max-width: 900px) {
  .pdf-page-row {
    grid-template-columns: 1fr;
  }
}
</style>
