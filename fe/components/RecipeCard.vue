<template>
  <nuxt-link :to="slug ? `/recipes/${slug}` : '/recipes'" class="recipe-card">
    <div ref="previewWrap" class="recipe-card-preview-wrap">
      <canvas ref="previewCanvas" class="recipe-card-preview"></canvas>
      <div v-if="previewError" class="recipe-card-preview-placeholder">PDF preview unavailable</div>
      <div v-else-if="!hasRendered" class="recipe-card-preview-placeholder recipe-card-preview-placeholder--loading">
        <img
          v-if="loadingMascotUrl"
          :src="loadingMascotUrl"
          alt=""
          aria-hidden="true"
          :class="['recipe-card-loading-mascot', `recipe-card-loading-mascot--level-${spoonLevel}`]"
        />
        <span class="recipe-card-loading-text">
          Loading
          <span class="recipe-card-loading-dots" aria-hidden="true">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </span>
      </div>
    </div>

    <h2 class="recipe-card-title">{{ title }}</h2>
    <p class="recipe-card-spoons">{{ spoonLabel }}</p>
  </nuxt-link>
</template>

<script>
import { resolveSpoonMascot } from '@/utils/spoonMascots'

const PDF_JS_SCRIPT = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
const PDF_JS_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

let pdfScriptPromise = null
const pdfDocumentCache = new Map()

function loadPdfJsScript() {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)
  if (pdfScriptPromise) return pdfScriptPromise

  pdfScriptPromise = new Promise((resolve, reject) => {
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

  return pdfScriptPromise
}

async function loadPdfDocument(pdfjsLib, path) {
  if (pdfDocumentCache.has(path)) {
    return pdfDocumentCache.get(path)
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
      pdfDocumentCache.delete(path)
      throw error
    })

  pdfDocumentCache.set(path, promise)
  return promise
}

export default {
  name: 'RecipeCard',
  props: {
    title: {
      type: String,
      default: '',
    },
    slug: {
      type: String,
      default: '',
    },
    spoonLevel: {
      type: Number,
      default: 0,
    },
    pageStart: {
      type: [Number, String],
      default: 1,
    },
    pdfPath: {
      type: String,
      default: '/cookbook.pdf',
    },
  },
  data() {
    return {
      observer: null,
      hasRendered: false,
      previewError: false,
    }
  },
  computed: {
    spoonLabel() {
      const value = Number.isFinite(this.spoonLevel) ? this.spoonLevel : 0
      const safe = Math.max(0, Math.min(5, Math.trunc(value)))
      return `${safe} spoon${safe === 1 ? '' : 's'}`
    },
    firstPageNumber() {
      const parsed = Number.parseInt(this.pageStart, 10)
      if (Number.isInteger(parsed) && parsed > 0) return parsed
      return 1
    },
    loadingMascotUrl() {
      return resolveSpoonMascot(this.spoonLevel)
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (!entry?.isIntersecting) return
        this.renderPreview()
        if (this.observer) this.observer.disconnect()
      },
      {
        rootMargin: '220px',
        threshold: 0.01,
      }
    )

    if (this.$refs.previewWrap) {
      this.observer.observe(this.$refs.previewWrap)
    }
  },
  beforeDestroy() {
    if (this.observer) this.observer.disconnect()
  },
  methods: {
    async renderPreview() {
      if (this.hasRendered) return

      try {
        const pdfjsLib = await loadPdfJsScript()
        if (!pdfjsLib?.GlobalWorkerOptions) {
          throw new Error('PDF.js did not initialize correctly')
        }

        pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER

        const candidatePaths = ['/api/cookbook-pdf', '/api/cookbook.pdf', this.pdfPath, '/cookbook.pdf', '/images/cookbook.pdf'].filter(Boolean)
        let pdf = null
        for (const path of candidatePaths) {
          try {
            // eslint-disable-next-line no-await-in-loop
            pdf = await loadPdfDocument(pdfjsLib, path)
            break
          } catch {
            // try next path
          }
        }
        if (!pdf) {
          throw new Error('Unable to load cookbook PDF for preview')
        }

        const targetPage = this.firstPageNumber
        const boundedPage = Math.min(pdf.numPages, targetPage)
        const page = await pdf.getPage(boundedPage)

        const baseViewport = page.getViewport({scale: 1})
        const canvas = this.$refs.previewCanvas
        const wrap = this.$refs.previewWrap
        if (!canvas) return

        const cssWidth = Math.max(160, wrap?.clientWidth || 220)
        const renderScale = Math.max(0.2, Math.min(0.52, cssWidth / baseViewport.width))
        const viewport = page.getViewport({scale: renderScale})

        const context = canvas.getContext('2d', {alpha: false})
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.style.aspectRatio = `${baseViewport.width} / ${baseViewport.height}`

        await page.render({canvasContext: context, viewport}).promise
        this.hasRendered = true
      } catch {
        this.previewError = true
      }
    },
  },
}
</script>

<style scoped>
.recipe-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  background: var(--recipes-card-bg, rgba(255, 255, 255, 0.95));
  border-radius: 20px;
  padding: 10px;
  border: 1px solid var(--recipes-card-border, rgba(255, 79, 184, 0.15));
  box-shadow: 0 10px 26px var(--recipes-card-shadow, rgba(180, 114, 141, 0.14));
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(180, 114, 141, 0.2);
}

.recipe-card-preview-wrap {
  position: relative;
  aspect-ratio: 4 / 5;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(145deg, var(--recipes-card-bg, #ffe9f5), #fff);
}

.recipe-card-preview {
  width: 100%;
  height: 100%;
  display: block;
}

.recipe-card-preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(195, 55, 112, 0.66);
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  text-align: center;
  padding: 8px;
}

.recipe-card-preview-placeholder--loading {
  flex-direction: row;
  gap: 8px;
  color: #9f2b62;
  font-weight: 700;
}

.recipe-card-loading-text {
  display: inline-flex;
  align-items: center;
}

.recipe-card-loading-dots {
  display: inline-flex;
  min-width: 16px;
}

.recipe-card-loading-dots span {
  animation: recipe-loading-dot 0.9s infinite;
  opacity: 0.25;
}

.recipe-card-loading-dots span:nth-child(2) {
  animation-delay: 0.15s;
}

.recipe-card-loading-dots span:nth-child(3) {
  animation-delay: 0.3s;
}

.recipe-card-loading-mascot {
  width: 20px;
  height: 20px;
  object-fit: contain;
  animation: recipe-loading-mascot-jitter 0.3s ease-in-out infinite;
}

.recipe-card-loading-mascot--level-5 {
  width: 34px;
  height: 34px;
}

@keyframes recipe-loading-dot {
  0%, 80%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}

@keyframes recipe-loading-mascot-jitter {
  0%, 100% { transform: translateX(-2px) rotate(-3deg); filter: brightness(0.95); }
  50% { transform: translateX(2px) rotate(3deg); filter: brightness(1.15); }
}

.recipe-card-title {
  margin: 0;
  padding: 2px 4px 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.94rem;
  line-height: 1.3;
  color: #5b3a4d;
}

.recipe-card-spoons {
  margin: 0;
  padding: 0 4px 4px;
  font-family: 'Inter', sans-serif;
  font-size: 0.78rem;
  color: #8a4e6e;
}
</style>
