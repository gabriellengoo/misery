<template>
  <main class="recipes-page" :style="themeVars">
    <header class="spoon-hero" :class="spoonHeroClass">
      <h1 class="spoon-hero__title" :class="{ 'spoon-hero__title--plain': !hasFilter }">{{ spoonHeroTitle }}</h1>
    </header>

    <section class="recipes-shell">
      <header class="recipes-topbar">
        <div class="recipes-actions">
          <button type="button" class="recipes-btn" @click="goToCookbook">miserymeals</button>
          <button type="button" class="recipes-btn recipes-btn--primary" @click="viewAllRecipes">
            View all recipes
          </button>
        </div>
        <div v-if="!hasFilter" class="recipes-filter-controls">
          <label for="recipes-spoon-filter" class="recipes-filter-text">Filter by spoons</label>
          <div class="recipes-filter-select-wrap">
            <select
              id="recipes-spoon-filter"
              class="recipes-filter-select"
              :value="selectedSpoonValue"
              @change="onSpoonFilterChange"
            >
              <option value="">All spoons</option>
              <option v-for="level in [0, 1, 2, 3, 4, 5]" :key="`spoon-option-${level}`" :value="String(level)">
                {{ level }} spoon{{ level === 1 ? '' : 's' }}
              </option>
            </select>
          </div>
        </div>
        <p v-else class="recipes-filter-label">
          <span class="recipes-filter-icons" :aria-label="`${spoonFilter} spoons`">
            <img
              v-for="n in spoonIcons"
              :key="`filter-spoon-${n}`"
              src="/images/spoon.png"
              alt=""
              aria-hidden="true"
              class="recipes-filter-icon"
            />
            <span v-if="spoonIcons.length === 0">no spoons :'(</span>
          </span>
        </p>
      </header>

      <section v-if="safeRecipes.length" class="recipes-grid" aria-label="Recipes">
        <RecipeCard
          v-for="recipe in safeRecipes"
          :key="recipe.slug || recipe.title"
          :title="recipe.title"
          :slug="recipe.slug"
          :spoon-level="recipe.spoonLevel"
          :page-start="recipe.pageStart"
          :pdf-path="recipe.pdfPath"
        />
      </section>

      <p v-else class="recipes-empty">
        No recipes found for this spoon level yet.
      </p>

      <div v-if="showAllMascots" class="mascot-float-wrap" aria-hidden="true">
        <img
          v-for="(item, index) in floatingMascots"
          :key="`all-mascot-${item.level}`"
          :src="item.url"
          :data-mascot-level="String(item.level)"
          :alt="''"
          class="mascot-float"
          :class="`mascot-float--${index}`"
          @error="onMascotImageError"
        />
      </div>

      <div v-else-if="cornerMascot" class="mascot-corner-wrap">
        <nuxt-link
          v-if="spoonGuide && nextSpoonLevel !== null"
          :class="['spoon-guide', 'spoon-guide--floating', `spoon-guide--${spoonFilter}`]"
          :to="`/recipes?spoons=${nextSpoonLevel}`"
        >
          <p class="spoon-guide__name">{{ spoonGuide.line }}</p>
          <p class="spoon-guide__cta">{{ spoonGuide.cta }}</p>
        </nuxt-link>

        <img
          :src="cornerMascot"
          :data-mascot-level="String(spoonFilter)"
          alt=""
          aria-hidden="true"
          class="mascot-corner"
          @error="onMascotImageError"
        />
      </div>
    </section>
  </main>
</template>

<script>
import sanityClient from '@/plugins/sanity'
import RecipeCard from '@/components/RecipeCard.vue'
import { resolveSpoonColor } from '@/utils/spoonColors'
import { allSpoonMascotEntries, resolveSpoonMascot, spoonMascotFallbacks } from '@/utils/spoonMascots'

const bodyClass = 'cookbook-body-bg'

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)))
}

function parseRgbChannels(color) {
  const matches = String(color || '').match(/\d+/g) || []
  if (matches.length < 3) return [245, 248, 243]
  return matches.slice(0, 3).map((value) => Number(value))
}

function shiftRgb(color, amount) {
  const [r, g, b] = parseRgbChannels(color)
  return `rgb(${clampChannel(r + amount)} ${clampChannel(g + amount)} ${clampChannel(b + amount)})`
}

function rgbaFromRgb(color, alpha) {
  const [r, g, b] = parseRgbChannels(color)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
} 

const SPOON_GUIDE_CONTENT = {
  0: {
    name: 'NELLY - No-Spoons',
    line: 'Nelly No-Spoons will take you there',
    cta: '(not you? how about one over?)',
  },
  1: {
    name: 'WARDEN - One-Spoon',
    line: 'Follow One-Spoon Warden',
    cta: '(not this one? try another!)',
  },
  2: {
    name: 'TAO - Two-Spoons',
    line: 'Tao says let’s gooo',
    cta: '(psst... do these feel better?)',
  },
  3: {
    name: 'THANDI - Three-Spoons',
    line: 'Three-Spoons wants you to come through',
    cta: '(feels wrong? try another!)',
  },
  4: {
    name: 'FELA - Four-Spoons',
    line: 'Four-Spoon Fela will show you the way',
    cta: '(...or how about these?)',
  },
  5: {
    name: 'FARAH - Five-Spoons',
    line: 'Let Farah Five-Spoons guide you',
    cta: '(and you can check out this one too)',
  },
}

const SPOON_HERO_TITLES = {
  0: 'NELLY - No-Spoons',
  1: 'WARDEN - One-Spoon',
  2: 'TAO - Two-Spoons',
  3: 'THANDI - Three-Spoons',
  4: 'FELA - Four-Spoons',
  5: 'FARAH - Five-Spoons',
}

export default {
  components: {
    RecipeCard,
  },
  watchQuery: ['spoons'],
  async asyncData({ query }) {
    const rawSpoons = Array.isArray(query.spoons) ? query.spoons[0] : query.spoons
    const parsed = Number.parseInt(rawSpoons, 10)
    const spoonFilter = Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : null

    const filteredQuery = `*[_type=="recipe" && websiteListed == true && spoonLevel == $spoons] | order(title asc) {
      title,
      "slug": slug.current,
      spoonLevel,
      pageStart,
      pdfPath
    }`

    const allQuery = `*[_type=="recipe" && websiteListed == true] | order(spoonLevel asc, title asc) {
      title,
      "slug": slug.current,
      spoonLevel,
      pageStart,
      pdfPath
    }`

    const recipes = spoonFilter === null
      ? await sanityClient.fetch(allQuery)
      : await sanityClient.fetch(filteredQuery, { spoons: spoonFilter })

    return {
      recipes: recipes || [],
      spoonFilter,
    }
  },
  computed: {
    hasFilter() {
      return Number.isInteger(this.spoonFilter)
    },
    selectedSpoonValue() {
      return this.hasFilter ? String(this.spoonFilter) : ''
    },
    spoonIcons() {
      if (!Number.isInteger(this.spoonFilter)) return []
      const count = Math.max(0, Math.min(5, Number(this.spoonFilter) || 0))
      return Array.from({ length: count }, (_, index) => index + 1)
    },
    safeRecipes() {
      return Array.isArray(this.recipes) ? this.recipes : []
    },
    showAllMascots() {
      return !this.hasFilter
    },
    cornerMascot() {
      return this.hasFilter ? resolveSpoonMascot(this.spoonFilter) : ''
    },
    floatingMascots() {
      return allSpoonMascotEntries
    },
    spoonHeroTitle() {
      const level = Number(this.spoonFilter)
      if (!Number.isInteger(level)) return 'miserymeals'
      return SPOON_HERO_TITLES[level] || 'miserymeals'
    },
    spoonHeroClass() {
      const level = Number(this.spoonFilter)
      if (!Number.isInteger(level)) return 'spoon-hero--0'
      return `spoon-hero--${Math.max(0, Math.min(5, level))}`
    },
    spoonGuide() {
      if (!this.hasFilter) return null
      return SPOON_GUIDE_CONTENT[this.spoonFilter] || null
    },
    nextSpoonLevel() {
      if (!this.hasFilter) return null
      const level = Number(this.spoonFilter)
      if (!Number.isInteger(level)) return null
      if (level === 5) return 4
      return Math.min(5, level + 1)
    },
    themeVars() {
      const base = resolveSpoonColor(this.spoonFilter)
      const shellBg = shiftRgb(base, 18)
      const shellBorder = shiftRgb(base, -26)
      const shellShadow = shiftRgb(base, -48)
      const btnText = shiftRgb(base, -88)
      const btnPrimary = shiftRgb(base, -34)
      return {
        '--recipes-base': base,
        '--recipes-shell-bg': rgbaFromRgb(shellBg, 0.84),
        '--recipes-shell-border': rgbaFromRgb(shellBorder, 0.35),
        '--recipes-shell-shadow': rgbaFromRgb(shellShadow, 0.24),
        '--recipes-card-bg': shiftRgb(base, 30),
        '--recipes-card-border': shiftRgb(base, -18),
        '--recipes-card-shadow': shiftRgb(base, -38),
        '--recipes-btn-bg': shiftRgb(base, 40),
        '--recipes-btn-border': shiftRgb(base, -20),
        '--recipes-btn-text': btnText,
        '--recipes-btn-primary-bg': btnPrimary,
        '--recipes-btn-primary-text': '#fff',
        '--spoon-hero-color': shiftRgb(base, -76),
      }
    },
  },
  watch: {
    spoonFilter: {
      immediate: true,
      handler() {
        this.applyBodyBackground()
      },
    },
  },
  mounted() {
    if (!process.client || typeof document === 'undefined') return
    document.body.classList.add(bodyClass)
    this.applyBodyBackground()
  },
  beforeDestroy() {
    if (!process.client || typeof document === 'undefined') return
    document.body.classList.remove(bodyClass)
    document.body.style.background = ''
  },
  methods: {
    applyBodyBackground() {
      if (!process.client || typeof document === 'undefined') return
      document.body.style.background = resolveSpoonColor(this.spoonFilter)
    },
    goToCookbook() {
      this.$router.push('/miserymeals')
    },
    viewAllRecipes() {
      this.$router.push('/recipes')
    },
    onSpoonFilterChange(event) {
      const value = String(event?.target?.value || '')
      const query = value === '' ? {} : { spoons: value }
      this.$router.push({ path: '/recipes', query })
    },
    onMascotImageError(event) {
      const image = event?.target
      if (!image) return

      const level = String(image.dataset.mascotLevel || '')
      const fallbackUrl = spoonMascotFallbacks[level]
      const alreadyTriedFallback = image.dataset.fallbackTried === 'true'

      if (!alreadyTriedFallback && fallbackUrl && image.src !== fallbackUrl) {
        image.dataset.fallbackTried = 'true'
        image.src = fallbackUrl
        return
      }

      image.style.display = 'none'
    },
  },
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=Inter:wght@400;500;600;700&display=swap");

.recipes-page {
  min-height: 100vh;
  padding: clamp(26px, 4vw, 54px);
}

.spoon-hero {
  width: min(1080px, 94vw);
  margin: clamp(10px, 2.2vw, 22px) auto clamp(14px, 2.8vw, 26px);
  padding: clamp(6px, 1.4vw, 14px) 0;
  display: flex;
  justify-content: center;
}

.spoon-hero__title {
  margin: 0;
  font-family: "Cherry Bomb One", "Inter", sans-serif;
  font-size: clamp(2.3rem, 8vw, 6.1rem);
  line-height: 0.92;
  color: var(--spoon-hero-color, #9a3164);
  text-align: center;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-shadow: 0 10px 18px rgba(99, 43, 71, 0.18);
}

.spoon-hero__title--plain {
  text-transform: none;
}

.spoon-hero--0 .spoon-hero__title { animation: spoon-hero-float 6.8s ease-in-out infinite; }
.spoon-hero--1 .spoon-hero__title { animation: spoon-hero-float 5.6s ease-in-out infinite; }
.spoon-hero--2 .spoon-hero__title { animation: spoon-hero-sway 4.9s ease-in-out infinite; }
.spoon-hero--3 .spoon-hero__title { animation: spoon-hero-pop 3.4s ease-in-out infinite; }
.spoon-hero--4 .spoon-hero__title { animation: spoon-hero-bounce 2.35s ease-in-out infinite; }
.spoon-hero--5 .spoon-hero__title { animation: spoon-hero-bounce 1.6s cubic-bezier(0.25, 0.85, 0.3, 1.25) infinite; }

@keyframes spoon-hero-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-8px) rotate(1deg); }
}

@keyframes spoon-hero-sway {
  0%, 100% { transform: translateY(0) rotate(-1deg) scale(1); }
  50% { transform: translateY(-10px) rotate(1.4deg) scale(1.01); }
}

@keyframes spoon-hero-pop {
  0%, 100% { transform: translateY(0) scale(1); }
  45% { transform: translateY(-8px) scale(1.04); }
  70% { transform: translateY(1px) scale(0.985); }
}

@keyframes spoon-hero-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-14px) scale(1.06); }
  58% { transform: translateY(3px) scale(0.97); }
  78% { transform: translateY(-3px) scale(1.02); }
}

.recipes-shell {
  width: min(1080px, 94vw);
  margin: 0 auto;
  background: var(--recipes-shell-bg);
  border: 1px solid var(--recipes-shell-border);
  border-radius: 30px;
  box-shadow: 0 20px 45px var(--recipes-shell-shadow);
  padding: clamp(18px, 2.5vw, 28px);
}

.recipes-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.recipes-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.recipes-filter-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.spoon-guide {
  display: block;
  max-width: min(460px, 100%);
  text-decoration: none;
  background: var(--spoon-guide-bg, rgba(255, 255, 255, 0.86));
  border: 2px dashed var(--spoon-guide-border, rgba(164, 85, 126, 0.75));
  border-radius: 16px;
  padding: 10px 12px;
  color: var(--spoon-guide-border, #6a3855);
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  position: relative;
}

.spoon-guide:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px var(--spoon-guide-shadow, rgba(125, 63, 97, 0.16));
}

.spoon-guide::after {
  content: "";
  position: absolute;
  inset: 5px;
  border-radius: 11px;
  pointer-events: none;
}

.spoon-guide__name {
  margin: 0;
  font-family: "Cherry Bomb One", "Inter", sans-serif;
  font-size: 0.95rem;
  line-height: 1.1;
  letter-spacing: 0.01em;
}

.spoon-guide__line {
  margin: 4px 0 0;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  line-height: 1.35;
}

.spoon-guide__cta {
  margin: 3px 0 0;
  font-family: "Inter", sans-serif;
  font-size: 0.78rem;
  line-height: 1.3;
  opacity: 0.9;
}

.spoon-guide--0 {
  --spoon-guide-bg: #ffe96e;
  --spoon-guide-border: #e8a1c6;
  --spoon-guide-shadow: rgba(232, 161, 198, 0.3);
}

.spoon-guide--1 {
  --spoon-guide-bg: #c9efad;
  --spoon-guide-border: #2f6d3f;
  --spoon-guide-shadow: rgba(40, 104, 58, 0.23);
}

.spoon-guide--2 {
  --spoon-guide-bg: #bde3ff;
  --spoon-guide-border: #1f4f8a;
  --spoon-guide-shadow: rgba(39, 90, 155, 0.24);
}

.spoon-guide--3 {
  --spoon-guide-bg: #d8c0ff;
  --spoon-guide-border: #54308f;
  --spoon-guide-shadow: rgba(95, 54, 160, 0.25);
}

.spoon-guide--4 {
  --spoon-guide-bg: #ffc58b;
  --spoon-guide-border: #7a4b2b;
  --spoon-guide-shadow: rgba(122, 75, 43, 0.25);
}

.spoon-guide--5 {
  --spoon-guide-bg: #ff84c7;
  --spoon-guide-border: #9b2d6f;
  --spoon-guide-shadow: rgba(155, 45, 111, 0.3);
}

.recipes-filter-text {
  color: #6f3d59;
  font-family: "Inter", sans-serif;
  font-size: 0.84rem;
  font-weight: 600;
}

.recipes-filter-select {
  appearance: none;
  border: 1.5px solid var(--recipes-btn-border, rgba(255, 79, 184, 0.45));
  border-radius: 999px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.95), var(--recipes-btn-bg, #fff));
  color: var(--recipes-btn-text, #c33770);
  font-family: "Inter", sans-serif;
  font-size: 0.87rem;
  font-weight: 600;
  min-height: 38px;
  padding: 8px 36px 8px 14px;
  cursor: pointer;
  transition: box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease;
}

.recipes-filter-select:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(255, 79, 184, 0.15);
}

.recipes-filter-select:focus {
  outline: none;
  border-color: rgba(195, 55, 112, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 79, 184, 0.22);
}

.recipes-filter-select-wrap {
  position: relative;
}

.recipes-filter-select-wrap::after {
  content: "";
  position: absolute;
  right: 14px;
  top: 50%;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(195, 55, 112, 0.8);
  border-bottom: 2px solid rgba(195, 55, 112, 0.8);
  transform: translateY(-60%) rotate(45deg);
  pointer-events: none;
}

.recipes-btn {
  border: 1px solid var(--recipes-btn-border, rgba(255, 79, 184, 0.45));
  border-radius: 999px;
  background: var(--recipes-btn-bg, #fff);
  color: var(--recipes-btn-text, #c33770);
  font-family: "Inter", sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  padding: 8px 14px;
  cursor: pointer;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.recipes-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(255, 79, 184, 0.15);
}

.recipes-btn--primary {
  background: var(--recipes-btn-primary-bg, #ff4fb8);
  color: var(--recipes-btn-primary-text, #fff);
}

.recipes-filter-label {
  margin: 0;
}

.recipes-filter-icons {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 236, 84, 0.98);
  border-radius: 999px;
  padding: 6px 10px;
}

.recipes-filter-icon {
  width: clamp(20px, 2.3vw, 30px);
  height: auto;
  object-fit: contain;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: clamp(12px, 2vw, 18px);
}

.recipes-empty {
  margin: 24px 0 10px;
  text-align: center;
  color: #8d5b73;
  font-family: "Inter", sans-serif;
}

.mascot-corner {
  width: 100%;
  pointer-events: none;
  opacity: 0.94;
  display: block;
}

.mascot-corner-wrap {
  position: fixed;
  right: clamp(10px, 2vw, 24px);
  bottom: clamp(10px, 2vw, 24px);
  width: clamp(176px, 20vw, 288px);
  z-index: 30;
  pointer-events: none;
  animation: mascot-corner-float 6.7s ease-in-out infinite;
}

.spoon-guide--floating {
  position: absolute;
  right: calc(100% + 10px);
  top: -6px;
  width: clamp(210px, 24vw, 330px);
  pointer-events: auto;
}

.mascot-float-wrap {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 24;
}

.mascot-float {
  position: absolute;
  width: clamp(74px, 9vw, 126px);
  opacity: 0.9;
  filter: drop-shadow(0 10px 18px rgba(86, 40, 63, 0.16));
}

.mascot-float--0 { left: 10px; top: 12%; animation: mascot-float-a 7.1s ease-in-out infinite; }
.mascot-float--1 { right: 12px; top: 17%; animation: mascot-float-b 8.3s ease-in-out infinite; }
.mascot-float--2 { left: 14px; top: 47%; animation: mascot-float-c 6.6s ease-in-out infinite; }
.mascot-float--3 { right: 14px; top: 52%; animation: mascot-float-d 9.2s ease-in-out infinite; }
.mascot-float--4 { left: 8px; top: 76%; animation: mascot-float-e 7.8s ease-in-out infinite; }
.mascot-float--5 { right: 8px; top: 80%; animation: mascot-float-f 8.9s ease-in-out infinite; }

@keyframes mascot-float-a {
  0%, 100% { transform: translateY(0) rotate(-2deg); }
  50% { transform: translateY(-12px) rotate(1deg); }
}
@keyframes mascot-float-b {
  0%, 100% { transform: translateY(0) rotate(1deg); }
  50% { transform: translateY(-10px) rotate(-1deg); }
}
@keyframes mascot-float-c {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-8px) translateX(6px); }
}
@keyframes mascot-float-d {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-14px) scale(1.03); }
}
@keyframes mascot-float-e {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-9px) rotate(2deg); }
}
@keyframes mascot-float-f {
  0%, 100% { transform: translateY(0) translateX(0); }
  50% { transform: translateY(-11px) translateX(-5px); }
}

@keyframes mascot-corner-float {
  0%, 100% { transform: translateY(0) rotate(-1deg); }
  50% { transform: translateY(-14px) rotate(1.4deg); }
}

@media (max-width: 640px) {
  .recipes-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .recipes-filter-controls {
    width: 100%;
    justify-content: flex-start;
  }

  .spoon-guide {
    width: 100%;
  }

  .spoon-guide--floating {
    right: calc(100% - 14px);
    top: -10px;
    width: min(68vw, 290px);
  }
}
</style>
