<template>
  <div class="events-page">
    <!-- <SiteHeader /> -->

    <!-- Centered Logo
    <div class="logo-container">
      <img src="/images/misery.gif" alt="logo" class="logo" />
    </div> -->

    <div class="all">
          <!-- See more link -->
          <div class="see-more">
          <p class="see-more" to="/events">what's on</p>
        </div>
        
      <!-- Filter Toolbar -->
      <div class="filter-toolbar">
        
        <!-- <button class="filter-btn" @click="togglePanel('filters')">Filters</button> -->
        <button class="filter-btn" @click="togglePanel('date')">Date Range</button>
        <button class="filter-btn" @click="togglePanel('type')">Event Type</button>
      </div>

      <!-- Filter Panels -->
      <div v-if="activePanel === 'date'" class="panel date-panel">
        <label>From: <input type="date" v-model="dateRange.start" /></label>
        <label>To: <input type="date" v-model="dateRange.end" /></label>
        <button class="apply-btn" @click="applyDateFilter">Apply</button>
      </div>

      <div v-if="activePanel === 'type'" class="panel type-panel">
        <div class="tag-list">
          <button
            v-for="tag in eventTypes"
            :key="tag"
            class="tag-btn"
            :class="{ active: selectedTypes.includes(tag) }"
            @click="toggleType(tag)"
          >
            {{ tag }}
          </button>
        </div>
      </div>

     

      <!-- Events section -->
      <section class="all-events">
        <div class="filters">
          <span class="show">show</span>
          <button
            class="btn"
            :class="{ active: showAll, inactive: !showAll }"
            @click="showAll = true"
          >
            all events
          </button>
          <button
            class="btn"
            :class="{ active: !showAll, inactive: showAll }"
            @click="showAll = false"
          >
            current events only
          </button>
        </div>

        <div class="grid">
          <div
            v-for="event in filteredEvents"
            :key="event._id"
            class="event-card"
            :class="{ past: isPast(event.date) }"
            @click="goToEvent(event)"
          >
            <img :src="event.image" :class="{ upcoming: isUpcoming(event.date) }" alt="" class="event-img" />
            <div class="event-info">
  <span class="date">{{ formatDate(event.date) }}</span>
  <h3 class="titlee">{{ event.title }}</h3>
  <span class="location">{{ event.location }}</span>
  <span class="type-tag" v-for="tag in event.eventType" :key="tag">
  {{ tag }}
</span>
</div>

          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import SiteHeader from "@/components/SiteHeader.vue";

export default {
  components: { SiteHeader },
  data() {
    return {
      showAll: true,
      activePanel: null,
      dateRange: { start: "", end: "" },
      eventTypes: [],
      selectedTypes: [],
      events: [],
    };
  },
  async fetch() {
    const query = `*[_type == "event"]{
      _id,
      title,
      "slug": slug.current,
      date,
      location,
      eventType,
      "image": image.asset->url
    }`;
    this.events = await this.$sanity.fetch(query);

    // Include any new event types from Sanity dynamically
    const sanityTypes = [...new Set(this.events.map(e => e.eventType))];
    this.eventTypes = Array.from(new Set([...this.eventTypes, ...sanityTypes]));
  },
  computed: {
    filteredEvents() {
      let list = this.showAll
        ? this.events
        : this.events.filter(e => !this.isPast(e.date));

      // Filter by date range
      if (this.dateRange.start && this.dateRange.end) {
        const start = new Date(this.dateRange.start);
        const end = new Date(this.dateRange.end);
        list = list.filter(e => new Date(e.date) >= start && new Date(e.date) <= end);
      }

      // Filter by event type
      if (this.selectedTypes.length > 0) {
        list = list.filter(e => this.selectedTypes.includes(e.eventType));
      }

      return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
  },
  methods: {
    togglePanel(name) {
      this.activePanel = this.activePanel === name ? null : name;
    },
    applyDateFilter() {
      this.activePanel = null;
    },
    toggleType(tag) {
      const index = this.selectedTypes.indexOf(tag);
      if (index > -1) this.selectedTypes.splice(index, 1);
      else this.selectedTypes.push(tag);
    },
    goToEvent(event) {
      this.$router.push(`/events/${event.slug}`);
    },
    isPast(date) {
      return new Date(date) < new Date();
    },
    isUpcoming(date) {
      return new Date(date) > new Date();
    },
    formatDate(date) {
      const d = new Date(date);
      return d.toDateString();
    },
  },
};
</script>


<style scoped>
.image-wrapper {
  position: relative;
  overflow: hidden;
}

.event-img {
  width: 100%;
  height: 20vw;
  object-fit: cover;
  transition: all 0.4s ease;
}

/* Pink filter for upcoming events */
/* .event-img.upcoming {
  filter: brightness(0.9) sepia(0.3) saturate(1.8) hue-rotate(310deg);
  transition: filter 0.3s ease;
} */

/* Remove tint on hover */
.event-card:hover .event-img.upcoming {
  filter: none;
}

.all {
  margin-top: 10vw;
}

.all-events {
  /* margin-top: 15vw; */
  /* background: #fff; */
  min-height: max-content;
  padding: 5vw 8vw;
  position: relative;
}

/* Logo */
.logo-container {
  position: absolute;
  top: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.logo {
  width: 10vw;
  min-width: 120px;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.logo:hover {
  opacity: 1;
}

/* Filter Bar */
.filters {
  display: flex;
  align-items: center;
  gap: 1vw;
  margin-bottom: 3vw;
  justify-content: left;
}

.show {
  font-size: 1vw;
  color: #444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn {
  border: 1px solid #50096e;
  padding: 0.6vw 1.4vw;
  font-size: 0.9vw;
  border-radius: 30px;
  cursor: pointer;
  background: transparent;
  color: #50096e;
  transition: all 0.3s ease;
}
.btn.inactive {
  background: #e0e0e0;
  color: #555;
}
.btn.active {
  background: #50096e;
  color: #fff;
  box-shadow: 0 4px 8px rgba(80, 9, 110, 0.25);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(80, 9, 110, 0.15);
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(calc(100% / 4), 1fr));
  gap: 1vw;
  justify-items: center;
}

/* Card styling */
.event-card {
  background: #fafafa;
  border-radius: 1vw;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
  transition: all 0.35s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
}

.event-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
}

/* Image */
.event-img {
  width: 100%;
  height: 20vw;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.event-card:hover .event-img {
  transform: scale(1.05);
}

/* Text block */
.event-info {
  padding: 1.2vw;
  text-align: left;
}

.event-info .date {
  color: #777;
  font-size: 0.9vw;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.event-info .titlee {
  font-size: 1.3vw;
  margin: 0.6vw 0;
  color: #222;
  text-transform: lowercase;
  transition: color 0.3s ease;
}

.event-info .location {
  color: #888;
  font-size: 1vw;
}

.event-card:hover .event-info .titlee {
  color: #50096e;
}

/* --- Filter Toolbar --- */
.filter-toolbar {
  padding: 2vw;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2vw;
  /* margin-bottom: 3vw; */
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  background: #f8f6fa;
  border: 1px solid #50096e;
  border-radius: 30px;
  padding: 0.6vw 1.4vw;
  color: #50096e;
  font-size: 0.95vw;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(80, 9, 110, 0.08);
}

.filter-btn:hover {
  background: #50096e;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(80, 9, 110, 0.25);
}

.filter-icon {
  width: 1.2vw;
  height: 1.2vw;
  stroke: currentColor;
}

/* --- Filter Toolbar --- */
.filter-toolbar {
  padding: 2vw 8vw;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1.2vw;
  flex-wrap: wrap;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5vw;
  background: #f8f6fa;
  border: 1px solid #50096e;
  border-radius: 30px;
  padding: 0.6vw 1.4vw;
  color: #50096e;
  font-size: 0.95vw;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #50096e;
  color: #fff;
  transform: translateY(-2px);
}

/* --- Filter Panels --- */
.panel {
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1.5vw 2vw;
  margin: 1vw 8vw 2vw;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.date-panel label {
  margin-right: 1.5vw;
}

.apply-btn {
  border: 1px solid #50096e;
  background: #50096e;
  color: #fff;
  border-radius: 25px;
  padding: 0.4vw 1vw;
  cursor: pointer;
  margin-left: 1vw;
  transition: all 0.3s ease;
}
.apply-btn:hover {
  background: #6a17a5;
}

/* --- Tag Buttons --- */
.tag-list {
  display: flex;
  gap: 1vw;
  flex-wrap: wrap;
}

.tag-btn {
  border: 1px solid #50096e;
  border-radius: 25px;
  background: #fff;
  color: #50096e;
  padding: 0.4vw 1vw;
  font-size: 0.9vw;
  cursor: pointer;
  transition: all 0.3s ease;
}
.tag-btn.active {
  background: #50096e;
  color: #fff;
}

/* Mobile */
@media (max-width: 768px) {
  .filter-toolbar {
    padding: 4vw;
    gap: 3vw;
  }
  .filter-btn {
    font-size: 3vw;
    padding: 2vw 5vw;
  }
  .panel {
    margin: 4vw;
    padding: 4vw;
  }
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .filter-toolbar {
    gap: 3vw;
  }

  .filter-btn {
    font-size: 2.5vw;
    padding: 1.5vw 4vw;
    border-radius: 40px;
  }

  .filter-icon {
    width: 3vw;
    height: 3vw;
  }
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .btn {
    font-size: 1.1vw;
    padding: 0.8vw 2vw;
  }

  .event-info .titlee {
    font-size: 1.5vw;
  }

  .event-info .date {
    font-size: 1.1vw;
  }
}

@media (max-width: 768px) {
  .logo {
    width: 20vw;
  }

  .grid {
    grid-template-columns: 1fr 1fr;
    gap: 4vw;
  }

  .event-card {
    border-radius: 2vw;
  }

  .event-info {
    padding: 3vw;
  }

  .event-info .titlee {
    font-size: 3.5vw;
  }

  .event-info .date,
  .event-info .location {
    font-size: 2.5vw;
  }

  .btn {
    font-size: 2.5vw;
    padding: 1vw 3vw;
  }
}
</style>
