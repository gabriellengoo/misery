<template>
  <div class="about-page">

        <!-- Centered Logo -->
        <div class="logo-container">
      <img src="/images/aboumis.png" alt="logo" class="logo" />
    </div>

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
  justify-items: center;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
}

/* Card */
.section-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  width: 20vw;
  height: 20vw;
  transition: transform 0.3s ease;
}

.section-card:hover {
  transform: scale(1.02);
}

/* Image fills card */
.thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;       /* fill the card */
  display: block;
  filter: brightness(0.7); /* slightly darken for readability */
  transition: filter 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;     /* match card corners */
}

/* Hover: blue glow */
.section-card:hover .thumb {
  filter: brightness(1); /* slightly brighter on hover */
  box-shadow: 0 0 15px #39c1d3, 0 0 30px #39c1d3, 0 0 50px #39c1d3; 
  transition: filter 0.3s ease, box-shadow 0.3s ease;
}


/* Text overlay — centered */
.section-card h2,
.section-card p {
  position: absolute;
  top: 50%;             /* vertical center */
  left: 50%;            /* horizontal center */
  transform: translate(-50%, -50%);  /* perfect centering */
  text-align: center;
  color: white; /* keep the original color */
  text-shadow: 0 0 7px #39c1d3, 0 0 16px #6cbaad;
  text-transform: lowercase;
  margin: 0.2rem 0;
  z-index: 2;
  pointer-events: none; /* avoid text interfering with hover */
  /* font-family: 'Antic Didone', serif; */
}

/* Title and description */
.section-card h2,
.section-card p {
  font-size: 2vw;
  color: #fff;
  text-align: center;
  transition: transform 0.3s ease;
  display: inline-block; /* needed for transform rotation */
  pointer-events: none;
}

/* Rotate animation on hover */
.section-card:hover h2,
.section-card:hover p {
  animation: tilt 0.6s infinite alternate ease-in-out;
}

/* Keyframes for tilting left and right */
@keyframes tilt {
  0%   { transform: rotate(-5deg); }
  50%  { transform: rotate(5deg); }
  100% { transform: rotate(-5deg); }
}



.misery-banner {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin: 0rem 0;
  margin-bottom: 2vw;
  margin-top: 5vw;
  font-size: 2vw;
  font-weight: 200;
  text-transform: lowercase;
  color: #000000;
  /* border: #39c1d3 2px solid; */
  color: white; /* keep the original color */
  text-shadow: 0 0 7px #39c1d3, 0 0 16px #6cbaad;
  text-shadow:
  0 0 25px rgba(57, 193, 211, 1),
  0 0 55px rgba(57, 193, 211, 0.95),
  0 0 110px rgba(57, 193, 211, 0.9),
  0 0 160px rgba(57, 193, 211, 0.8),
  0 0 240px rgba(57, 193, 211, 0.75),
  0 0 320px rgba(57, 193, 211, 0.7),
  0 0 420px rgba(57, 193, 211, 0.65);


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

@media (max-width: 768px) {
  .about-page {
    padding: 2.5rem 1.5rem 5rem;
  }

  .misery-banner {
    flex-direction: column;
    font-size: 4vw;
    gap: 2vw;
    text-align: center;
    padding: 4vw 6vw;
    padding: 16vw 6vw 4vw 4vw;
    border-radius: 30px;
  }

  .logob {
    max-height: 10vw;
  }

  .sections-grid {
    grid-template-columns: 1fr;
    gap: 6vw;
  }

  .section-card {
    width: 100%;
    height: 70vw;
    border-radius: 24px;
  }

  .section-card h2,
  .section-card p {
    font-size: 6vw;
    width: 80%;
    line-height: 1.2;
  }

  .thumb {
    border-radius: 24px;
    filter: brightness(0.55);
  }

  .about-page :deep(p) {
    font-size: 4vw;
    line-height: 1.9;
  }
}
</style>
