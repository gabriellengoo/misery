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
          :class="['pdf-status-mascot', `pdf-status-mascot--level-${effectiveSpoonLevel}`]"
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
              <template v-for="(hotspot, index) in page.hotspots">
                <button
                  :key="`hs-${page.pageNumber}-${index}`"
                  type="button"
                  :class="['hotspot', `hotspot--${hotspot.type}`, { 'hotspot--default': hotspot.source === 'default' }]"
                  :style="hotspotStyle(hotspot)"
                  @click="handleHotspotClick(hotspot, page.pageNumber, index)"
                  :aria-label="hotspotAriaLabel(hotspot)"
                >
                  <span class="hotspot-dot"></span>
                  <span v-if="hotspotLabel(hotspot)" class="hotspot-label">{{ hotspotLabel(hotspot) }}</span>
                  <img
                    v-if="hotspot.type === 'spoon'"
                    class="hotspot-spoon"
                    src="/images/spoon.png"
                    alt=""
                    aria-hidden="true"
                    :class="{ 'hotspot-spoon--visible': activeSpoonKey === spoonKey(page.pageNumber, index) }"
                  />
                  <span class="sr-only">{{ hotspotAriaLabel(hotspot) }}</span>
                </button>

                <div
                  v-if="activeMediaKey === spoonKey(page.pageNumber, index) && (hotspot.type === 'audio' || hotspot.type === 'video')"
                  :key="`panel-${page.pageNumber}-${index}`"
                  class="hotspot-inline-panel"
                  :style="mediaPanelStyle(hotspot)"
                >
                  <audio
                    v-if="hotspot.type === 'audio' && normalizedAudioUrl(hotspot.audioUrl)"
                    controls
                    autoplay
                    preload="metadata"
                    class="hotspot-inline-audio"
                  >
                    <source :src="normalizedAudioUrl(hotspot.audioUrl)" :type="audioMimeType(hotspot.audioUrl)" />
                  </audio>

                  <div
                    v-else-if="hotspot.type === 'video' && videoEmbedUrl(hotspot.videoUrl)"
                    class="hotspot-inline-frame"
                  >
                    <iframe
                      :src="videoEmbedUrl(hotspot.videoUrl)"
                      title="Recipe video"
                      frameborder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>

                  <video
                    v-else-if="hotspot.type === 'video' && isMp4Video(hotspot.videoUrl)"
                    controls
                    autoplay
                    class="hotspot-inline-video"
                  >
                    <source :src="hotspot.videoUrl" type="video/mp4" />
                  </video>

                  <a
                    v-else-if="hotspot.type === 'video' && hotspot.videoUrl"
                    :href="hotspot.videoUrl"
                    target="_blank"
                    rel="noreferrer"
                    class="hotspot-inline-link"
                  >
                    Open
                  </a>
                </div>
              </template>
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
      :class="['recipe-mascot-corner', `recipe-mascot-corner--level-${effectiveSpoonLevel}`]"
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

const DEFAULT_EXTRA_HOTSPOT_AREAS = {
  audio: [
    {x: 12, y: 18, w: 26, h: 16},
    {x: 16, y: 42, w: 24, h: 16},
    {x: 14, y: 72, w: 28, h: 17},
    {x: 52, y: 20, w: 25, h: 16},
    {x: 56, y: 66, w: 24, h: 18},
  ],
  video: [
    {x: 18, y: 24, w: 26, h: 16},
    {x: 22, y: 60, w: 24, h: 18},
    {x: 58, y: 18, w: 26, h: 16},
    {x: 58, y: 46, w: 26, h: 16},
    {x: 58, y: 75, w: 28, h: 17},
  ],
}

function normalizeHotspot(hotspot) {
  return {
    pageNumber: toNumber(hotspot?.pageNumber, 0),
    x: clampPercent(hotspot?.x),
    y: clampPercent(hotspot?.y),
    w: clampPercent(hotspot?.w),
    h: clampPercent(hotspot?.h),
    type: String(hotspot?.type || '').trim().toLowerCase(),
    text: String(hotspot?.text || '').trim(),
    audioUrl: String(hotspot?.audioUrl || '').trim(),
    videoUrl: String(hotspot?.videoUrl || '').trim(),
    label: String(hotspot?.label || '').trim(),
    source: String(hotspot?.source || '').trim(),
  }
}

function hotspotHasPlayableMedia(hotspot) {
  if (!hotspot) return false
  if (hotspot.type === 'audio') return Boolean(String(hotspot.audioUrl || '').trim())
  if (hotspot.type === 'video') return Boolean(String(hotspot.videoUrl || '').trim())
  return true
}

function randomItem(items = []) {
  if (!Array.isArray(items) || items.length === 0) return null
  return items[Math.floor(Math.random() * items.length)] || null
}

function extractGoogleDriveFileId(url) {
  const value = String(url || '').trim()
  if (!value) return ''

  const directMatch = value.match(/[?&]id=([\w-]+)/)
  if (directMatch?.[1]) return directMatch[1]

  const patterns = [
    /drive\.google\.com\/file\/d\/([\w-]+)/,
    /drive\.google\.com\/open\?id=([\w-]+)/,
    /drive\.google\.com\/uc\?.*id=([\w-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return ''
}

function normalizeAudioUrl(url) {
  const value = String(url || '').trim()
  if (!value) return ''

  if (/drive\.google\.com/i.test(value)) {
    const fileId = extractGoogleDriveFileId(value)
    if (fileId) return `https://drive.google.com/uc?export=download&id=${fileId}`
  }

  if (/dropbox\.com/i.test(value)) {
    if (/[?&]raw=1\b/i.test(value)) return value
    if (/[?&]dl=0\b/i.test(value)) return value.replace(/[?&]dl=0\b/i, (match) => match.replace('0', '1'))
    return `${value}${value.includes('?') ? '&' : '?'}raw=1`
  }

  return value
}

function detectAudioMimeType(url) {
  const value = String(url || '').trim().toLowerCase()
  if (!value) return 'audio/mpeg'
  if (/\.m4a(?:$|\?)/.test(value)) return 'audio/mp4'
  if (/\.mp3(?:$|\?)/.test(value)) return 'audio/mpeg'
  if (/\.wav(?:$|\?)/.test(value)) return 'audio/wav'
  if (/\.ogg(?:$|\?)/.test(value)) return 'audio/ogg'
  if (/\.aac(?:$|\?)/.test(value)) return 'audio/aac'
  if (/\.flac(?:$|\?)/.test(value)) return 'audio/flac'
  if (/\.webm(?:$|\?)/.test(value)) return 'audio/webm'
  return 'audio/mpeg'
}

function extractYouTubeId(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}

function extractVimeoId(url) {
  const value = String(url || '').trim()
  if (!value) return ''
  const patterns = [/vimeo\.com\/(?:video\/)?(\d+)/, /player\.vimeo\.com\/video\/(\d+)/]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
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
      voiceNoteUrl,
      "voiceNoteFileUrl": voiceNote.asset->url,
      sourceUrl,
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
      activeMediaKey: '',
      randomizedExtraHotspots: {
        audio: null,
        video: null,
      },
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
      const explicitHotspots = Array.isArray(this.recipe?.hotspots)
        ? this.recipe.hotspots
            .map((hotspot) => normalizeHotspot({...hotspot, source: 'sanity'}))
            .filter((hotspot) => hotspot.pageNumber > 0 && ['audio', 'text', 'spoon', 'video'].includes(hotspot.type))
            .filter((hotspot) => hotspotHasPlayableMedia(hotspot))
        : []

      const fallbackHotspots = []
      const finalPage = Math.max(1, toNumber(this.recipe?.pageEnd, this.recipe?.pageStart || 1))
      const hasAudioHotspot = explicitHotspots.some((hotspot) => hotspot.type === 'audio')
      const hasVideoHotspot = explicitHotspots.some((hotspot) => hotspot.type === 'video')
      const voiceNoteUrl = String(this.recipe?.voiceNoteFileUrl || this.recipe?.voiceNoteUrl || '').trim()
      const sourceUrl = String(this.recipe?.sourceUrl || '').trim()

      const audioArea = this.randomizedExtraHotspots.audio || randomItem(DEFAULT_EXTRA_HOTSPOT_AREAS.audio)
      const videoArea = this.randomizedExtraHotspots.video || randomItem(DEFAULT_EXTRA_HOTSPOT_AREAS.video)

      if (voiceNoteUrl && !hasAudioHotspot && audioArea) {
        fallbackHotspots.push(
          normalizeHotspot({
            ...audioArea,
            pageNumber: finalPage,
            type: 'audio',
            audioUrl: voiceNoteUrl,
            label: 'Voice note',
            source: 'default',
          })
        )
      }

      if (sourceUrl && !hasVideoHotspot && videoArea) {
        fallbackHotspots.push(
          normalizeHotspot({
            ...videoArea,
            pageNumber: finalPage,
            type: 'video',
            videoUrl: sourceUrl,
            label: 'Video',
            source: 'default',
          })
        )
      }

      if (fallbackHotspots.length === 2 && finalPage === toNumber(this.recipe?.pageStart, 1)) {
        fallbackHotspots[0] = normalizeHotspot({
          ...fallbackHotspots[0],
          x: 18,
          w: 24,
        })
        fallbackHotspots[1] = normalizeHotspot({
          ...fallbackHotspots[1],
          x: 58,
          w: 24,
        })
      }

      return [...explicitHotspots, ...fallbackHotspots]
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
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    this.randomizeDefaultExtraHotspots()
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
    randomizeDefaultExtraHotspots() {
      const audioArea = randomItem(DEFAULT_EXTRA_HOTSPOT_AREAS.audio)
      const videoArea = randomItem(DEFAULT_EXTRA_HOTSPOT_AREAS.video)
      this.randomizedExtraHotspots = {
        audio: audioArea ? {...audioArea} : null,
        video: videoArea ? {...videoArea} : null,
      }
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
      const key = this.spoonKey(pageNumber, index)
      if (hotspot.type === 'spoon') {
        this.activeSpoonKey = this.activeSpoonKey === key ? '' : key
        this.activeMediaKey = ''
        return
      }

      if (hotspot.type === 'audio' || hotspot.type === 'video') {
        this.activeMediaKey = this.activeMediaKey === key ? '' : key
        this.activeSpoonKey = ''
        this.closeModal()
        return
      }

      this.modal = {
        open: true,
        type: hotspot.type,
        text: hotspot.text || '',
        audioUrl: hotspot.audioUrl || '',
        videoUrl: hotspot.videoUrl || '',
      }
      this.activeMediaKey = ''
    },
    hotspotAriaLabel(hotspot) {
      if (hotspot.label) return hotspot.label
      if (hotspot.type === 'audio') return 'Open voice note'
      if (hotspot.type === 'video') return 'Open video'
      if (hotspot.type === 'spoon') return 'View spoon note'
      if (hotspot.type === 'text') return 'Open note'
      return 'Open hotspot'
    },
    hotspotLabel(hotspot) {
      if (hotspot.label) return hotspot.label
      if (hotspot.type === 'audio') return 'Voice note'
      if (hotspot.type === 'video') return 'Video'
      if (hotspot.type === 'text') return 'Note'
      return ''
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
    mediaPanelStyle(hotspot) {
      const panelWidth = Math.min(34, Math.max(18, hotspot.w * 1.35))
      const preferRight = hotspot.x > 66
      const preferAbove = hotspot.y > 70
      const top = preferAbove
        ? Math.max(2, hotspot.y - 14)
        : Math.min(82, hotspot.y + hotspot.h + 2)

      return {
        left: preferRight ? 'auto' : `${Math.min(100 - panelWidth - 2, hotspot.x)}%`,
        right: preferRight ? `${Math.max(2, 100 - hotspot.x - hotspot.w)}%` : 'auto',
        top: `${top}%`,
        width: `${panelWidth}%`,
      }
    },
    normalizedAudioUrl(url) {
      return normalizeAudioUrl(url)
    },
    audioMimeType(url) {
      return detectAudioMimeType(normalizeAudioUrl(url))
    },
    isMp4Video(url) {
      return /\.mp4(?:$|\?)/i.test(url || '')
    },
    videoEmbedUrl(url) {
      const ytId = extractYouTubeId(url)
      if (ytId) return `https://www.youtube.com/embed/${ytId}`

      const vimeoId = extractVimeoId(url)
      if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`

      return ''
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
        const candidatePaths = ['/api/cookbook-pdf', '/api/cookbook.pdf', configuredPath, '/cookbook.pdf', '/images/cookbook.pdf'].filter(Boolean)

        let pdf = null
        let lastError = null
        for (const path of candidatePaths) {
          try {
            // eslint-disable-next-line no-await-in-loop
            pdf = await pdfjsLib
              .getDocument({
                url: path,
                rangeChunkSize: 65536,
                disableAutoFetch: true,
                disableStream: false,
              })
              .promise
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
  flex-wrap: nowrap;
  gap: 10px;
  margin-bottom: 18px;
  width: min(760px, 92vw);
  margin-left: auto;
  margin-right: auto;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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

.pdf-status-mascot--level-5 {
  width: 34px;
  height: 34px;
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
  z-index: 2;
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
  transition: transform 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
}

.hotspot:hover .hotspot-dot {
  background: #de2e9d;
  transform: translate(-50%, -50%) scale(2.35);
}

.hotspot:focus-visible {
  outline: 2px solid rgba(76, 35, 56, 0.65);
  outline-offset: 2px;
}

.hotspot-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(14px, -50%);
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 250, 253, 0.94);
  border: 1px solid rgba(195, 55, 112, 0.24);
  color: #9f2b62;
  font-family: "Inter", sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(95, 32, 68, 0.14);
  pointer-events: none;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.hotspot--audio .hotspot-dot {
  background: #ff4fb8;
}

.hotspot--video .hotspot-dot {
  background: #ff8e3c;
  box-shadow: 0 0 0 0 rgba(255, 142, 60, 0.48);
}

.hotspot--video:hover .hotspot-dot {
  background: #f26b0f;
}

.hotspot:hover .hotspot-label {
  transform: translate(18px, -50%) scale(1.22);
  box-shadow: 0 16px 34px rgba(95, 32, 68, 0.22);
}

.hotspot--video .hotspot-label {
  color: #a34712;
  border-color: rgba(243, 136, 59, 0.28);
}

.hotspot--default .hotspot-label {
  background: rgba(255, 255, 255, 0.97);
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

.hotspot-inline-panel {
  position: absolute;
  z-index: 4;
  transform: translateY(6px);
  padding: 6px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(195, 55, 112, 0.18);
  box-shadow: 0 12px 28px rgba(55, 18, 36, 0.15);
  backdrop-filter: blur(8px);
  overflow: hidden;
  max-width: none;
}

.hotspot-inline-audio,
.hotspot-inline-video {
  display: block;
  width: 100%;
  max-width: none;
}

.hotspot-inline-audio {
  max-width: none;
  min-height: 34px;
  border-radius: 999px;
  accent-color: #c33770;
  filter: drop-shadow(0 8px 16px rgba(159, 43, 98, 0.12));
}

.hotspot-inline-panel:has(.hotspot-inline-audio) {
  padding: 4px 6px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 247, 251, 0.98), rgba(255, 238, 246, 0.96));
  border-color: rgba(195, 55, 112, 0.26);
}

.hotspot-inline-audio::-webkit-media-controls-panel {
  background: linear-gradient(180deg, rgba(255, 247, 251, 0.98), rgba(255, 238, 246, 0.96));
}

.hotspot-inline-audio::-webkit-media-controls-current-time-display,
.hotspot-inline-audio::-webkit-media-controls-time-remaining-display {
  color: #9f2b62;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
}

.hotspot-inline-audio::-webkit-media-controls-play-button,
.hotspot-inline-audio::-webkit-media-controls-mute-button {
  filter: saturate(1.1) hue-rotate(-8deg);
}

.hotspot-inline-frame {
  position: relative;
  width: 100%;
  max-width: none;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: 8px;
  background: #000;
}

.hotspot-inline-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hotspot-inline-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  min-height: 38px;
  border-radius: 999px;
  background: #fff2f8;
  color: #9f2b62;
  text-decoration: none;
  font-family: "Inter", sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
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

.hotspot--video .hotspot-dot {
  animation-name: hotspot-pulse-video;
}

@keyframes hotspot-pulse-video {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 142, 60, 0.46);
  }
  80% {
    box-shadow: 0 0 0 12px rgba(255, 142, 60, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 142, 60, 0);
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

.recipe-mascot-corner--level-5 {
  width: clamp(150px, 16vw, 260px);
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
  .recipe-pdf-page {
    padding: 72px 0 40px;
  }

  .recipe-header {
    width: min(640px, 94vw);
    text-align: center;
  }

  .pdf-scroll-viewer,
  .pdf-scroll-viewer--single {
    width: min(640px, 94vw);
  }

  .recipe-topbar {
    width: min(640px, 94vw);
    gap: 6px;
    padding-bottom: 0;
    overflow-x: visible;
  }

  .recipe-topbar__btn {
    flex: 1 1 0;
    white-space: nowrap;
    min-width: 0;
    padding: 7px 8px;
    font-size: 0.72rem;
    text-align: center;
  }

  .pdf-page-row {
    grid-template-columns: 1fr;
  }

  .hotspot-label {
    min-height: 24px;
    padding: 4px 8px;
    font-size: 0.68rem;
    transform: translate(12px, -50%);
  }

  .hotspot-inline-panel {
    width: min(200px, calc(100vw - 48px)) !important;
  }

  .hotspot-inline-audio {
    max-width: 100%;
    min-height: 32px;
  }
}
</style>
