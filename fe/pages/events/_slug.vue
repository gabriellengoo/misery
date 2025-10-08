<template>
    <div class="event-page">
      <!-- Close Button -->
      <div class="close-btn" @click="$router.push('/#events')">×</div>
  
      <!-- Centered Logo -->
      <div class="logo-container">
        <img src="/images/misery.gif" alt="logo" class="logo" />
      </div>
  
      <!-- Event Content -->
      <div class="event-content">
        <img :src="event.image" alt="" class="event-banner" />
  
        <div class="event-details">
  <div class="date-block">
    <span class="day">{{ formattedDate.day }}</span>
    <div class="weekday-month">
      <span class="weekday">{{ formattedDate.weekday }}</span>
      <span class="month">{{ formattedDate.month }}</span>
    </div>
  </div>

  <h1 class="title">{{ event.title }}</h1>
  <p class="description" v-html="event.description"></p>


          <div class="share">
            <a href="#" @click.prevent="shareEvent">share this event →</a>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        event: {},
      };
    },
    mounted() {
      const slug = this.$route.params.slug;
  
      const allEvents = [
  {
    date: "friday, 19 september",
    title: "friday late",
    image: "/images/event1.jpeg",
    description: `
      <strong>join us</strong> for an evening of <em>art, music, and culture</em> 
      at the <a href="https://www.vam.ac.uk" target="_blank">v&a museum</a>. 
      expect performances, talks, and installations from <strong>emerging artists</strong>. 
      <br><br>
      tickets available soon — stay tuned.
    `,
  },
  {
    date: "friday, 26 november",
    title: "hope this finds you well",
    image: "/images/event1.jpeg",
    description: `
      
      <strong>join us</strong> for an evening of <em>art, music, and culture</em> 
      at the <a href="https://www.vam.ac.uk" target="_blank">v&a museum</a>. 
      expect performances, talks, and installations from <strong>emerging artists</strong>. 
      <br><br>
      tickets available soon — stay tuned.
    
    `,
  },
];

  
      this.event = allEvents.find(
        (e) => e.title.toLowerCase().replace(/\s+/g, "-") === slug
      );
    },
    methods: {
      shareEvent() {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
      },
    },
    computed: {
    formattedDate() {
      // Example: event.date = "fri, 19 sep"
      if (!this.event.date) return {};
      const [weekday, day, month] = this.event.date.split(" ");
      return {
        weekday: weekday.replace(",", ""), // "fri"
        day, // "19"
        month, // "sep"
      };
    },
  },
  };
  </script>
  
  <style scoped>
  .event-page {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: #fff;
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
    box-shadow: 0 10px 30px rgba(0, 0, 0, .4);
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
  }
  
  .description {
    font-size: 1.05rem;
    line-height: 1.8;
    color: #222;
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
    font-size: 4.5rem;
    color: #000;
    cursor: pointer;
    z-index: 1000;
    font-weight: 400;
    line-height: 1;
    transition: 0.2s ease;
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
  color: #333;
}

.month {
  font-size: 1.2rem;
  text-transform: lowercase;
  color: #666;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.1;
}

  </style>
  