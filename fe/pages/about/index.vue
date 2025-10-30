<template>
  <div class="about-page">
     <!-- Misery banner -->
     <div class="misery-banner">
    <span class="fixed-word">
      <img class="logob" src="/images/misery.gif" alt="logo" />
    </span>
    <span
      class="changing-text"
      :key="currentLine"
      :style="{ opacity: changingOpacity }"
    >
      {{ currentLine }}
    </span>
  </div>

    <!-- <h1 class="title">About</h1> -->

    <!-- Intro text -->
    <SanityBlocks v-if="aboutIntro?.content" :blocks="aboutIntro.content" />

    <!-- Sections grid -->
    <div class="sections-grid">
      <div
        v-for="(section, i) in sections"
        :key="i"
        class="section-card"
        @click="$router.push(`/about/${section.overlaySlug.current}`)"
      >
        <img
          v-if="section.thumbnail?.asset?.url"
          :src="section.thumbnail.asset.url"
          :alt="section.title"
          class="thumb"
        />
        <h2>{{ section.title }}</h2>
        <p v-if="section.shortDescription">{{ section.shortDescription }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import sanityClient from "@sanity/client";
import SanityBlocks from "sanity-blocks-vue-component";

// ✅ Create the client
const client = sanityClient({
  projectId: "gsh23bac", // ← your actual project ID
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

export default {
  components: { SanityBlocks },

  data() {
    return {
      aboutIntro: null,
      sections: [],
      miseryLines: [
        "is crying at the party",
        "is an emotional support stuffed animal that looks sadder than you",
        "is being a fag and a dyke at the same time",
        "is a 4 hour bath and a 7 day free trial",
        "is that one piece of butt hair the beautician forgot about",
        "is waxing your butt in the first place",
        "is living in your overdraft but eating out anyway",
        "is searching for a halal photo to send nani",
        "is putting your headphones in but not even listening to anything you just don’t want to chat",
        "is your second hand binder",
        "is falling in love with your therapist",
        "is listening to a meditation on 2x speed",
        "is this too shall pass",
        "is freedom is sorrow is moments of connection is dissociation is remembering is moving through",
        "is company",
        "is me and you.",
      ],
      currentIndex: 0,
      changingOpacity: 1,
      fadeDuration: 2000, // fade out duration in ms
      displayDuration: 2000, // time fully visible
    };
  },
  computed: {
    currentLine() {
      return this.miseryLines[this.currentIndex];
    },
  },
  mounted() {
    this.startFadeCycle();
  },
  methods: {
    startFadeCycle() {
      const cycle = () => {
        // line stays visible
        this.changingOpacity = 1;
        // fade out slowly after displayDuration
        setTimeout(() => {
          this.changingOpacity = 0;
        }, this.displayDuration);
        // move to next line after fadeDuration + displayDuration
        setTimeout(() => {
          this.currentIndex = (this.currentIndex + 1) % this.miseryLines.length;
          cycle(); // repeat
        }, this.displayDuration + this.fadeDuration);
      };
      cycle();
    },
  },

  async fetch() {
    try {
      // Fetch the intro "About" content
      this.aboutIntro = await client.fetch(
        `*[_type == "aboutIntro"][0]{ title, content }`
      );

      // Fetch all sections (e.g., team, story, etc.)
      this.sections = await client.fetch(`
          *[_type == "aboutSection"] | order(_createdAt asc) {
            title,
            overlaySlug,
            shortDescription,
            thumbnail{asset->{url}},
            sectionType
          }
        `);
    } catch (err) {
      console.error("Sanity fetch error:", err);
    }
  },
};
</script>

<style scoped>
.logob {
  max-width: 15w;
}

.misery-banner .fixed-word {
  font-weight: 400;
  margin-right: 0.5rem;
}

.misery-banner .changing-text {
  font-weight: 200;
  opacity: 0.8;
}

/* fade transition */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 1s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
.fade-text-enter-to,
.fade-text-leave-from {
  opacity: 1;
}

.about-page {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: auto;
}
.title {
  text-transform: uppercase;
  font-size: 2rem;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}
.intro {
  max-width: 800vw;
  margin-bottom: 4rem;
  line-height: 1.6;
}
.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
}
.section-card {
  cursor: pointer;
  text-align: center;
  transition: opacity 0.3s ease;
}
.section-card:hover {
  opacity: 0.7;
}
.thumb {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 1rem;
}
.section-card h2 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}
.section-card p {
  color: #666;
  font-size: 0.95rem;
}
.misery-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0rem 0;
  margin-bottom: 9vw;
  font-size: 1.2rem;
  font-weight: 200;
  text-transform: lowercase;
  color: #000000;
}

.misery-banner .fixed-word {
  font-weight: 400;
}

.logob {
  max-height: 2rem;
}

.misery-banner .changing-text {
  font-weight: 200;
  opacity: 1;
  transition: opacity 2s linear;
}


/* fade transition */
.fade-text-enter-active,
.fade-text-leave-active {
  transition: opacity 3s ease;
}
.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}
.fade-text-enter-to,
.fade-text-leave-from {
  opacity: 1;
}
</style>
