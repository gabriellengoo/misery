<template>
  <div class="event-page" v-if="event">
    <!-- Close Button -->
    <button class="close-btn" @click="$router.push('/events')" aria-label="Close">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    </button>

    <!-- Centered Logo -->
    <div class="logo-container">
      <img src="/images/misery.gif" alt="logo" class="logo" />
    </div>

    <!-- Event Content -->
    <div class="event-content">
      <img :src="event.image" alt="" class="event-banner" />

      <div class="event-details">
        <div class="date-block" v-if="formattedDate.day">
          <span class="day">{{ formattedDate.day }}</span>
          <div class="weekday-month">
            <span class="weekday">{{ formattedDate.weekday }}</span>
            <span class="month">{{ formattedDate.month }}</span>
          </div>
        </div>

        <h1 class="title">{{ event.title }}</h1>

        <div class="description">
          <SanityBlocks :blocks="event.body" />
        </div>

        <div class="share">
          <a href="#" @click.prevent="shareEvent">share this event →</a>
        </div>
      </div>
    </div>

    <!-- Past Event Carousel (only if event is past) -->
    <!-- Past Event Carousel (only if event is past) -->
    <div v-if="event && isPast(event.date)" class="past-carousel">
  <h2>past event highlights</h2>

  <div class="carousel-wrapper">
    <div class="carousel-frame">
      <img
        :src="carouselImages[currentIndex]"
        alt="highlight"
        class="carousel-single-img"
      />
    </div>

    <!-- Full-width arrows -->
    <div class="carousel-arrow left" @click="prevImage">
      <!-- <img src="/images/lefta.png" alt="Prev" /> -->
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M16.1795 3.26875C15.7889 2.87823 15.1558 2.87823 14.7652 3.26875L8.12078 9.91322C6.94952 11.0845 6.94916 12.9833 8.11996 14.155L14.6903 20.7304C15.0808 21.121 15.714 21.121 16.1045 20.7304C16.495 20.3399 16.495 19.7067 16.1045 19.3162L9.53246 12.7442C9.14194 12.3536 9.14194 11.7205 9.53246 11.33L16.1795 4.68297C16.57 4.29244 16.57 3.65928 16.1795 3.26875Z" fill="#0F0F0F"></path> </g></svg>
    </div>
    <div class="carousel-arrow right" @click="nextImage">
      <!-- <img src="/images/righta.png" alt="Next" /> -->
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.82054 20.7313C8.21107 21.1218 8.84423 21.1218 9.23476 20.7313L15.8792 14.0868C17.0505 12.9155 17.0508 11.0167 15.88 9.84497L9.3097 3.26958C8.91918 2.87905 8.28601 2.87905 7.89549 3.26958C7.50497 3.6601 7.50497 4.29327 7.89549 4.68379L14.4675 11.2558C14.8581 11.6464 14.8581 12.2795 14.4675 12.67L7.82054 19.317C7.43002 19.7076 7.43002 20.3407 7.82054 20.7313Z" fill="#0F0F0F"></path> </g></svg>
    </div>
  </div>
</div>



  </div>
</template>

<script>
import SanityBlocks from 'sanity-blocks-vue-component';

export default {
  components: { SanityBlocks },
  data() {
    return {
      event: null,
      carouselImages: [],
      currentIndex: 0,
      intervalId: null,
      
    };
  },
  async fetch() {
    const slug = this.$route.params.slug;

    // Fetch the main event
    const query = `*[_type == "event" && slug.current == $slug][0]{
  title,
  date,
  location,
  "image": image.asset->url,
  body,
  eventType,
  "carouselImages": carouselImages[]{asset->{url}}
}`;

this.event = await this.$sanity.fetch(query, { slug });

if (this.event?.date) {
  this.event.date = new Date(this.event.date).toISOString();
}

    // Prepare carousel images if present
 
    if (this.event?.carouselImages?.length) {
  this.carouselImages = this.event.carouselImages
    .filter(img => img?.asset?.url)
    .map(img => img.asset.url);
} else if (this.event?.image) {
  this.carouselImages = [this.event.image];
}


this.event = {
  title: this.event?.title || "",
  location: this.event?.location || "",
  body: this.event?.body || [],
  eventType: this.event?.eventType || [],
  image: this.event?.image || "",
  carouselImages: this.carouselImages || [],
  date: this.event?.date || "",
};


    // Auto-rotate carousel only for past events
    if (this.event?.date && this.isPast(this.event.date)) {
  this.intervalId = setInterval(this.nextImage, 3000);
}

  },
  beforeDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  },
  computed: {
    formattedDate() {
      if (!this.event?.date) return {};
      const dateObj = new Date(this.event.date);
      const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
      const day = dateObj.getDate();
      const month = dateObj.toLocaleDateString("en-US", { month: "short" });
      return { weekday, day, month };
    },
  },
  methods: {
    shareEvent() {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    },
    isPast(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
},
nextImage() {
  if (!this.carouselImages.length) return;
  this.currentIndex = (this.currentIndex + 1) % this.carouselImages.length;
},
prevImage() {
  if (!this.carouselImages.length) return;
  this.currentIndex = (this.currentIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
},

  },
};
</script>


<style scoped>

.past-events-carousel {
  width: 100%;
  margin-top: 5rem;
  text-align: center;
}
.past-events-carousel h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.carousel {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.carousel-card {
  min-width: 220px;
  flex: 0 0 auto;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.carousel-card:hover {
  transform: scale(1.05);
}

.carousel-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.carousel-info h3 {
  font-size: 1.1rem;
  margin: 0;
}

.carousel-info span {
  font-size: 0.9rem;
  color: #666;
}

.past-carousel {
  margin-top: 3rem;
  text-align: center;
}
.carousel-container {
  position: relative;
  max-width: 600px;
  margin: 1rem auto;
}
.carousel-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 6px;
}
.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  background: rgba(0,0,0,0.4);
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
}
.carousel-btn.prev {
  left: 0;
}
.carousel-btn.next {
  right: 0;
}

.event-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  background-image: url('/images/micbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  z-index: 999;
  overflow-y: auto;
  padding: 4rem 6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Centered logo */
.logo-container {
  position: fixed;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.logo {
  height: 90px;
  width: auto;
  display: block;
}

/* Layout */
.event-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 5rem;
  max-width: 1200px;
  width: 100%;
  margin-top: 18vh;
}

/* Image styling — no round corners + soft shadow */
.event-banner {
  width: 50%;
  height: auto;
  object-fit: cover;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

/* Text styling */
.event-details {
  flex: 1;
  max-width: 500px;
  color: #000;
}

.date {
  font-size: 1.4rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  color: #333;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
  color: white;
  text-shadow: 0 0 7px #39c1d3, 0 0 16px #6cbaad;
  transition: text-shadow 0.3s ease;
}

.description {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #222;
  background-image: url('/images/textbg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

.description strong {
  font-weight: 700;
}

.description em {
  font-style: italic;
  color: #555;
}

.description a {
  color: #5a6b41;
  text-decoration: none;
  border-bottom: 1px solid #5a6b41;
  transition: 0.2s ease;
}

.description a:hover {
  color: #000;
  border-color: #000;
}

.share {
  margin-top: 2.5rem;
}

.share a {
  color: #000;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.5px;
  border-bottom: 1px solid transparent;
  transition: 0.3s ease;
}

.share a:hover {
  border-color: #000;
}

/* Close button */
.close-btn {
  position: fixed;
  top: 2rem;
  right: 3rem;
  background: rgba(255, 255, 255, 0.15);
  color: #000;
  border: 1px solid rgba(255, 255, 255, 0.5);
  
  /* border: none; */
  border-radius: 50%;
  padding: 0.8rem;
  cursor: pointer;
  z-index: 1000;
  transition: 0.2s ease;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  transform: scale(1.1);
}
.event-details {
  flex: 1;
  max-width: 500px;
  color: #000;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* date block layout */
.date-block {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 2rem;
}

.day {
  font-size: 4rem;
  /* font-weight: 700; */
  line-height: 1;
}

.weekday-month {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  line-height: 1.1;
  transform: translateY(-0.3rem);
}

.weekday {
  font-size: 1.4rem;
  text-transform: lowercase;
  /* color: #333; */
}

.month {
  font-size: 1.2rem;
  text-transform: lowercase;
  color: #666;
  color: rgba(255, 0, 200, 0.9);
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

@media (max-width: 768px) {
  .event-page {
    padding: 8rem 1.5rem 4rem;
  }

  .logo {
    height: 60px;
  }

  .close-btn {
    top: 3vw;
    right: 5vw;
    padding: 4vw;
  }

  .event-content {
    flex-direction: column;
    gap: 3rem;
    margin-top: 12vh;
  }

  .event-banner {
    width: 100%;
  }

  .event-details {
    max-width: none;
    width: 100%;
  }

  .date-block {
    justify-content: space-between;
  }

  .day {
    font-size: 3rem;
  }

  .weekday {
    font-size: 1.2rem;
  }

  .month {
    font-size: 1rem;
  }

  .title {
    font-size: 2.4rem;
  }

  .description {
    font-size: 1rem;
  }

  .carousel-arrow img {
    width: 32px;
  }
}
</style>
