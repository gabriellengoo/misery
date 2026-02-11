<template>
  <main class="cookbook-page">
    <section class="cookbook-hero">
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
        <img src="/images/areu.png" alt="areu badge" class="cookbook-float-badge" />
      </div>

      <div class="floating-img img-glow cookbook-float2" :class="{ 'is-hidden': started }">
        <img src="/images/whsp.png" alt="whsp centerpiece " />
      </div>

      <!-- CTA -->
      <div class="cookbook-cta-wrap" :class="{ 'is-hidden': started }">
        <button
          class="start-here-btn"
          type="button"
          @click="startFlow"
          @mouseenter="handleStartHereHover"
          @mouseleave="handleStartHereLeave"
          @focus="handleStartHereHover"
          @blur="handleStartHereLeave"
        >
          <span class="start-here-icon" aria-hidden="true">
            <dotlottie-wc
              ref="startHereLottieRef"
              class="start-here-lottie"
              src="https://lottie.host/66784cb4-fb22-483a-9e4f-91e96e168095/7gqRExSoS7.lottie"
            ></dotlottie-wc>
          </span>

          <span
            class="start-here-text"
            @mouseenter="handleStartHereHover"
            @mouseleave="handleStartHereLeave"
            @focus="handleStartHereHover"
            @blur="handleStartHereLeave"
          >
            START HERE
          </span>
        </button>
      </div>

      <!-- QUESTIONNAIRE -->
      <Transition name="qa">
        <section v-if="started" class="cookbook-qa" aria-live="polite">
          <div class="qa-shell">
            <Transition name="qa" mode="out-in">
              <div :key="currentNode.id" class="qa-card-wrap">
                <!-- QUESTION NODE (circle) -->
                <div v-if="currentNode.type === 'question'" class="qa-question-wrap">
                  <div class="qa-node qa-circle">
                    <p class="qa-text">{{ currentNode.text }}</p>
                  </div>

                  <div class="qa-options qa-options--stars">
                    <button
                      v-for="opt in currentNode.options"
                      :key="opt.label"
                      type="button"
                      class="qa-star-btn"
                      :class="getStarTone(opt.label)"
                      @click="goNext(opt.nextId)"
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
                <div v-else class="qa-node qa-box">
                  <p class="qa-text">{{ currentNode.text }}</p>

                  <div class="qa-result-meta" v-if="recipeLoading || selectedRecipe || recipeError">
                    <p class="qa-result-note" v-if="recipeLoading">
                      Selecting a recipe that honours your spoons...
                    </p>
                    <p class="qa-result-note" v-else-if="recipeError">
                      {{ recipeError }}
                    </p>
                    <p class="qa-result-note" v-else>
                      Redirecting you to {{ selectedRecipe.title }} ...
                    </p>
                  </div>

                  <div class="qa-options">
                    <button type="button" class="qa-pill" @click="restart">Restart</button>
                    <nuxt-link
                      v-if="recipeLink"
                      :to="recipeLink"
                      class="qa-pill qa-pill--primary"
                    >
                      View recipe
                    </nuxt-link>
                  </div>
                </div>
              </div>
            </Transition>

            <div class="qa-nav">
              <button type="button" class="qa-link" @click="goBack" :disabled="history.length === 0">
                Back
              </button>
              <button type="button" class="qa-link" @click="restart">
                Restart
              </button>
            </div>
          </div>
        </section>
      </Transition>
    </section>

    <!-- ZINE TEXT (after existing content) -->
    <section v-if="!started" class="cookbook-zine" aria-label="Spoon Theory zine text">
      <div class="zine-inner">
        <p>
          Spoon Theory is especially important for people with chronic pain, fatigue, neurodivergence, limited mobility and invisible illnesses as it helps visualise and explain that:
        </p>

        <ul>
          <li>energy is a finite, daily resource.</li>
          <li>while some people may wake up with a replenished set of spoons for the day, disabled people often don’t.</li>
          <li>unlike others, we can’t just “push through” without huge consequences — and we shouldn’t have to.</li>
          <li>we need ways to communicate our capacity to others, and plan our days with more mindfulness and care.</li>
        </ul>

        <h3>HOW DOES IT WORK?</h3>
        <p class="zine-note">(can be different for everyone)</p>

        <ul>
          <li>imagine that you start the day with a limited number of “spoons” — say, 10.</li>
          <li>each of the day’s activities requires spoons to complete e.g:</li>
        </ul>

        <ul class="zine-examples">
          <li>getting out of bed = 2 spoons</li>
          <li>showering = 2 spoons</li>
          <li>cooking = 4 spoons</li>
          <li>going to work = 5 spoons</li>
          <li>socializing = 3 spoons</li>
        </ul>

        <p>
          often, especially under capitalism, we do not have enough spoons to get through the tasks of the day, and so we need to juggle and prioritise tasks, and stretch ourselves.
        </p>

        <p>
          once we’re out of spoons, we’re completely out of energy, and we may not be able to do more without burning out or needing extended recovery.
        </p>

        <p>
          sometimes we can feel pressured to use all of our spoons up or go into minus spoons, to complete all of our obligations and “function” as others appear to in society. But for a disabled person, having less than one spoon left can mean getting to a place of meltdown and extreme pain from which it is difficult to replenish spoons again.
        </p>

        <h3>WHERE DOES IT COME FROM?</h3>

        <p>
          Spoon Theory has become a much-cherished shorthand for a big, beautiful universe of crip survival and creativity. It’s an iconic touchstone within disability justice, the Mad movement and other lineages that refuse medicalised individualism in favour of peer support and collective meaning-making.
        </p>

        <p>
          As a survivor framework, it translates lived experience into a shared language that exposes how exhaustion, pain, and cognitive difference are shaped and intensified by capitalism, sanism, racism, and ableism rather than by the bodymind alone. Spoons are not simply “used up” by bodies; they are depleted through constant negotiation with environments that refuse access, rest, or accommodation. Access is relational and survival strategies themselves can be acts of resistance.
        </p>

        <p>
          Spoon Theory works like an everyday extension of the social model of disability. It challenges the idea that our worth is tied to productivity and makes visible how disability is produced in the space between bodies, minds, and the worlds they move through.
        </p>

        <p class="zine-signoff">Spoonies 4eva &lt;3</p>

        <h3>OH, COME SPOONIE ARE YOU?</h3>

        <p>
          use this flowchart to help navigate this book &amp; find just the right recipe or resource for where you’re at &lt;3
        </p>

        <p class="zine-open">open here!</p>
      </div>
    </section>

  </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import sanityClient from "@/plugins/sanity";

const bodyClass = "cookbook-body-bg";

onMounted(() => {
  document.body.classList.add(bodyClass);
  nextTick(() => ensureStartHereLottieReady());
});
onBeforeUnmount(() => document.body.classList.remove(bodyClass));

const started = ref(false);
const currentNodeId = ref("q1");
const history = ref([]);
const startHereLottieRef = ref(null);
let startHereInitAttempts = 0;

const hotPink = "#ff4fb8";
const starColors = [hotPink, "#ffffff"];
const starPresets = [
  { size: 150, top: "4%", left: "8%", rotate: "12deg", opacity: 0.88 },
  { size: 118, top: "16%", left: "70%", rotate: "-9deg", opacity: 0.75 },
  { size: 104, top: "54%", left: "14%", rotate: "34deg", opacity: 0.8 },
  { size: 80, top: "42%", left: "78%", rotate: "-16deg", opacity: 0.72 },
  { size: 126, top: "68%", left: "34%", rotate: "4deg", opacity: 0.77 },
];

const deterministicFills = [hotPink, hotPink, "#ffffff", "#ffffff", "#ffffff"];

function buildStars() {
  return starPresets.map((star, index) => ({
    ...star,
    fill: deterministicFills[index] ?? "#ffffff",
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

const stars = buildStars();
const pinkStars = stars.filter((star) => star.fill === hotPink);
const whiteStars = stars.filter((star) => star.fill !== hotPink);

const selectedRecipe = ref(null);
const recipeLoading = ref(false);
const recipeError = ref("");
const recipeLink = computed(() =>
  selectedRecipe.value?.slug?.current ? `/recipes/${selectedRecipe.value.slug.current}` : ""
);
const navigationLock = ref(false);
let recipeRequestToken = 0;

const getStartHereDotLottie = () => startHereLottieRef.value?.dotLottie;

function resetStartHereLottie() {
  const dotLottie = getStartHereDotLottie();
  if (!dotLottie) return false;

  const totalFrames = dotLottie.totalFrames ?? dotLottie.getDuration?.(true);
  if (!totalFrames) return false;

  dotLottie.setLoop?.(false);
  dotLottie.goToAndStop
    ? dotLottie.goToAndStop(totalFrames - 1, true)
    : dotLottie.setFrame?.(totalFrames - 1);

  return true;
}


function ensureStartHereLottieReady() {
  if (resetStartHereLottie()) {
    startHereInitAttempts = 0;
    return;
  }

  if (startHereInitAttempts < 10) {
    startHereInitAttempts += 1;
    setTimeout(ensureStartHereLottieReady, 120);
  }
}

function handleStartHereHover() {
  const dotLottie = getStartHereDotLottie();
  if (!dotLottie) return;

  dotLottie.setLoop?.(false);
  dotLottie.setDirection?.(-1); // backwards
  dotLottie.play();
}


function handleStartHereLeave() {
  resetStartHereLottie();
}


// Minimal node graph (you can expand this to match the whole flowchart)
const nodes = {
  q1: {
    id: "q1",
    type: "question",
    text: "Do you want to eat?",
    options: [
      { label: "yes", nextId: "q2" },
      { label: "no", nextId: "r_appetite" },
    ],
  },
  r_appetite: {
    id: "r_appetite",
    type: "result",
    text: "Wanna take a moment to do some gentle appetite regulation somatics on P.? (and then take yourself over here)",
    options: [],
    meta: {
      spoonMax: 1,
    },
  },
  q2: {
    id: "q2",
    type: "question",
    text: "Do you feel like you can nourish yourself alone right now?",
    options: [
      { label: "yes", nextId: "q3" },
      { label: "no", nextId: "r_safety" },
    ],
  },
  r_safety: {
    id: "r_safety",
    type: "result",
    text: "Take a slow deep breath & checkout your food safety plan on P. We got this <3",
    options: [],
    meta: {
      spoonMax: 2,
    },
  },
  q3: {
    id: "q3",
    type: "question",
    text: "Do you have enough food at home?",
    options: [
      { label: "yes", nextId: "q4" },
      { label: "no", nextId: "r_shopping" },
    ],
  },
  r_shopping: {
    id: "r_shopping",
    type: "result",
    text: "Maybe our crip guide to food shopping can help? Check it out on P. (you might want to look at this one too)",
    options: [],
    meta: {
      spoonMin: 2,
      spoonMax: 3,
    },
  },

  // A “hub” after home-food = yes (you can extend with the rest of the chart)
  q4: {
    id: "q4",
    type: "question",
    text: "Do you feel able to get out of bed?",
    options: [
      { label: "yes", nextId: "q_energy" },
      { label: "not really", nextId: "q_chew" },
    ],
  },
  q_chew: {
    id: "q_chew",
    type: "question",
    text: "Do you feel up for chewing?",
    options: [
      { label: "yeah", nextId: "q_heat" },
      { label: "no", nextId: "r_soft" },
    ],
  },
  r_soft: {
    id: "r_soft",
    type: "result",
    text: "Okay—aim for soft/no-chew options (yogurt, soup, smoothies, porridge) + hydration.",
    options: [],
    meta: {
      spoonMax: 1,
    },
  },
  q_heat: {
    id: "q_heat",
    type: "question",
    text: "Can you be bothered to heat something up right now?",
    options: [
      { label: "yeah", nextId: "r_heat_yes" },
      { label: "no", nextId: "r_noheat" },
    ],
  },
  r_heat_yes: {
    id: "r_heat_yes",
    type: "result",
    text: "Cool—go for the fastest heated thing you trust (microwave, toaster, air fryer, kettle).",
    options: [],
    meta: {
      spoonMin: 2,
    },
  },
  r_noheat: {
    id: "r_noheat",
    type: "result",
    text: "No-heat win: something grabby + safe (fruit, bread + spread, cereal, ready snacks).",
    options: [],
    meta: {
      spoonMax: 2,
    },
  },
  q_energy: {
    id: "q_energy",
    type: "question",
    text: "Do you feel like you have the energy to try something new today?",
    options: [
      { label: "yum / yes", nextId: "q_when" },
      { label: "nah", nextId: "q_steps" },
    ],
  },
  q_steps: {
    id: "q_steps",
    type: "question",
    text: "Are you in a space where you can follow multi-step instruction?",
    options: [
      { label: "yes", nextId: "q_when" },
      { label: "nope (2–3 steps max)", nextId: "q_when" },
    ],
  },
  q_when: {
    id: "q_when",
    type: "question",
    text: "How soon do you want something in your mouth?",
    options: [
      { label: "within 30 mins", nextId: "q_vibe" },
      { label: "i could wait up to an hour", nextId: "q_vibe" },
    ],
  },
  q_vibe: {
    id: "q_vibe",
    type: "question",
    text: "Is today giving gourmet guru or basic baddie?",
    options: [
      { label: "guru", nextId: "q_time" },
      { label: "baddie", nextId: "q_time" },
      { label: "yep", nextId: "q_time" },
    ],
  },
  q_time: {
    id: "q_time",
    type: "question",
    text: "Are you cool with being in the kitchen for longer than 30 mins?",
    options: [
      { label: "sure", nextId: "r_long" },
      { label: "no", nextId: "r_quick" },
    ],
  },
  r_long: {
    id: "r_long",
    type: "result",
    text: "Okay—longer cook vibes. Pick a comfort recipe and take it slow.",
    options: [],
    meta: {
      spoonMin: 3,
    },
  },
  r_quick: {
    id: "r_quick",
    type: "result",
    text: "Quick win: choose the fastest thing that feels safe + satisfying.",
    options: [],
    meta: {
      spoonMax: 3,
    },
  },
};

const currentNode = computed(() => nodes[currentNodeId.value]);

function startFlow() {
  started.value = true;
  currentNodeId.value = "q1";
  history.value = [];
}

function goNext(nextId) {
  history.value.push(currentNodeId.value);
  currentNodeId.value = nextId;
}

function goBack() {
  const prev = history.value.pop();
  if (prev) currentNodeId.value = prev;
}

function restart() {
  started.value = false;
  // allow fade out/in nicely
  setTimeout(() => startFlow(), 250);
  resetRecipeSelection();
}

function getStarTone(label) {
  const normalized = label.toLowerCase();
  if (/yes|yeah|yep|yum|sure/.test(normalized)) {
    return "qa-star-btn--yes";
  }

  if (/no|nah|not|nope/.test(normalized)) {
    return "qa-star-btn--no";
  }

  return "qa-star-btn--no";
}

watch(
  currentNodeId,
  (id) => {
    const node = nodes[id];
    if (started.value && node?.type === "result") {
      fetchRecipeForNode(node);
    } else {
      resetRecipeSelection();
    }
  }
);

watch(started, (isStarted) => {
  if (!isStarted) {
    resetRecipeSelection();
    return;
  }

  if (currentNode.value?.type === "result") {
    fetchRecipeForNode(currentNode.value);
  }
});

function resetRecipeSelection() {
  selectedRecipe.value = null;
  recipeError.value = "";
  recipeLoading.value = false;
  recipeRequestToken += 1;
  navigationLock.value = false;
}

async function fetchRecipeForNode(node) {
  if (!node) return;
  const meta = node.meta || {};
  const spoonMin = Math.max(0, meta.spoonMin ?? 0);
  const spoonMax = Math.min(5, meta.spoonMax ?? 5);
  const veganFilter = typeof meta.vegan === "boolean" ? meta.vegan : null;

  recipeLoading.value = true;
  recipeError.value = "";
  selectedRecipe.value = null;
  const requestId = ++recipeRequestToken;

  const filters = [
    `_type == "recipe"`,
    `spoonLevel >= $spoonMin`,
    `spoonLevel <= $spoonMax`,
  ];
  if (veganFilter === true) {
    filters.push("vegan == true");
  } else if (veganFilter === false) {
    filters.push("vegan == false");
  }

  const query = `*[${filters.join(" && ")}] | order(spoonLevel asc, _createdAt desc)[0]{ title, slug, chef, spoonLevel, vegan }`;

  try {
    const recipe = await sanityClient.fetch(query, { spoonMin, spoonMax });
    if (recipeRequestToken !== requestId) return;
    if (recipe) {
      selectedRecipe.value = recipe;
      recipeError.value = "";
      if (!navigationLock.value) {
        const slug = recipe.slug?.current;
        if (slug) {
          navigationLock.value = true;
          if (typeof window !== "undefined") {
            window.location.href = `/recipes/${slug}`;
          }
        } else {
          recipeError.value = "We found a match but couldn't build a slug yet.";
        }
      }
    } else {
      recipeError.value = "No recipe match for that flow yet — try another thread or restart.";
    }
  } catch (error) {
    if (recipeRequestToken !== requestId) return;
    recipeError.value = error?.message ?? "Unable to load a recipe.";
  } finally {
    if (recipeRequestToken === requestId) {
      recipeLoading.value = false;
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Antic+Didone&family=Cherry+Bomb+One&family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Libre+Caslon+Text:ital@1&family=Pinyon+Script&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");
.cookbook-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
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

.cookbook-star {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  transform-origin: center;
  filter: drop-shadow(0 12px 18px rgba(255, 255, 255, 0.4));
  animation: cookbook-star-drift 14s ease-in-out infinite alternate;
}

@keyframes cookbook-star-drift {
  0% {
    transform: rotate(var(--star-rotate, 0deg)) translate(0, 0) scale(1);
  }
  100% {
    transform: rotate(var(--star-rotate, 0deg)) translate(6px, -10px) scale(1.02);
  }
}

/* existing floats */
.cookbook-float {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(260px, 42vw, 580px);
  transform: translate(-50%, -56%);
  animation: floatLeft2 20s ease-in-out infinite;
  z-index: 2;
  pointer-events: none;
}
.cookbook-float2 {
  position: absolute;
  top: 50%;
  left: 49%;
  width: max(260px, min(42vw, 580px));
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
.cookbook-float-badge {
  position: absolute;
  bottom: clamp(8px, 1.2vw, 28px);
  right: clamp(8px, 1.2vw, 28px);
  width: max(80px, min(13vw, 140px)) !important;
  pointer-events: none;
  z-index: 3;
  filter: drop-shadow(0 25px 35px rgba(0, 0, 0, 0.6));
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

/* CTA */
.cookbook-cta-wrap {
  position: absolute;
  left: 50%;
  top: calc(50% + clamp(170px, 22vh, 260px));
  transform: translateX(-50%);
  z-index: 5;
  transition: opacity 300ms ease, transform 300ms ease;
}

.start-here-btn {
     display: inline-flex;
    align-items: flex-end;
    /* gap: 14px; */
    background: transparent;
    border: 0;
    cursor: pointer;
    padding: 10px 14px;
}

.start-here-icon {
width: 20vw;
    /* height: clamp(60px, 8vw, 110px); */
    display: inline-flex;
    align-items: flex-end;
    justify-content: center;
    transition: transform 200ms ease;
    transform: scaleY(-1);
}

.start-here-icon dotlottie-wc {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.start-here-btn:hover .start-here-icon,
.start-here-btn:focus-visible .start-here-icon {
  transform: scaleY(-1) scale(1.12);
}

.start-here-text {
 font-family: "Cherry Bomb One", "Pinyon Script", cursive;
    /* letter-spacing: 0.14em; */
    /* text-transform: uppercase; */
    font-size: 4vw;
    color: #ffffff;
    /* text-shadow: 0 2px 0 rgba(0, 0, 0, 0.12); */
    transition: color 180ms ease, text-shadow 180ms ease;
}

.start-here-btn:hover .start-here-text,
.start-here-btn:focus-visible .start-here-text {
  color: rgb(215 52 119);
  text-shadow: 0 2px 6px rgba(255, 79, 184, 0.6);
}

.start-here-btn:focus-visible {
  outline: 2px solid rgba(255, 79, 184, 0.9);
  outline-offset: 6px;
  border-radius: 14px;
}

.start-here-lottie {
  transform: scale(-1, -1);
    transform-origin: center;
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

.qa-card-wrap {
  width: 100%;
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

/* dashed rounded box style (result) */
.qa-box {
  border-radius: 26px;
  background: rgba(255, 210, 228, 0.92);
  border: 3px dashed rgba(255, 79, 184, 0.9);
}

.qa-text {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.35;
  color: #c33770;
  font-weight: 600;
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

.qa-result-note {
  margin: 0;
  font-size: clamp(0.75rem, 1vw, 0.95rem);
  text-transform: lowercase;
  color: rgba(195, 56, 110, 0.9);
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
  background: #ff4fb8;
  border-color: #ff4fb8;
  color: #fff;
  margin-left: 4px;
  box-shadow: 0 10px 25px rgba(255, 79, 184, 0.35);
}
.qa-pill--primary:hover {
  transform: translateY(-2px);
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

.qa-nav {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.qa-link {
  background: transparent;
  border: 0;
  color: rgba(255, 79, 184, 0.95);
  /* text-transform: uppercase; */
  /* letter-spacing: 0.12em; */
  font-size: 2vw;
  cursor: pointer;
  padding: 8px 10px;
  font-family: "Cherry Bomb One", "Pinyon Script", cursive;
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

/* ZINE / MAG TEXT BLOCK */
.cookbook-zine {
  position: relative;
  z-index: 4;                 /* above background, below qa overlay (z-index 10) */
  width: min(980px, 92vw);
  margin: clamp(48px, 12vw, 96px) auto 90px;
  padding: 18px 14px;
  pointer-events: auto;
}

.zine-inner {
  column-count: 2;
  column-gap: clamp(18px, 4vw, 48px);
  column-rule: 1px solid rgba(255, 255, 255, 0.08);

  font-family: "Inter", "Roboto", system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0.01em;

  color: rgb(0 0 0 / 55%); /* light grey */
  mix-blend-mode: screen;            /* try: screen / overlay / plus-lighter */
  /* text-shadow: 0 1px 0 rgba(0, 0, 0, 0.22); */
}

.zine-inner p,
.zine-inner ul,
.zine-inner h3 {
  break-inside: avoid;
  margin: 0 0 12px 0;
}

.zine-inner h3 {
  font-family: "Google Sans", "Inter", system-ui, sans-serif;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 10px;
  text-transform: uppercase;
}

.zine-inner ul {
  padding-left: 18px;
}

.zine-inner li {
  margin: 0 0 8px 0;
}

.zine-note {
  opacity: 0.7;
  font-style: italic;
  margin-top: -6px;
}

.zine-examples {
  list-style: "–  ";
  padding-left: 18px;
}

.zine-signoff {
  font-family: "Libre Caslon Text", serif;
  font-style: italic;
  opacity: 0.8;
}

.zine-open {
  font-family: "Cherry Bomb One", cursive;
  font-size: 16px;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.7);
}

/* responsive: collapse to 1 column on small screens */
@media (max-width: 720px) {
  .zine-inner {
    column-count: 1;
  }
}


/* reduced motion */
@media (prefers-reduced-motion: reduce) {
  .qa-enter-active, .qa-leave-active {
    transition: opacity 0.01ms linear;
  }
  .qa-enter-from, .qa-leave-to {
    transform: none;
  }
}
</style>
