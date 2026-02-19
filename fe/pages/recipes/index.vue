<template>
  <main class="recipes-page">
    <section class="recipes-shell">
      <header class="recipes-topbar">
        <div class="recipes-actions">
          <button type="button" class="recipes-btn" @click="goToCookbook">Restart</button>
          <button type="button" class="recipes-btn recipes-btn--primary" @click="viewAllRecipes">
            View all recipes
          </button>
        </div>
        <p v-if="hasFilter" class="recipes-filter-label">
          <span class="recipes-filter-icons" :aria-label="`${spoonFilter} spoons`">
            <img
              v-for="n in spoonIcons"
              :key="`filter-spoon-${n}`"
              src="/images/spoon.png"
              alt=""
              aria-hidden="true"
              class="recipes-filter-icon"
            />
            <span v-if="spoonIcons.length === 0">0</span>
          </span>
        </p>
      </header>

      <section v-if="safeRecipes.length" class="recipes-grid" aria-label="Recipes">
        <nuxt-link
          v-for="recipe in safeRecipes"
          :key="recipe.slug || recipe.title"
          :to="recipe.slug ? `/recipes/${recipe.slug}` : '/recipes'"
          class="recipe-card"
        >
          <div class="recipe-card-image-wrap">
            <img
              v-if="imageUrl(recipe.image)"
              :src="imageUrl(recipe.image)"
              :alt="recipe.title"
              class="recipe-card-image"
              loading="lazy"
            />
            <div v-else class="recipe-card-placeholder" aria-hidden="true">No image</div>
          </div>
          <h2 class="recipe-card-title">{{ recipe.title }}</h2>
        </nuxt-link>
      </section>

      <p v-else class="recipes-empty">
        No recipes found for this spoon level yet.
      </p>
    </section>
  </main>
</template>

<script>
import imageUrlBuilder from '@sanity/image-url'
import sanityClient from '@/plugins/sanity'

const bodyClass = 'cookbook-body-bg'
const builder = imageUrlBuilder(sanityClient)

export default {
  watchQuery: ['spoons'],
  async asyncData({ query }) {
    const rawSpoons = Array.isArray(query.spoons) ? query.spoons[0] : query.spoons
    const parsed = Number.parseInt(rawSpoons, 10)
    const spoonFilter = Number.isInteger(parsed) && parsed >= 0 && parsed <= 5 ? parsed : null

    const filteredQuery = `*[_type=="recipe" && spoonLevel == $spoons] | order(title asc) {
      title,
      "slug": slug.current,
      spoonLevel,
      "image": coalesce(mainImage, images[0])
    }`

    const allQuery = `*[_type=="recipe"] | order(spoonLevel asc, title asc) {
      title,
      "slug": slug.current,
      spoonLevel,
      "image": coalesce(mainImage, images[0])
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
    spoonIcons() {
      if (!Number.isInteger(this.spoonFilter)) return []
      const count = Math.max(0, Math.min(5, Number(this.spoonFilter) || 0))
      return Array.from({ length: count }, (_, index) => index + 1)
    },
    safeRecipes() {
      return Array.isArray(this.recipes) ? this.recipes : []
    },
  },
  mounted() {
    document.body.classList.add(bodyClass)
  },
  beforeDestroy() {
    document.body.classList.remove(bodyClass)
  },
  methods: {
    imageUrl(source) {
      if (!source) return ''
      return builder.image(source).width(760).height(500).fit('crop').auto('format').url()
    },
    goToCookbook() {
      this.$router.push('/cookbook')
    },
    viewAllRecipes() {
      this.$router.push('/recipes')
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

.recipes-shell {
  width: min(1080px, 94vw);
  margin: 0 auto;
  background: rgba(255, 250, 253, 0.82);
  border: 1px solid rgba(255, 79, 184, 0.2);
  border-radius: 30px;
  box-shadow: 0 20px 45px rgba(199, 94, 148, 0.18);
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

.recipes-btn {
  border: 1px solid rgba(255, 79, 184, 0.45);
  border-radius: 999px;
  background: #fff;
  color: #c33770;
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
  background: #ff4fb8;
  color: #fff;
}

.recipes-filter-label {
  margin: 0;
}

.recipes-filter-icons {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.recipes-filter-icon {
  width: clamp(20px, 2.3vw, 30px);
  height: auto;
  object-fit: contain;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: clamp(12px, 2vw, 18px);
}

.recipe-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 8px;
  border: 1px solid rgba(255, 79, 184, 0.15);
  box-shadow: 0 10px 26px rgba(180, 114, 141, 0.14);
  transition: transform 160ms ease, box-shadow 160ms ease;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(180, 114, 141, 0.2);
}

.recipe-card-image-wrap {
  aspect-ratio: 4 / 3;
  border-radius: 14px;
  overflow: hidden;
  background: linear-gradient(145deg, #ffe9f5, #fff6fb);
}

.recipe-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.recipe-card-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(195, 55, 112, 0.6);
  font-family: "Inter", sans-serif;
  font-size: 0.8rem;
}

.recipe-card-title {
  margin: 0;
  padding: 4px 6px 8px;
  font-family: "Inter", sans-serif;
  font-size: 0.94rem;
  line-height: 1.3;
  color: #5b3a4d;
  text-align: center;
}

.recipes-empty {
  margin: 24px 0 10px;
  text-align: center;
  color: #8d5b73;
  font-family: "Inter", sans-serif;
}

@media (max-width: 640px) {
  .recipes-topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
