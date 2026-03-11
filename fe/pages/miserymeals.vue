<template>
  <main class="cookbook-page">
    <section class="cookbook-hero" :class="{ 'cookbook-hero--result-mode': isCornerResultMode }">
      <div
        v-if="isCornerResultMode"
        class="result-spread-bg"
        :style="resultSpreadStyle"
        aria-hidden="true"
      >
        <div class="result-spread-bg__page">
          <canvas ref="spreadLeftCanvas" class="result-spread-bg__canvas"></canvas>
        </div>
        <div class="result-spread-bg__page">
          <canvas ref="spreadRightCanvas" class="result-spread-bg__canvas"></canvas>
        </div>
      </div>

      <div class="cookbook-stars cookbook-stars--pink" aria-hidden="true">
        <svg
          v-for="(star, index) in pinkStars"
          :key="`cookbook-star-pink-${index}`"
          class="cookbook-star"
          :style="star.style"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          :fill="star.fill"
        >
          <path d="M16 4.588l2.833 8.719H28l-7.416 5.387 2.832 8.719L16 22.023l-7.417 5.389 2.833-8.719L4 13.307h9.167L16 4.588z" />
        </svg>
        <svg
          v-for="(line, index) in pinkStarLines"
          :key="`cookbook-line-pink-${index}`"
          class="cookbook-squiggle"
          :style="line.style"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="line.path"
            fill="none"
            :stroke="line.stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke-width="line.strokeWidth"
          />
        </svg>
      </div>
      <div class="cookbook-stars cookbook-stars--white" aria-hidden="true">
        <svg
          v-for="(star, index) in whiteStars"
          :key="`cookbook-star-white-${index}`"
          class="cookbook-star"
          :style="star.style"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          :fill="star.fill"
        >
          <path d="M16 4.588l2.833 8.719H28l-7.416 5.387 2.832 8.719L16 22.023l-7.417 5.389 2.833-8.719L4 13.307h9.167L16 4.588z" />
        </svg>
        <svg
          v-for="(line, index) in whiteStarLines"
          :key="`cookbook-line-white-${index}`"
          class="cookbook-squiggle"
          :style="line.style"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="line.path"
            fill="none"
            :stroke="line.stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke-width="line.strokeWidth"
          />
        </svg>
      </div>
      <div class="cookbook-stars cookbook-stars--green" aria-hidden="true">
        <svg
          v-for="(star, index) in greenStars"
          :key="`cookbook-star-green-${index}`"
          class="cookbook-star"
          :style="star.style"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          :fill="star.fill"
        >
          <path d="M16 4.588l2.833 8.719H28l-7.416 5.387 2.832 8.719L16 22.023l-7.417 5.389 2.833-8.719L4 13.307h9.167L16 4.588z" />
        </svg>
        <svg
          v-for="(line, index) in greenStarLines"
          :key="`cookbook-line-green-${index}`"
          class="cookbook-squiggle"
          :style="line.style"
          viewBox="0 0 120 120"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            :d="line.path"
            fill="none"
            :stroke="line.stroke"
            stroke-linecap="round"
            stroke-linejoin="round"
            :stroke-width="line.strokeWidth"
          />
        </svg>
      </div>
      <div class="page-overlay" aria-hidden="true"></div>

      <img
        src="/images/spoon.png"
        alt=""
        aria-hidden="true"
        :class="['cookbook-spoon', { 'cookbook-spoon-hidden': started }]"
      />
      <img
        src="/images/spoon.png"
        alt=""
        aria-hidden="true"
        :class="['cookbook-spoon2', { 'cookbook-spoon-hidden': started }]"
      />

      <!-- FLOATING IMAGES (fade out when started) -->
      <div class="floating-img img-glow cookbook-float" :class="{ 'is-hidden': started }">
        <img src="/images/whsp.png" alt="whsp centerpiece" />
      </div>

      <div class="floating-img img-glow cookbook-float2" :class="{ 'is-hidden': started }">
        <img src="/images/whsp.png" alt="whsp centerpiece " />
      </div>

      <div v-if="!started" class="cookbook-mascot-wrap" aria-hidden="true">
        <img
          v-for="(mascot, index) in landingMascots"
          :key="`cookbook-mascot-${mascot.level}`"
          :src="mascot.url"
          alt=""
          class="cookbook-mascot"
          :class="[`cookbook-mascot--${index}`, `cookbook-mascot--level-${mascot.level}`]"
        />
      </div>

      <p v-if="!started" class="cookbook-cta-copy">
        Start our flowchart to find just the right recipe or resource for where you're at.
      </p>

      <!-- CTA -->
      <div class="cookbook-cta-wrap" :class="{ 'is-hidden': started }">
        <button
          class="start-here-btn"
          type="button"
          @click="startFlow"
        >
          <span class="start-here-arrow" aria-hidden="true">
            <span class="start-here-text">
              start here!
            </span>
          </span>
        </button>
      </div>

      <!-- QUESTIONNAIRE -->
      <Transition name="qa">
        <section v-if="started" class="cookbook-qa" aria-live="polite">
          <div class="qa-shell" :class="{ 'qa-shell--corner': isCornerResultMode }">
            <Transition name="qa" mode="out-in">
              <div
                :key="currentNode.id"
                class="qa-card-wrap"
                :class="{ 'qa-card-wrap--corner': isCornerResultMode }"
                :style="isCornerResultMode ? cornerResultThemeVars : null"
              >
                <!-- QUESTION NODE (circle) -->
                <div v-if="currentNode.type === 'question'" class="qa-question-wrap">
                  <div :class="['qa-node', currentNode.id === 'q_hungry' ? 'qa-question-banner' : 'qa-circle']">
                    <p class="qa-text">{{ currentNode.text }}</p>
                  </div>

                  <div class="qa-options qa-options--stars">
                    <button
                      v-for="opt in currentNode.options"
                      :key="opt.label"
                      type="button"
                      class="qa-star-btn"
                      :class="getStarTone(opt.label)"
                      @click="goNext(opt)"
                    >
                      <svg
                        class="qa-star-icon"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M16 4.588l2.833 8.719H28l-7.416 5.387 2.832 8.719L16 22.023l-7.417 5.389 2.833-8.719L4 13.307h9.167L16 4.588z" />
                      </svg>
                      <span class="qa-star-label">{{ opt.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- RESULT NODE (dashed rounded box) -->
                <div
                  v-else
                  class="qa-node qa-box"
                  v-show="!(isCornerResultMode && cornerCardMinimized)"
                  :class="{
                    'qa-box--appetite': currentNode.text === 'Wanna take a moment to do some gentle appetite regulation somatics? (and then take yourself over to all zero spoon recipes after?)',
                    'qa-box--safety': currentNode.id === 'r_safety',
                    'qa-box--shopping': currentNode.id === 'r_shopping'
                  }"
                >
                  <button
                    v-if="isCornerResultMode"
                    type="button"
                    class="qa-box-hide"
                    @click="cornerCardMinimized = true"
                  >
                    hide
                  </button>
                  <p class="qa-text">{{ currentNode.text }}</p>
                  <nuxt-link
                    v-if="currentNode.meta?.secondaryLink && currentNode.meta?.secondaryLabel"
                    :to="currentNode.meta.secondaryLink"
                    class="qa-inline-link"
                  >
                    {{ currentNode.meta.secondaryLabel }}
                  </nuxt-link>

                  <img
                    v-if="currentNode.meta?.mascotLevel !== undefined && !isCornerResultMode"
                    :src="resolveSpoonMascot(currentNode.meta.mascotLevel)"
                    alt=""
                    aria-hidden="true"
                    :class="['qa-result-mascot', `qa-result-mascot--level-${currentNode.meta.mascotLevel}`]"
                  />

                  <div class="qa-result-meta">
                    <p class="qa-result-note">
                      Spoon level:
                      <span class="qa-spoon-icons" :aria-label="`${spoonScore} spoons`">
                        <img
                          v-for="n in spoonScore"
                          :key="`qa-spoon-${n}`"
                          src="/images/spoon.png"
                          alt=""
                          aria-hidden="true"
                          class="qa-spoon-icon"
                        />
                        <span v-if="spoonScore === 0">0</span>
                      </span>
                    </p>
                  </div>

                  <div class="qa-options">
                    <button type="button" class="qa-pill" @click="restart">Restart</button>
                    <nuxt-link
                      :to="resultPrimaryLink"
                      class="qa-pill qa-pill--primary"
                    >
                      {{ resultPrimaryLabel }}
                    </nuxt-link>
                  </div>
                </div>

              </div>
            </Transition>

            <img
              v-if="isCornerResultMode && cornerResultMascot"
              :src="cornerResultMascot"
              alt=""
              aria-hidden="true"
              :class="['qa-corner-mascot', `qa-corner-mascot--level-${currentResultLevel}`]"
            />
            <button
              v-if="isCornerResultMode && cornerCardMinimized"
              type="button"
              class="qa-box-reopen qa-box-reopen--corner"
              @click="cornerCardMinimized = false"
            >
              reopen
            </button>

            <div
              v-if="!isCornerResultMode"
              class="qa-nav"
              :class="{ 'qa-nav--corner': isCornerResultMode }"
              :style="isCornerResultMode ? cornerResultThemeVars : null"
            >
              <button type="button" class="qa-link" @click="goBack" :disabled="history.length === 0">
                Back
              </button>
              <nuxt-link class="qa-link qa-link--pill" to="/recipes">
                Skip questionnaire
              </nuxt-link>
            </div>
          </div>
        </section>
      </Transition>
    </section>

  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { resolveSpoonMascot } from "@/utils/spoonMascots";
import { resolveSpoonColor } from "@/utils/spoonColors";

const bodyClass = "cookbook-body-bg";
const PDF_JS_SCRIPT = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDF_JS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const SPOON_SPREAD_PAGES = {
  0: [24, 25],
  1: [54, 55],
  2: [74, 75],
  3: [102, 103],
  4: [152, 153],
  5: [184, 105],
};

let pdfScriptPromise = null;
let spreadPdfPromise = null;
const spreadPagePromiseCache = new Map();
const spreadRenderPromiseCache = new Map();
const spreadRenderCache = new Map();

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function parseRgbChannels(color) {
  const matches = String(color || "").match(/\d+/g) || [];
  if (matches.length < 3) return [245, 248, 243];
  return matches.slice(0, 3).map((value) => Number(value));
}

function shiftRgb(color, amount) {
  const [r, g, b] = parseRgbChannels(color);
  return `rgb(${clampChannel(r + amount)} ${clampChannel(g + amount)} ${clampChannel(b + amount)})`;
}

function rgbaFromRgb(color, alpha) {
  const [r, g, b] = parseRgbChannels(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function uniqueSpreadPageNumbers() {
  return Array.from(
    new Set(
      Object.values(SPOON_SPREAD_PAGES)
        .flat()
        .filter((pageNumber) => Number.isInteger(pageNumber) && pageNumber > 0)
    )
  );
}

function getSpreadCssWidth(canvas) {
  if (canvas?.parentElement?.clientWidth) {
    return Math.max(300, Math.floor(canvas.parentElement.clientWidth));
  }

  if (typeof window !== "undefined") {
    return Math.max(300, Math.floor(window.innerWidth / 2));
  }

  return 300;
}

function getSpreadRenderCacheKey(pageNumber, cssWidth) {
  return `${pageNumber}:${Math.round(cssWidth)}`;
}

function handleWindowResize() {
  if (isCornerResultMode.value) {
    renderResultSpread();
  }
}

onMounted(() => {
  document.body.classList.add(bodyClass);
  window.addEventListener("resize", handleWindowResize);
});
onBeforeUnmount(() => {
  document.body.classList.remove(bodyClass);
  window.removeEventListener("resize", handleWindowResize);
});

const started = ref(false);
const currentNodeId = ref("q1");
const history = ref([]);
const spreadLeftCanvas = ref(null);
const spreadRightCanvas = ref(null);
const spreadTargetHeight = ref(null);
const cornerCardMinimized = ref(false);

const hotPink = "#ff4fb8";
const mintGreen = "#8bcf8a";
const starPresets = [
  { size: 150, top: "4%", left: "8%", rotate: "12deg", opacity: 0.88 },
  { size: 118, top: "16%", left: "70%", rotate: "-9deg", opacity: 0.75 },
  { size: 104, top: "54%", left: "14%", rotate: "34deg", opacity: 0.8 },
  { size: 80, top: "42%", left: "78%", rotate: "-16deg", opacity: 0.72 },
  { size: 126, top: "68%", left: "34%", rotate: "4deg", opacity: 0.77 },
];
const greenStarPresets = [
  { size: 96, top: "10%", left: "26%", rotate: "-8deg", opacity: 0.74 },
  { size: 88, top: "22%", left: "84%", rotate: "18deg", opacity: 0.68 },
  { size: 112, top: "30%", left: "6%", rotate: "-24deg", opacity: 0.72 },
  { size: 92, top: "62%", left: "82%", rotate: "10deg", opacity: 0.7 },
  { size: 108, top: "78%", left: "22%", rotate: "-12deg", opacity: 0.75 },
  { size: 84, top: "84%", left: "68%", rotate: "22deg", opacity: 0.66 },
];
const pinkLinePresets = [
  { size: 108, top: "8%", left: "18%", rotate: "8deg", opacity: 0.68, path: "M12 70 C28 26, 62 22, 74 48 S104 92, 92 58", strokeWidth: 8 },
  { size: 94, top: "58%", left: "22%", rotate: "-18deg", opacity: 0.62, path: "M18 44 C42 8, 78 12, 88 42 S70 98, 42 74", strokeWidth: 7 },
];
const whiteLinePresets = [
  { size: 96, top: "18%", left: "58%", rotate: "-10deg", opacity: 0.54, path: "M16 64 C38 28, 72 26, 84 54 S102 100, 76 76", strokeWidth: 7 },
  { size: 88, top: "70%", left: "46%", rotate: "14deg", opacity: 0.48, path: "M18 58 C28 26, 56 18, 72 40 S102 82, 86 54", strokeWidth: 6 },
];
const greenLinePresets = [
  { size: 102, top: "14%", left: "38%", rotate: "16deg", opacity: 0.66, path: "M20 68 C36 24, 68 20, 80 46 S102 92, 88 60", strokeWidth: 8 },
  { size: 92, top: "64%", left: "70%", rotate: "-12deg", opacity: 0.58, path: "M16 48 C34 12, 72 14, 82 44 S74 100, 34 76", strokeWidth: 7 },
];

const deterministicFills = [hotPink, hotPink, "#ffffff", "#ffffff", "#ffffff"];

function buildStars(presets, fills, fallbackFill) {
  return presets.map((star, index) => ({
    ...star,
    fill: fills[index] ?? fallbackFill,
    style: {
      width: `${star.size}px`,
      height: `${star.size}px`,
      top: star.top,
      left: star.left,
      opacity: star.opacity,
      "--star-rotate": star.rotate,
    },
  }));
}

function buildStarLines(presets, stroke) {
  return presets.map((line) => ({
    ...line,
    stroke,
    style: {
      width: `${line.size}px`,
      height: `${line.size}px`,
      top: line.top,
      left: line.left,
      opacity: line.opacity,
      "--squiggle-rotate": line.rotate,
    },
  }));
}

const stars = buildStars(starPresets, deterministicFills, "#ffffff");
const pinkStars = stars.filter((star) => star.fill === hotPink);
const whiteStars = stars.filter((star) => star.fill !== hotPink);
const greenStars = buildStars(greenStarPresets, Array(greenStarPresets.length).fill(mintGreen), mintGreen);
const pinkStarLines = buildStarLines(pinkLinePresets, hotPink);
const whiteStarLines = buildStarLines(whiteLinePresets, "#ffffff");
const greenStarLines = buildStarLines(greenLinePresets, mintGreen);
const landingMascots = [0, 1, 2, 3, 4, 5].map((level) => ({
  level,
  url: resolveSpoonMascot(level),
}));
const defaultSpoonScore = 3;
const spoonScore = ref(defaultSpoonScore);
const recipesLink = computed(() => ({ path: "/recipes", query: { spoons: spoonScore.value } }));
const resultPrimaryLink = computed(() => (
  currentNode.value?.meta?.primaryLink ?? recipesLink.value
));
const resultPrimaryLabel = computed(() => (
  currentNode.value?.meta?.primaryLabel ?? "See recipes"
));
const currentResultLevel = computed(() => {
  const level = Number(currentNode.value?.meta?.mascotLevel);
  if (Number.isInteger(level) && level >= 0 && level <= 5) return level;
  return null;
});
const cornerResultMascot = computed(() => (
  currentResultLevel.value === null ? "" : resolveSpoonMascot(currentResultLevel.value)
));
const isCornerResultMode = computed(() => (
  started.value && currentNode.value?.type === "result" && currentResultLevel.value !== null
));
const spreadPages = computed(() => (
  currentResultLevel.value === null ? null : SPOON_SPREAD_PAGES[currentResultLevel.value] ?? null
));
const resultSpreadStyle = computed(() => (
  Number.isFinite(spreadTargetHeight.value)
    ? { "--spread-target-height": `${spreadTargetHeight.value}px` }
    : null
));
const cornerResultThemeVars = computed(() => {
  if (currentResultLevel.value === null) return {};
  const base = resolveSpoonColor(currentResultLevel.value);
  return {
    "--qa-result-bg": rgbaFromRgb(base, 0.92),
    "--qa-result-border": shiftRgb(base, -72),
    "--qa-result-text": shiftRgb(base, -104),
    "--qa-result-note": shiftRgb(base, -86),
  };
});

function loadPdfJsScript() {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (pdfScriptPromise) return pdfScriptPromise;

  pdfScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-pdfjs="true"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.pdfjsLib), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load PDF.js")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = PDF_JS_SCRIPT;
    script.async = true;
    script.dataset.pdfjs = "true";
    script.onload = () => resolve(window.pdfjsLib);
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });

  return pdfScriptPromise;
}

async function loadSpreadPdf(pdfjsLib) {
  if (spreadPdfPromise) return spreadPdfPromise;

  const candidatePaths = ["/api/cookbook-pdf", "/api/cookbook.pdf", "/images/cookbook.pdf", "/cookbook.pdf"];
  spreadPdfPromise = (async () => {
    let lastError = null;
    for (const path of candidatePaths) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await pdfjsLib
          .getDocument({
            url: path,
            rangeChunkSize: 65536,
            disableAutoFetch: true,
            disableStream: false,
          })
          .promise;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Unable to load cookbook PDF");
  })();

  return spreadPdfPromise;
}

async function loadSpreadPage(pdf, pageNumber) {
  if (spreadPagePromiseCache.has(pageNumber)) {
    return spreadPagePromiseCache.get(pageNumber);
  }

  const promise = pdf.getPage(pageNumber).catch((error) => {
    spreadPagePromiseCache.delete(pageNumber);
    throw error;
  });
  spreadPagePromiseCache.set(pageNumber, promise);
  return promise;
}

async function renderPageToCache(pdf, pageNumber, cssWidth) {
  const cacheKey = getSpreadRenderCacheKey(pageNumber, cssWidth);
  if (spreadRenderCache.has(cacheKey)) {
    return spreadRenderCache.get(cacheKey);
  }
  if (spreadRenderPromiseCache.has(cacheKey)) {
    return spreadRenderPromiseCache.get(cacheKey);
  }

  const promise = (async () => {
    const page = await loadSpreadPage(pdf, pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const scale = Math.max(0.45, (cssWidth * pixelRatio) / baseViewport.width);
    const viewport = page.getViewport({ scale });
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = Math.floor(viewport.width);
    renderCanvas.height = Math.floor(viewport.height);
    const context = renderCanvas.getContext("2d", { alpha: false });
    await page.render({ canvasContext: context, viewport }).promise;

    const cached = {
      canvas: renderCanvas,
      height: viewport.height / pixelRatio,
      width: viewport.width / pixelRatio,
    };
    spreadRenderCache.set(cacheKey, cached);
    spreadRenderPromiseCache.delete(cacheKey);
    return cached;
  })().catch((error) => {
    spreadRenderPromiseCache.delete(cacheKey);
    throw error;
  });

  spreadRenderPromiseCache.set(cacheKey, promise);
  return promise;
}

async function primeSpreadRenders() {
  if (!process.client) return;

  try {
    const pdfjsLib = await loadPdfJsScript();
    if (!pdfjsLib?.GlobalWorkerOptions) return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;

    const pdf = await loadSpreadPdf(pdfjsLib);
    const cssWidth = getSpreadCssWidth();
    const pageNumbers = uniqueSpreadPageNumbers();

    await Promise.all(
      pageNumbers.map(async (pageNumber) => {
        await loadSpreadPage(pdf, pageNumber);
        await renderPageToCache(pdf, pageNumber, cssWidth);
      })
    );
  } catch {
    // Fall back to on-demand rendering if preloading fails.
  }
}

async function renderSpreadPage(pdf, pageNumber, canvas) {
  if (!canvas) return 0;
  const cssWidth = getSpreadCssWidth(canvas);
  const cached = spreadRenderCache.get(getSpreadRenderCacheKey(pageNumber, cssWidth));

  if (cached?.canvas) {
    const context = canvas.getContext("2d", { alpha: false });
    canvas.width = cached.canvas.width;
    canvas.height = cached.canvas.height;
    context.drawImage(cached.canvas, 0, 0);
    return cached.height;
  }

  const rendered = await renderPageToCache(pdf, pageNumber, cssWidth);
  const context = canvas.getContext("2d", { alpha: false });
  canvas.width = rendered.canvas.width;
  canvas.height = rendered.canvas.height;
  context.drawImage(rendered.canvas, 0, 0);
  return rendered.height;
}

async function renderResultSpread() {
  if (!isCornerResultMode.value || !spreadPages.value || !process.client) return;

  await nextTick();
  const leftCanvas = spreadLeftCanvas.value;
  const rightCanvas = spreadRightCanvas.value;
  if (!leftCanvas || !rightCanvas) return;

  try {
    const pdfjsLib = await loadPdfJsScript();
    if (!pdfjsLib?.GlobalWorkerOptions) return;
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_JS_WORKER;
    const pdf = await loadSpreadPdf(pdfjsLib);

    const [leftPage, rightPage] = spreadPages.value;
    const heights = await Promise.all([
      renderSpreadPage(pdf, leftPage, leftCanvas),
      renderSpreadPage(pdf, rightPage, rightCanvas),
    ]);
    spreadTargetHeight.value = Math.max(...heights, 0);
  } catch {
    // Keep regular background if spread rendering fails.
    spreadTargetHeight.value = null;
  }
}


const nodes = {
  q1: {
    id: "q1",
    type: "question",
    text: "Do you want to eat?",
    options: [
      { label: "yes", nextId: "q2", spoonsDelta: 0 },
      { label: "no", nextId: "r_appetite", spoonsSet: 0 },
    ],
  },
  r_appetite: {
    id: "r_appetite",
    type: "result",
    text: "Wanna take a moment to do some gentle appetite regulation somatics? (and then take yourself over to all zero spoon recipes after?)",
    options: [],
    meta: {
      spoonSet: 0,
      primaryLink: "/recipes/appetite-regulation-spread",
      primaryLabel: "gentle appetite regulation somatics",
    },
  },
  q2: {
    id: "q2",
    type: "question",
    text: "Do you feel like you can nourish yourself alone right now?",
    options: [
      { label: "yes", nextId: "q3", spoonsDelta: 0 },
      { label: "no", nextId: "r_safety", spoonsSet: 2 },
    ],
  },
  r_safety: {
    id: "r_safety",
    type: "result",
    text: "Take a slow deep breath & check out your food safety plan. We got this <3",
    options: [],
    meta: {
      spoonSet: 0,
      primaryLink: "/recipes/food-safety-plan",
      primaryLabel: "food safety plan",
    },
  },
  q3: {
    id: "q3",
    type: "question",
    text: "Do you have enough food at home?",
    options: [
      { label: "yes", nextId: "q_hungry", spoonsDelta: 0 },
      { label: "no", nextId: "r_shopping", spoonsDelta: -1 },
    ],
  },
  q_hungry: {
    id: "q_hungry",
    type: "question",
    text: "are you hungry",
    options: [
      { label: "yum", nextId: "q4", spoonsDelta: 1 },
      { label: "idk", nextId: "r_appetite", spoonsDelta: -1 },
      { label: "nope", nextId: "q9", spoonsSet: 1 },
    ],
  },
  r_shopping: {
    id: "r_shopping",
    type: "result",
    text: "Maybe our crip guide to food shopping can help? Check it out",
    options: [],
    meta: {
      spoonSet: 0, 
      primaryLink: "/recipes/crip-guide-to-food-shopping",
      primaryLabel: "crip guide to food shopping",
      secondaryLink: "/recipes/food-safety-plan",
      secondaryLabel: "you might want to look at this one too",
    },
  },
  q4: {
    id: "q4",
    type: "question",
    text: "Do you feel like you have the energy to try something new today?",
    options: [
      { label: "yes", nextId: "q5", spoonsDelta: 1 },
      { label: "nah", nextId: "q10", spoonsDelta: -1 },
    ],
  },
  q5: {
    id: "q5",
    type: "question",
    text: "How soon do you want something in your mouth?",
    options: [
      { label: "within 30 min", nextId: "q6", spoonsDelta: -1 },
      { label: "i could wait up to an hour", nextId: "q7", spoonsDelta: 1 },
    ],
  },
  q6: {
    id: "q6",
    type: "question",
    text: "Is today giving gourmet guru or basic baddie?",
    options: [
      { label: "Gourmet Guru", nextId: "q7", spoonsDelta: 1 },
      { label: "Basic Baddie", nextId: "r_thandi", spoonsSet: 3 },
    ],
  },
  q7: {
    id: "q7",
    type: "question",
    text: "Are you able to think about the future with ease today?",
    options: [
      { label: "hell yes", nextId: "r_farah", spoonsSet: 5 },
      { label: "naur", nextId: "r_fela", spoonsSet: 4 },
    ],
  },
  q8: {
    id: "q8",
    type: "question",
    text: "Do you feel up for chewing?",
    options: [
      { label: "yeah", nextId: "q_heat", spoonsDelta: 0 },
      { label: "not much", nextId: "r_nelly", spoonsSet: 0 },
    ],
  },
  q_heat: {
    id: "q_heat",
    type: "question",
    text: "Can you be bothered to heat something up right now?",
    options: [
      { label: "sure", nextId: "q11", spoonsDelta: 1 },
      { label: "hell no", nextId: "r_waraeh", spoonsSet: 1 },
    ],
  },
  q9: {
    id: "q9",
    type: "question",
    text: "Do you feel able to get out of bed?",
    options: [
      { label: "yes", nextId: "q10", spoonsDelta: 1 },
      { label: "not really", nextId: "q8", spoonsSet: 1 },
    ],
  },
  q10: {
    id: "q10",
    type: "question",
    text: "Are you in a place where you can follow multi-step instructions?",
    options: [
      { label: "i think so", nextId: "q6", spoonsDelta: 1 },
      { label: "2-3 steps max", nextId: "q11", spoonsSet: 2 },
    ],
  },
  q11: {
    id: "q11",
    type: "question",
    text: "Are you cool with being in the kitchen for longer than 30 mins?",
    options: [
      { label: "yep", nextId: "q6", spoonsDelta: 0 },
      { label: "not today", nextId: "r_tao", spoonsSet: 2 },
    ],
  },
  r_farah: {
    id: "r_farah",
    type: "result",
    text: "Farah: Let Farah Five-Spoons guide you",
    options: [],
    meta: {
      spoonSet: 5,
      mascotLevel: 5,
    },
  },
  r_fela: {
    id: "r_fela",
    type: "result",
    text: "Fela: Four-Spoon Fela will show you the way",
    options: [],
    meta: {
      spoonSet: 4,
      mascotLevel: 4,
    },
  },
  r_thandi: {
    id: "r_thandi",
    type: "result",
    text: "Thandi: Three-Spoons wants you to come",
    options: [],
    meta: {
      spoonSet: 3,
      mascotLevel: 3,
    },
  },
  r_tao: {
    id: "r_tao",
    type: "result",
    text: "Tao: Two-Spoon Tao says let’s gooo ",
    options: [],
    meta: {
      spoonSet: 2,
      mascotLevel: 2,
    },
  },
  r_waraeh: {
    id: "r_waraeh",
    type: "result",
    text: "Waraeh: Follow One-Spoon Waraeh!",
    options: [],
    meta: {
      spoonSet: 1,
      mascotLevel: 1,
    },
  },
  r_nelly: {
    id: "r_nelly",
    type: "result",
    text: "Nelly: No-Spoons will take you",
    options: [],
    meta: {
      spoonSet: 0,
      mascotLevel: 0,
    },
  },
};

const currentNode = computed(() => nodes[currentNodeId.value]);

function startFlow() {
  started.value = true;
  currentNodeId.value = "q1";
  history.value = [];
  spoonScore.value = defaultSpoonScore;
  primeSpreadRenders();
}

function clampSpoons(value) {
  return Math.max(0, Math.min(5, value));
}

function goNext(option) {
  if (!option?.nextId) return;

  history.value.push({
    nodeId: currentNodeId.value,
    spoonScore: spoonScore.value,
  });

  if (Number.isInteger(option.spoonsSet)) {
    spoonScore.value = clampSpoons(option.spoonsSet);
  } else if (Number.isInteger(option.spoonsDelta)) {
    spoonScore.value = clampSpoons(spoonScore.value + option.spoonsDelta);
  }

  currentNodeId.value = option.nextId;
}

function goBack() {
  const prev = history.value.pop();
  if (!prev) return;
  currentNodeId.value = prev.nodeId;
  spoonScore.value = clampSpoons(prev.spoonScore);
}

function restart() {
  started.value = false;
  // allow fade out/in nicely
  setTimeout(() => startFlow(), 250);
  spoonScore.value = defaultSpoonScore;
}

function getStarTone(label) {
  const normalized = label.toLowerCase();
  if (/wait up to an hour/.test(normalized)) {
    return "qa-star-btn--yes";
  }
  if (/within 30 min/.test(normalized)) {
    return "qa-star-btn--no";
  }
  if (/yes|yeah|yep|yum|sure|i think so|gourmet guru/.test(normalized)) {
    return "qa-star-btn--yes";
  }

  if (/no|nah|not|nope|basic baddie|2-3 steps max/.test(normalized)) {
    return "qa-star-btn--no";
  }

  return "qa-star-btn--no";
}

watch(currentNodeId, (id) => {
  const node = nodes[id];
  if (started.value && (node?.type === "result" || node?.type === "end")) {
    if (Number.isInteger(node?.meta?.spoonSet)) {
      spoonScore.value = clampSpoons(node.meta.spoonSet);
    } else {
      spoonScore.value = clampSpoons(spoonScore.value);
    }
  }
});

watch([isCornerResultMode, spreadPages], ([enabled]) => {
  if (!enabled) {
    cornerCardMinimized.value = false;
    spreadTargetHeight.value = null;
    return;
  }
  cornerCardMinimized.value = false;
  renderResultSpread();
});

onMounted(() => {
  primeSpreadRenders();
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Antic+Didone&family=Cherry+Bomb+One&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Libre+Caslon+Text:ital@1&family=Pinyon+Script&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");
.cookbook-page {
  --deep-pink: #9f2b62;
  --deep-pink-soft: rgba(159, 43, 98, 0.92);
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.cookbook-hero {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(28px, 4vw, 64px);
  overflow: hidden;
}

.cookbook-hero--result-mode {
  display: block;
  min-height: auto;
  padding: 0;
  overflow: visible;
}

.result-spread-bg {
  position: relative;
  inset: auto;
  z-index: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  width: 100%;
  min-height: 100vh;
}

.result-spread-bg__page {
  min-width: 0;
  min-height: 0;
  overflow: visible;
  display: flex;
  height: var(--spread-target-height, auto);
  align-items: flex-start;
}

.result-spread-bg__canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
  min-height: 0;
  display: block;
}

.cookbook-hero--result-mode .cookbook-stars,
.cookbook-hero--result-mode .cookbook-spoon,
.cookbook-hero--result-mode .cookbook-spoon2,
.cookbook-hero--result-mode .cookbook-float,
.cookbook-hero--result-mode .cookbook-float2,
.cookbook-hero--result-mode .cookbook-cta-wrap,
.cookbook-hero--result-mode .page-overlay {
  opacity: 0;
  pointer-events: none;
}

.cookbook-stars {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.cookbook-stars--pink {
  mix-blend-mode: color-burn;
}

.cookbook-stars--white {
  mix-blend-mode: plus-lighter;
}

.cookbook-stars--green {
  mix-blend-mode: color-burn;
  opacity: 0.85;
}

.cookbook-star {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  transform-origin: center;
  filter: drop-shadow(0 12px 18px rgba(255, 255, 255, 0.4));
  animation: cookbook-star-drift 14s ease-in-out infinite alternate;
}

.cookbook-squiggle {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  overflow: visible;
  transform-origin: center;
  filter: drop-shadow(0 6px 10px rgba(255, 255, 255, 0.12));
  animation: cookbook-squiggle-drift 12s ease-in-out infinite alternate;
}

@keyframes cookbook-star-drift {
  0% {
    transform: rotate(var(--star-rotate, 0deg)) translate(0, 0) scale(1);
  }
  100% {
    transform: rotate(var(--star-rotate, 0deg)) translate(6px, -10px) scale(1.02);
  }
}

@keyframes cookbook-squiggle-drift {
  0% {
    transform: rotate(var(--squiggle-rotate, 0deg)) translate(0, 0) scale(1);
  }
  100% {
    transform: rotate(var(--squiggle-rotate, 0deg)) translate(10px, -8px) scale(1.03);
  }
}

/* existing floats */
.cookbook-float {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(220px, 34vw, 460px);
  transform: translate(-50%, -56%);
  animation: floatLeft2 20s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}
.cookbook-float2 {
  position: absolute;
  top: 50%;
  left: 49%;
  width: clamp(220px, 34vw, 460px);
  transform: translate(-50%, -56%);
  animation: floatLeft2 20s ease-in-out infinite;
  z-index: 1;
  mix-blend-mode: plus-lighter;
  pointer-events: none;
}

@keyframes floatLeft2 {
  0%, 100% { transform: translate(-50%, -56%) rotate(6deg); }
  50% { transform: translate(calc(-50% + 30px), calc(-56% - 40px)) rotate(6deg); }
}

.cookbook-float img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 20px 35px rgba(230, 230, 230, 0.65));
}
.cookbook-spoon {
  position: absolute;
  left: 15%;
  top: 58%;
  transform: translateY(-50%) rotate(74deg);
  width: max(220px, min(34vw, 420px));
  max-width: 460px;
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: color-burn;
  animation: cookbook-spoon-bounce 5s ease-in-out infinite;
}

.cookbook-spoon2 {
      position: absolute;
    left: 56%;
    top: 53%;
    transform: translateY(-50%) rotate(174deg);
    width: max(220px, min(32vw, 420px));
    max-width: 460px;
    z-index: 2;
    pointer-events: none;
    mix-blend-mode: color-burn;
    animation: cookbook-spoon2-bounce 5.3s ease-in-out infinite;
}

.cookbook-spoon-hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 240ms ease;
}

@keyframes cookbook-spoon-bounce {
  0% {
    transform: translateY(-52%) rotate(72deg);
  }
  25% {
    transform: translateY(-45%) rotate(76deg);
  }
  50% {
    transform: translateY(-50%) rotate(70deg);
  }
  75% {
    transform: translateY(-47%) rotate(78deg);
  }
  100% {
    transform: translateY(-52%) rotate(72deg);
  }
}

@keyframes cookbook-spoon2-bounce {
  0% {
    transform: translateY(-54%) rotate(174deg);
  }
  25% {
    transform: translateY(-48%) rotate(178deg);
  }
  50% {
    transform: translateY(-52%) rotate(170deg);
  }
  75% {
    transform: translateY(-49%) rotate(182deg);
  }
  100% {
    transform: translateY(-54%) rotate(174deg);
  }
}

/* background */
.cookbook-body-bg {
  background-image: url('/images/cookbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* fade floats when started */
.is-hidden {
  opacity: 0;
  transform: translate(-50%, -56%) scale(0.98);
  transition: opacity 350ms ease, transform 350ms ease;
}

.cookbook-mascot-wrap {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.cookbook-mascot {
  position: absolute;
  width: clamp(72px, 9vw, 132px);
  height: auto;
  object-fit: contain;
  mix-blend-mode: color-burn;
  opacity: 0.9;
  filter: drop-shadow(0 10px 18px rgba(86, 40, 63, 0.16));
}

.cookbook-mascot--level-5 {
  width: clamp(116px, 13vw, 190px);
}

.cookbook-mascot--0 { left: 24%; top: 16%; animation: cookbook-mascot-float-a 7.1s ease-in-out infinite; }
.cookbook-mascot--1 { right: 22%; top: 18%; animation: cookbook-mascot-float-b 8.3s ease-in-out infinite; }
.cookbook-mascot--2 { left: 16%; top: 38%; animation: cookbook-mascot-float-c 6.6s ease-in-out infinite; }
.cookbook-mascot--3 { right: 17%; top: 40%; animation: cookbook-mascot-float-d 9.2s ease-in-out infinite; }
.cookbook-mascot--4 { left: 24%; bottom: 18%; animation: cookbook-mascot-float-e 7.8s ease-in-out infinite; }
.cookbook-mascot--5 { right: 22%; bottom: 17%; animation: cookbook-mascot-float-f 8.9s ease-in-out infinite; }

/* CTA */
.cookbook-cta-wrap {
  position: absolute;
  left: 50%;
  top: calc(50% + clamp(132px, 17vh, 214px));
  transform: translateX(-50%);
  z-index: 5;
  transition: opacity 300ms ease, transform 300ms ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(560px, calc(100vw - 48px));
  max-width: 100%;
}

.cookbook-cta-copy {
  position: absolute;
  left: calc(50% + clamp(90px, 10vw, 160px));
  top: calc(50% + clamp(34px, 6vh, 72px));
  transform: translateX(-50%);
  z-index: 4;
  margin: 0;
  max-width: min(480px, 92vw);
  font-family: "Inter", sans-serif;
  font-size: clamp(0.95rem, 1.35vw, 1.15rem);
  line-height: 1.35;
  text-align: center;
  color: #c3386e;
  text-wrap: balance;
}

.start-here-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  background: transparent;
  border: 0;
  cursor: pointer;
  padding: 0;
}

.start-here-arrow {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  width: clamp(290px, 38vw, 520px);
  min-height: clamp(74px, 9vw, 108px);
  padding: clamp(14px, 2vw, 22px) clamp(92px, 11vw, 132px) clamp(14px, 2vw, 22px) clamp(28px, 3vw, 40px);
  background: #ffffff;
  clip-path: polygon(0 18%, 72% 18%, 72% 0, 100% 50%, 72% 100%, 72% 82%, 0 82%);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.2);
  animation: start-here-arrow-sway 1.8s ease-in-out infinite;
  transition: transform 180ms ease, box-shadow 180ms ease, background-color 180ms ease;
}

.start-here-btn:hover .start-here-arrow,
.start-here-btn:focus-visible .start-here-arrow {
  transform: translateX(8px);
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.24);
  background: #245c38;
}

.start-here-text {
  font-family: "Inter", sans-serif;
  font-size: clamp(1.45rem, 2.4vw, 2.05rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  color: #2f63d8;
  white-space: nowrap;
  text-align: center;
  width: 72%;
  transition: color 180ms ease;
}

.start-here-btn:hover .start-here-text,
.start-here-btn:focus-visible .start-here-text {
  color: #ffffff;
}

.start-here-btn:focus-visible {
  outline: 2px solid var(--deep-pink-soft);
  outline-offset: 6px;
  border-radius: 14px;
}

@keyframes start-here-arrow-sway {
  0%, 100% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(10px);
  }
}

@keyframes cookbook-mascot-float-a {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}

@keyframes cookbook-mascot-float-b {
  0%, 100% { transform: translateY(0) rotate(1deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
}

@keyframes cookbook-mascot-float-c {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-8px) translateX(6px); }
}

@keyframes cookbook-mascot-float-d {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-14px) scale(1.03); }
}

@keyframes cookbook-mascot-float-e {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(2deg); }
}

@keyframes cookbook-mascot-float-f {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-11px) translateX(-5px); }
}

/* Questionnaire container */
.cookbook-qa {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 24px;
}

.qa-shell {
  width: min(560px, 92vw);
  display: grid;
  gap: 14px;
  justify-items: center;
}

.qa-shell--corner {
  width: 100%;
  height: 100%;
  align-content: end;
  justify-items: end;
  padding: clamp(12px, 2vw, 24px);
}

.qa-card-wrap {
  width: 100%;
}

.qa-card-wrap--corner {
  width: min(430px, 42vw);
  margin-right: 0;
  position: fixed;
  right: clamp(140px, 16vw, 236px);
  bottom: clamp(24px, 3vw, 36px);
  z-index: 17;
  pointer-events: auto;
  animation: mascot-corner-float 6.7s ease-in-out infinite;
}

.qa-card-wrap--corner .qa-box {
  background: var(--qa-result-bg, rgba(255, 210, 228, 0.92));
  border-color: var(--qa-result-border, rgba(255, 79, 184, 0.9));
}

.qa-card-wrap--corner .qa-text {
  color: var(--qa-result-text, #c33770);
}

.qa-card-wrap--corner .qa-result-note {
  color: var(--qa-result-note, rgba(195, 56, 110, 0.9));
}

.qa-corner-mascot {
  position: fixed;
  right: clamp(12px, 2vw, 24px);
  bottom: clamp(12px, 2vw, 24px);
  width: clamp(120px, 14vw, 190px);
  z-index: 18;
  pointer-events: none;
  animation: mascot-corner-float 6.7s ease-in-out infinite;
}

.qa-corner-mascot--level-5 {
  width: clamp(196px, 22vw, 320px);
}

.qa-box-hide {
  border: 0;
  background: transparent;
  color: var(--qa-result-text, #c33770);
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
  text-decoration: underline;
  cursor: pointer;
  margin-bottom: 8px;
}

.qa-box-reopen {
  border: 2px dashed var(--qa-result-border, rgba(255, 79, 184, 0.9));
  background: var(--qa-result-bg, rgba(255, 210, 228, 0.92));
  color: var(--qa-result-text, #c33770);
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  cursor: pointer;
  border-radius: 999px;
  padding: 8px 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.qa-box-reopen:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.2);
}

.qa-box-reopen--corner {
  position: fixed;
  right: calc(clamp(12px, 2vw, 24px) + clamp(120px, 14vw, 190px) - 10px);
  bottom: calc(clamp(12px, 2vw, 24px) + clamp(120px, 14vw, 190px) - 2px);
  z-index: 21;
}

.qa-question-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* node base */
.qa-node {
  width: 100%;
  text-align: center;
  padding: 22px 18px;
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(2px);
}

/* circle style (question) */
.qa-circle {
  width: min(300px, 70vw);
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  background: #eaaab9;
  border: 3px solid #9e88b7;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: clamp(24px, 4vw, 32px);
  animation: qa-circle-pulse 4s ease-in-out infinite;
  box-shadow: 0 25px 35px rgba(0, 0, 0, 0.2);
}

.qa-question-banner {
  width: fit-content;
  max-width: min(92vw, 560px);
  min-height: 0;
  border-radius: 0;
  background: transparent;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 0;
  box-shadow: none;
}

.qa-question-banner .qa-text {
  font-family: "Cherry Bomb One", "Inter", sans-serif;
  font-size: clamp(1.6rem, 5.4vw, 3.2rem);
  line-height: 1;
  color: var(--deep-pink);
  letter-spacing: 0.02em;
  text-align: center;
}

/* dashed rounded box style (result) */
.qa-box {
  border-radius: 26px;
  background: rgba(255, 210, 228, 0.92);
  border: 3px dashed rgba(255, 79, 184, 0.9);
}

.qa-box--appetite {
  border-radius: 26px;
  background: rgb(173 246 255);
  border: 3px dashed #2196F3;
}

.qa-box--safety {
  border-radius: 26px;
  background: #d8c0ff;
  border: 3px dashed #5b35a3;
}

.qa-box--shopping {
  border-radius: 26px;
  background: #c9efad;
  border: 3px dashed #2f6d3f;
}

.qa-text {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.35;
  color: var(--deep-pink);
  font-weight: 600;
}

.qa-inline-link {
  display: inline-block;
  margin-top: 8px;
  color: rgba(159, 43, 98, 0.7);
  text-decoration: none;
  font-size: clamp(0.82rem, 1.6vw, 0.96rem);
  font-weight: 600;
  transition: color 160ms ease;
}

.qa-inline-link:hover {
  text-decoration: underline;
}

.qa-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 12px;
   font-weight: 600;
}

.qa-result-meta {
  margin: 12px 0 4px;
  min-height: 26px;
}

.qa-result-mascot {
  width: clamp(80px, 12vw, 128px);
  height: auto;
  display: block;
  margin: 12px auto 4px;
  filter: drop-shadow(0 8px 14px rgba(70, 26, 49, 0.2));
}

.qa-result-mascot--level-5 {
  width: clamp(136px, 19vw, 224px);
}

.qa-result-note {
  margin: 0;
  font-size: clamp(0.75rem, 1vw, 0.95rem);
  text-transform: lowercase;
  color: rgba(195, 56, 110, 0.9);
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.qa-spoon-icons {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.qa-spoon-icon {
  width: clamp(14px, 1.6vw, 20px);
  height: auto;
  object-fit: contain;
}

.qa-options.qa-options--stars {
  margin-top: 0;
  gap: 16px;
}

.qa-star-btn {
  border: none;
  background: transparent;
  position: relative;
  width: clamp(72px, 10vw, 120px);
  height: clamp(72px, 10vw, 120px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: transform 220ms ease, filter 220ms ease;
  color: #ff4fb8;
}

.qa-star-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 6px;
  border-radius: 999px;
}

.qa-star-icon {
  width: 100%;
  height: 100%;
  fill: currentColor;
  filter: drop-shadow(0 12px 20px rgba(0, 0, 0, 0.25));
  transition: transform 200ms ease;
}

.qa-star-btn:hover .qa-star-icon,
.qa-star-btn:focus-visible .qa-star-icon {
  transform: scale(1.05);
}

.qa-star-label {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-size: clamp(0.65rem, 1vw, 0.9rem);
  font-family: "Inter", sans-serif;
  letter-spacing: 0.08em;
  color: #ffffff;
  text-transform: lowercase;
}

.qa-star-btn--yes {
  color: #57ab54;
}

.qa-star-btn--no {
  color: #c3386e;
}

.qa-pill {
  border: 2px solid rgba(140, 120, 190, 0.75);
  background: rgba(255, 240, 247, 0.92);
  color: rgba(90, 40, 70, 0.92);
  border-radius: 999px;
  padding: 10px 14px;
  cursor: pointer;
  transition: transform 160ms ease, opacity 160ms ease;
  text-transform: lowercase;
}

.qa-pill:hover {
  transform: translateY(-1px);
}

.qa-pill--primary {
  background: var(--deep-pink);
  border-color: var(--deep-pink);
  color: #fff;
  margin-left: 4px;
  box-shadow: 0 10px 25px rgba(159, 43, 98, 0.35);
  animation: see-recipes-pulse 0.62s ease-in-out infinite;
}
.qa-pill--primary:hover {
  transform: translateY(-2px);
  animation-play-state: paused;
}

.qa-pill:focus-visible {
  outline: 2px solid rgba(255, 79, 184, 0.9);
  outline-offset: 4px;
}

@keyframes qa-circle-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 #9e88b798;
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 0 0 18px rgba(255, 79, 184, 0);
  }
}

@keyframes mascot-corner-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-12px) rotate(1.2deg); }
}

@keyframes see-recipes-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 25px rgba(159, 43, 98, 0.35);
  }
  50% {
    transform: scale(1.14);
    box-shadow: 0 16px 34px rgba(159, 43, 98, 0.58);
  }
}

.qa-nav {
  display: flex;
  gap: 14px;
  justify-content: center;
  align-items: center;
}

.qa-nav--corner {
  position: fixed;
  top: clamp(82px, 10vw, 116px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  background: var(--qa-result-bg, rgba(255, 210, 228, 0.92));
  border: 3px dashed var(--qa-result-border, rgba(255, 79, 184, 0.9));
  border-radius: 999px;
  padding: 8px 14px;
}

.qa-link {
  background: transparent;
  border: 0;
  color: var(--deep-pink-soft);
  /* text-transform: uppercase; */
  /* letter-spacing: 0.12em; */
  font-size: clamp(0.92rem, 1.35vw, 1.08rem);
  cursor: pointer;
  padding: 0;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.qa-link--pill {
  font-size: clamp(0.92rem, 1.35vw, 1.08rem);
  border: 0;
  border-radius: 0;
  padding: 0;
  text-decoration: none;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  background: transparent;
  color: #ff4fb8;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
}

.qa-link--pill:hover {
  color: #ff4fb8;
  transform: none;
}

.qa-link:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* transitions */
.qa-enter-active, .qa-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
}
.qa-enter-from, .qa-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1280px) {
  .cookbook-cta-copy {
    left: calc(50% + clamp(64px, 8vw, 110px));
    top: calc(50% + clamp(28px, 5vh, 58px));
  }

  .cookbook-cta-wrap {
    top: calc(50% + clamp(120px, 15vh, 188px));
    width: min(480px, calc(100vw - 56px));
  }

  .cookbook-mascot--0 { left: 18%; top: 15%; }
  .cookbook-mascot--1 { right: 17%; top: 17%; }
  .cookbook-mascot--2 { left: 11%; top: 37%; }
  .cookbook-mascot--3 { right: 12%; top: 39%; }
  .cookbook-mascot--4 { left: 20%; bottom: 18%; }
  .cookbook-mascot--5 { right: 18%; bottom: 16%; }

  .start-here-arrow {
    width: clamp(260px, 34vw, 420px);
    min-height: clamp(68px, 8vw, 92px);
    padding-right: clamp(78px, 10vw, 112px);
  }

  .start-here-text {
    font-size: clamp(1.2rem, 1.95vw, 1.65rem);
  }
}

@media (max-width: 720px) {
  .cookbook-spoon2 {
    display: none;
  }

  .cookbook-hero {
    padding: 20px 14px 28px;
  }

  .qa-shell {
    width: min(100%, 420px);
    margin: 0 auto;
  }

  .qa-card-wrap,
  .qa-card-wrap--corner {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }

  .qa-shell--corner {
    align-content: end;
    justify-items: center;
    padding: 12px 10px 18px;
  }

  .qa-card-wrap--corner {
    position: fixed;
    left: 50%;
    right: auto;
    bottom: 88px;
    transform: translateX(-50%);
    width: min(86vw, 320px);
    animation: none;
    z-index: 19;
  }

  .qa-card-wrap--corner .qa-box {
    padding: 14px 12px;
    border-radius: 20px;
  }

  .qa-card-wrap--corner .qa-text {
    font-size: clamp(0.82rem, 3.5vw, 0.98rem);
    line-height: 1.28;
  }

  .qa-card-wrap--corner .qa-result-note {
    font-size: 0.72rem;
    gap: 6px;
  }

  .qa-card-wrap--corner .qa-options {
    gap: 8px;
    margin-top: 10px;
  }

  .qa-card-wrap--corner .qa-pill {
    padding: 8px 10px;
    font-size: 0.8rem;
  }

  .qa-card-wrap--corner .qa-box-hide {
    font-size: 0.72rem;
    margin-bottom: 6px;
  }

  .qa-card-wrap--corner .qa-result-mascot {
    width: clamp(56px, 12vw, 78px);
    margin: 8px auto 2px;
  }

  .qa-card-wrap--corner .qa-result-mascot--level-5 {
    width: clamp(78px, 18vw, 108px);
  }

  .qa-corner-mascot {
    right: 50%;
    bottom: 10px;
    transform: translateX(50%);
    width: clamp(56px, 14vw, 84px);
    z-index: 18;
  }

  .qa-corner-mascot--level-5 {
    width: clamp(86px, 20vw, 120px);
  }

  .qa-box-reopen--corner {
    right: 50%;
    bottom: 56px;
    transform: translateX(50%);
    padding: 6px 10px;
    font-size: 0.74rem;
  }

  .qa-nav {
    width: 100%;
    justify-content: center;
  }

  .result-spread-bg {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .result-spread-bg__page {
    width: 100%;
    height: auto;
  }

  .result-spread-bg__canvas {
    width: 100%;
    height: auto;
  }

  .cookbook-cta-copy {
    left: 50%;
    top: calc(50% + clamp(158px, 19vh, 208px));
    transform: translateX(-50%);
    width: min(420px, 92vw);
    max-width: min(420px, 92vw);
    font-size: clamp(0.88rem, 3.8vw, 1rem);
    line-height: 1.42;
  }

  .cookbook-cta-wrap {
    width: min(92vw, 360px);
    top: calc(50% + clamp(88px, 11vh, 132px));
  }

  .cookbook-mascot {
    width: clamp(34px, 9vw, 52px);
    opacity: 0.78;
  }

  .cookbook-mascot--level-5 {
    width: clamp(74px, 18vw, 108px);
  }

  .cookbook-mascot--0 { left: 10%; top: 12%; }
  .cookbook-mascot--1 { right: 10%; top: 13%; }
  .cookbook-mascot--2 { left: 4%; top: 31%; }
  .cookbook-mascot--3 { right: 4%; top: 33%; }
  .cookbook-mascot--4 { left: 11%; bottom: 16%; }
  .cookbook-mascot--5 { right: 10%; bottom: 17%; }

  .start-here-arrow {
    width: min(100%, 340px);
    min-height: 62px;
    padding: 12px 72px 12px 24px;
    animation-duration: 1.5s;
  }

  .start-here-text {
    font-size: clamp(1.05rem, 4.7vw, 1.4rem);
  }
}


/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .cookbook-mascot {
    animation: none;
  }
  .start-here-arrow {
    animation: none;
  }
  .qa-enter-active, .qa-leave-active {
    transition: opacity 0.01ms linear;
  }
  .qa-enter-from, .qa-leave-to {
    transform: none;
  }
}
</style>
