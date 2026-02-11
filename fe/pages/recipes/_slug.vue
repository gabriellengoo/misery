<template>
  <main class="recipe-page">
    <section class="recipe-card">
      <div class="recipe-meta">
        <span>{{ recipe.chef || 'Misery collective' }}</span>
        <span aria-hidden="true" class="dot">·</span>
        <span>spoons {{ recipe.spoonLevel ?? '—' }}</span>
        <span aria-hidden="true" class="dot">·</span>
        <span class="vegan-badge" :class="{ 'vegan-badge--active': recipe.vegan }">
          {{ recipe.vegan ? 'vegan-friendly' : 'non-vegan' }}
        </span>
      </div>

      <h1 class="recipe-title">{{ recipe.title }}</h1>

      <p v-if="recipe.extras" class="recipe-extras">
        {{ recipe.extras }}
      </p>

      <div v-if="hasContent" class="recipe-content">
        <p v-for="(paragraph, index) in paragraphs" :key="index">
          {{ paragraph }}
        </p>
      </div>
      <p v-else class="recipe-content recipe-content--fallback">
        Recipe details coming soon.
        <span v-if="recipe.docUrl">
          <a :href="recipe.docUrl" target="_blank" rel="noreferrer">Open recipe doc</a>
        </span>
      </p>

      <div class="recipe-cta">
        <a
          v-if="recipe.docUrl"
          class="recipe-link"
          :href="recipe.docUrl"
          target="_blank"
          rel="noreferrer"
        >
          Open recipe doc
        </a>
        <span v-else class="recipe-link recipe-link--placeholder">No doc available yet</span>
      </div>
    </section>

    <section v-if="recipe.voiceNoteUrl" class="recipe-voice">
      <h2>Voice note</h2>
      <p>
        <a :href="recipe.voiceNoteUrl" target="_blank" rel="noreferrer">
          Open voice note
        </a>
      </p>
      <audio v-if="isAudio(recipe.voiceNoteUrl)" controls :src="recipe.voiceNoteUrl"></audio>
    </section>
  </main>
</template>

<script>
import sanityClient from '@/plugins/sanity'

const bodyClass = 'cookbook-body-bg'

export default {
  async asyncData({ params, error }) {
    const query = `*[_type == "recipe" && slug.current == $slug][0]{
      title,
      chef,
      spoonLevel,
      vegan,
      extras,
      content,
      docUrl,
      voiceNoteUrl
    }`

    const recipe = await sanityClient.fetch(query, { slug: params.slug })
    if (!recipe) {
      error({ statusCode: 404, message: 'Recipe not found' })
    }

    return { recipe }
  },
  computed: {
    paragraphs() {
      if (!this.recipe?.content) return []
      return this.recipe.content.split(/\r?\n+/).filter((item) => item.trim().length)
    },
    hasContent() {
      return this.paragraphs.length > 0
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
          content: this.recipe?.extras || 'Find a supportive meal for your spoons.',
        },
      ],
    }
  },
  methods: {
    isAudio(url) {
      return /\.(mp3|wav|ogg|m4a|aac)(?:\?.*)?$/i.test(url)
    },
  },
  mounted() {
    document.body.classList.add(bodyClass)
  },
  beforeDestroy() {
    document.body.classList.remove(bodyClass)
  },
}
</script>

<style scoped>
.recipe-page {
  min-height: 100vh;
  padding: clamp(32px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.15), rgba(12, 12, 12, 0.9)),
    #04040b;
}

.recipe-card {
  width: min(860px, 92vw);
  background: rgba(255, 255, 255, 0.08);
  border-radius: 34px;
  padding: clamp(28px, 4vw, 48px);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.recipe-meta {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.8);
}

.dot {
  color: rgba(255, 255, 255, 0.4);
}

.vegan-badge {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.65);
}

.vegan-badge--active {
  color: #ff4fb8;
}

.recipe-title {
  margin: 16px 0;
  font-size: clamp(2.4rem, 5vw, 3.6rem);
  letter-spacing: 0.04em;
  font-family: 'Cherry Bomb One', 'Pinyon Script', cursive;
  text-transform: uppercase;
}

.recipe-extras {
  margin: 0 auto 16px;
  max-width: 720px;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
}

.recipe-content {
  margin-top: 20px;
  text-align: left;
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: #fff;
  line-height: 1.6;
}

.recipe-content p {
  margin-bottom: 14px;
}

.recipe-content--fallback {
  font-style: italic;
  color: rgba(255, 255, 255, 0.65);
}

.recipe-cta {
  margin-top: 28px;
}

.recipe-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  border-radius: 999px;
  background: rgba(255, 79, 184, 0.15);
  border: 1px solid rgba(255, 79, 184, 0.5);
  color: #ff4fb8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 0.85rem;
}

.recipe-link--placeholder {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.08em;
}

.recipe-voice {
  width: min(760px, 88vw);
  margin-top: 30px;
  padding: 24px;
  border-radius: 30px;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  text-align: left;
}

.recipe-voice h2 {
  margin: 0 0 14px;
  font-size: 1rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.recipe-voice p {
  margin: 0 0 14px;
}

.recipe-voice audio {
  width: 100%;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 640px) {
  .recipe-page {
    padding: 24px;
  }

  .recipe-card {
    padding: 20px;
  }

  .recipe-content {
    font-size: 1rem;
  }
}
</style>
