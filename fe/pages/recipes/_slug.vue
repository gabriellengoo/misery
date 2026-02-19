<template>
  <main class="recipe-page">
    <nav class="recipe-topbar" aria-label="Recipe navigation">
      <nuxt-link :to="backToResults" class="recipe-topbar__btn">Back to results</nuxt-link>
      <nuxt-link to="/cookbook" class="recipe-topbar__btn">Restart questionnaire</nuxt-link>
      <nuxt-link to="/recipes" class="recipe-topbar__btn">View all recipes</nuxt-link>
    </nav>

    <section class="recipe-hero">
      <div class="recipe-hero__image">
        <img v-if="heroImageUrl" :src="heroImageUrl" :alt="recipe.title" loading="lazy" />
        <div v-else class="recipe-hero__placeholder" aria-hidden="true">{{ titleInitials }}</div>
      </div>

      <div class="recipe-hero__panel">
        <h1 class="recipe-hero__title">{{ recipe.title }}</h1>

        <p class="recipe-kicker">
          <span>{{ recipe.chef || 'Misery collective' }}</span>
          <span aria-hidden="true">·</span>
          <span class="recipe-spoon-icons" :aria-label="`${spoonCount} spoons`">
            <img
              v-for="n in spoonCount"
              :key="`kicker-spoon-${n}`"
              src="/images/spoon.png"
              alt=""
              aria-hidden="true"
              class="recipe-spoon-icon"
            />
            <span v-if="spoonCount === 0">0</span>
          </span>
        </p>

        <div class="recipe-tags">
          <span class="recipe-tag">MAIN</span>
          <span v-if="isEasy" class="recipe-tag">EASY</span>
          <span v-if="recipe.vegan" class="recipe-tag">VEGAN</span>
        </div>

        <div class="recipe-meta">
          <span class="recipe-tag recipe-tag--meta">
            <span class="recipe-spoon-icons recipe-spoon-icons--badge" :aria-label="`${spoonCount} spoons`">
              <img
                v-for="n in spoonCount"
                :key="`badge-spoon-${n}`"
                src="/images/spoon.png"
                alt=""
                aria-hidden="true"
                class="recipe-spoon-icon recipe-spoon-icon--badge"
              />
              <span v-if="spoonCount === 0">0</span>
            </span>
          </span>
        </div>
      </div>
    </section>

    <section class="recipe-body">
      <div class="recipe-story">
        <p v-for="(paragraph, index) in storyParagraphs" :key="`story-${index}`">{{ paragraph }}</p>
        <p v-if="!storyParagraphs.length">Story coming soon.</p>
      </div>

      <div class="recipe-columns">
        <article class="recipe-ingredients">
          <h2>Ingredients</h2>
          <ul v-if="ingredientItems.length">
            <li v-for="(item, index) in ingredientItems" :key="`ing-${index}`">{{ item }}</li>
          </ul>
          <p v-else>Ingredients coming soon.</p>
        </article>

        <article class="recipe-method">
          <h2>Method</h2>
          <div v-if="methodSteps.length">
            <div v-for="(step, index) in methodSteps" :key="`step-${index}`" class="recipe-step">
              <span class="recipe-step__num">{{ index + 1 }}</span>
              <p class="recipe-step__text">{{ step }}</p>
            </div>
          </div>
          <p v-else>Method coming soon.</p>
        </article>
      </div>

      <section v-if="resolvedVoiceNoteUrl" class="recipe-voice-note">
        <h2>Voice note</h2>
        <audio controls preload="none" :src="resolvedVoiceNoteUrl" class="recipe-voice-note__player">
          Your browser does not support audio playback.
        </audio>
        <p class="recipe-voice-note__fallback">
          <a :href="resolvedVoiceNoteUrl" target="_blank" rel="noreferrer">Open voice note link</a>
        </p>
      </section>
    </section>
  </main>
</template>

<script>
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api'
import imageUrlBuilder from '@sanity/image-url'
import sanityClient from '@/plugins/sanity'

const bodyClass = 'cookbook-body-bg'
const builder = imageUrlBuilder(sanityClient)

function splitTextToList(value) {
  if (!value || typeof value !== 'string') return []
  return value
    .split(/\r?\n+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/, /\/d\/([a-zA-Z0-9_-]+)/]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

function normalizeAudioUrl(url) {
  if (!url) return ''
  const value = String(url).trim()
  if (!value) return ''
  const driveId = extractDriveFileId(value)
  if (driveId) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`
  }
  return value
}

export default defineComponent({
  async asyncData({ params, error }) {
    const query = `*[_type == "recipe" && slug.current == $slug][0]{
      title,
      chef,
      spoonLevel,
      vegan,
      intro,
      extras,
      content,
      contentText,
      ingredients,
      steps,
      voiceNoteUrl,
      "voiceNoteAssetUrl": voiceNote.asset->url,
      "heroImage": coalesce(mainImage, images[0]),
      docUrl
    }`

    const recipe = await sanityClient.fetch(query, { slug: params.slug })
    if (!recipe) {
      error({ statusCode: 404, message: 'Recipe not found' })
      return
    }

    return { recipe }
  },
  setup() {
    const route = useRoute()

    const spoonQuery = computed(() => {
      const raw = Array.isArray(route.value.query?.spoons)
        ? route.value.query.spoons[0]
        : route.value.query?.spoons
      const parsed = Number.parseInt(raw, 10)
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 5) return null
      return parsed
    })

    const backToResults = computed(() => {
      if (spoonQuery.value === null) return '/recipes'
      return { path: '/recipes', query: { spoons: spoonQuery.value } }
    })

    return {
      backToResults,
    }
  },
  computed: {
    spoonCount() {
      const value = Number.isFinite(this.recipe?.spoonLevel) ? this.recipe.spoonLevel : 0
      return Math.max(0, Math.min(5, Number(value) || 0))
    },
    isEasy() {
      return Number(this.recipe?.spoonLevel) <= 2
    },
    heroImageUrl() {
      if (!this.recipe?.heroImage) return ''
      return builder.image(this.recipe.heroImage).width(1200).height(900).fit('crop').auto('format').url()
    },
    titleInitials() {
      const title = (this.recipe?.title || '').trim()
      if (!title) return 'MM'
      return title
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('')
    },
    storyParagraphs() {
      const intro = this.recipe?.intro || ''
      const contentText = this.recipe?.contentText || this.recipe?.content || ''
      const primary = splitTextToList(intro)
      if (primary.length) return primary
      return splitTextToList(contentText).slice(0, 3)
    },
    ingredientItems() {
      if (Array.isArray(this.recipe?.ingredients) && this.recipe.ingredients.length) {
        return this.recipe.ingredients.filter(Boolean)
      }
      return []
    },
    methodSteps() {
      if (Array.isArray(this.recipe?.steps) && this.recipe.steps.length) {
        return this.recipe.steps.filter(Boolean)
      }
      return splitTextToList(this.recipe?.contentText || this.recipe?.content || '')
    },
    resolvedVoiceNoteUrl() {
      return normalizeAudioUrl(this.recipe?.voiceNoteUrl || this.recipe?.voiceNoteAssetUrl || '')
    },
  },
  head() {
    const title = this.recipe ? `${this.recipe.title} · Misery Meals` : 'Recipe'
    return {
      title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.recipe?.intro || this.recipe?.extras || 'Find a supportive meal for your spoons.',
        },
      ],
    }
  },
  mounted() {
    document.body.classList.add(bodyClass)
  },
  beforeDestroy() {
    document.body.classList.remove(bodyClass)
  },
})
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Cherry+Bomb+One&family=Google+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700;800&display=swap");

.recipe-page {
  min-height: 100vh;
  width: min(1120px, 94vw);
  margin: 0 auto;
  padding: clamp(22px, 4vw, 44px) 0 clamp(30px, 5vw, 60px);
}

.recipe-topbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.recipe-topbar__btn {
  text-decoration: none;
  border: 1px solid rgba(255, 79, 184, 0.45);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #c33770;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.01em;
  padding: 7px 13px;
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.recipe-topbar__btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(255, 79, 184, 0.16);
}

.recipe-hero {
  display: grid;
  grid-template-columns: minmax(320px, 1.15fr) minmax(320px, 1fr);
  gap: clamp(14px, 2vw, 22px);
  align-items: stretch;
}

.recipe-hero__image {
  border-radius: 24px;
  overflow: hidden;
  min-height: clamp(280px, 50vw, 580px);
  background: linear-gradient(145deg, rgba(255, 210, 228, 0.76), rgba(255, 255, 255, 0.85));
  box-shadow: 0 20px 42px rgba(200, 112, 154, 0.2);
}

.recipe-hero__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recipe-hero__placeholder {
  width: 100%;
  height: 100%;
  min-height: inherit;
  display: grid;
  place-items: center;
  font-family: 'Google Sans', 'Inter', sans-serif;
  font-size: clamp(2.6rem, 7vw, 5.2rem);
  font-weight: 700;
  color: rgba(195, 55, 112, 0.7);
}

.recipe-hero__panel {
  border-radius: 24px;
  background: rgba(255, 249, 253, 0.9);
  border: 1px solid rgba(255, 79, 184, 0.24);
  box-shadow: 0 16px 34px rgba(200, 112, 154, 0.15);
  padding: clamp(18px, 3vw, 30px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.recipe-hero__title {
  margin: 0;
  font-family: 'Google Sans', 'Inter', sans-serif;
  font-size: clamp(2rem, 4.6vw, 4rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: #4f3044;
}

.recipe-kicker {
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.86rem;
  color: rgba(110, 62, 90, 0.82);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.recipe-spoon-icons {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.recipe-spoon-icon {
  width: clamp(16px, 1.9vw, 24px);
  height: auto;
  object-fit: contain;
}

.recipe-spoon-icons--badge {
  gap: 4px;
}

.recipe-spoon-icon--badge {
  width: clamp(14px, 1.5vw, 18px);
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.recipe-tag {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid rgba(255, 79, 184, 0.36);
  background: rgba(255, 238, 247, 0.95);
  color: #c33770;
  font-family: 'Inter', sans-serif;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 10px;
}

.recipe-tag--meta {
  background: #ff4fb8;
  color: #fff;
  border-color: #ff4fb8;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.recipe-body {
  margin-top: clamp(16px, 2.5vw, 26px);
  display: grid;
  gap: clamp(16px, 2.5vw, 24px);
}

.recipe-story {
  border-radius: 22px;
  border: 1px solid rgba(255, 79, 184, 0.2);
  background: rgba(255, 252, 254, 0.88);
  box-shadow: 0 12px 26px rgba(199, 94, 148, 0.12);
  padding: clamp(16px, 2.2vw, 22px);
  color: #5d3c4f;
  font-family: 'Inter', sans-serif;
  line-height: 1.68;
  font-size: clamp(0.96rem, 1.5vw, 1.08rem);
}

.recipe-story p {
  margin: 0 0 0.85em;
}

.recipe-story p:last-child {
  margin-bottom: 0;
}

.recipe-columns {
  display: grid;
  grid-template-columns: minmax(280px, 0.88fr) minmax(320px, 1.12fr);
  gap: clamp(14px, 2vw, 22px);
}

.recipe-ingredients,
.recipe-method {
  border-radius: 22px;
  border: 1px solid rgba(255, 79, 184, 0.2);
  background: rgba(255, 250, 253, 0.92);
  box-shadow: 0 12px 26px rgba(199, 94, 148, 0.12);
  padding: clamp(16px, 2.2vw, 24px);
}

.recipe-ingredients h2,
.recipe-method h2 {
  margin: 0 0 12px;
  font-family: 'Cherry Bomb One', cursive;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  color: #c33770;
  letter-spacing: 0.02em;
}

.recipe-ingredients ul {
  margin: 0;
  padding-left: 1.12rem;
  color: #5d3c4f;
}

.recipe-ingredients li,
.recipe-method p {
  font-family: 'Inter', sans-serif;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #5d3c4f;
}

.recipe-step {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 79, 184, 0.16);
}

.recipe-step:first-child {
  border-top: 0;
  padding-top: 2px;
}

.recipe-step__num {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Google Sans', 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  background: #ff4fb8;
  box-shadow: 0 8px 16px rgba(255, 79, 184, 0.32);
}

.recipe-step__text {
  margin: 0;
}

.recipe-voice-note {
  border-radius: 22px;
  border: 1px solid rgba(255, 79, 184, 0.2);
  background: rgba(255, 250, 253, 0.92);
  box-shadow: 0 12px 26px rgba(199, 94, 148, 0.12);
  padding: clamp(16px, 2.2vw, 24px);
}

.recipe-voice-note h2 {
  margin: 0 0 12px;
  font-family: 'Cherry Bomb One', cursive;
  font-size: clamp(1.25rem, 2.4vw, 1.75rem);
  color: #c33770;
  letter-spacing: 0.02em;
}

.recipe-voice-note__player {
  width: 100%;
  border-radius: 12px;
}

.recipe-voice-note__fallback {
  margin: 10px 0 0;
  font-family: 'Inter', sans-serif;
  font-size: 0.88rem;
}

.recipe-voice-note__fallback a {
  color: #c33770;
}

@media (max-width: 980px) {
  .recipe-hero {
    grid-template-columns: 1fr;
  }

  .recipe-hero__image {
    min-height: 320px;
  }

  .recipe-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .recipe-page {
    width: min(92vw, 1120px);
    padding-top: 18px;
  }

  .recipe-hero__image {
    min-height: 250px;
  }

  .recipe-hero__title {
    font-size: clamp(1.6rem, 8.6vw, 2.4rem);
  }

  .recipe-kicker {
    font-size: 0.78rem;
  }

  .recipe-step {
    grid-template-columns: 34px 1fr;
  }
}
</style>
