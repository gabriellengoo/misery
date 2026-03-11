<template>
  <div>
    <header class="header">
      <!-- Left nav -->
      <nav class="nav-left">
        <button @click="toggleSidebar">{{ headerData?.menuLabel }}</button>

        <!-- Accessibility -->
        <div class="accessibility">
          <button @click="toggleAccessibility">{{ headerData?.accessibilityLabel }}</button>
          <div v-if="showAccess" class="accessibility-menu">
            <button class="dark-toggle" @click="handleAccessibilityAction('dark')">
              
              <!-- {{ darkMode ? 'Light Mode' : 'Dark Mode' }} -->
              <svg class="icon-sun" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#a)"> <path d="M12 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM4.929 3.515a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 0 0 1.414-1.414L4.93 3.515ZM1 11a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H1ZM18 12a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM17.657 16.243a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 1 0 1.414-1.414l-2.828-2.828ZM7.757 17.657a1 1 0 1 0-1.414-1.414L3.515 19.07a1 1 0 1 0 1.414 1.414l2.828-2.828ZM20.485 4.929a1 1 0 0 0-1.414-1.414l-2.828 2.828a1 1 0 1 0 1.414 1.414l2.828-2.828ZM13 19a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"></path> </g> <defs> <clipPath id="a"> <path d="M0 0h24v24H0z"></path> </clipPath> </defs></svg>
            </button>
            <button @click="handleAccessibilityAction('increase')">Aa+</button>
            <button @click="handleAccessibilityAction('decrease')">Aa−</button>
          </div>
        </div>
      </nav>

      <!-- Center logo -->
      <div class="header-logo" @click="$router.push('/')">
        <img src="/images/misery.gif" alt="logo" />
      </div>

      <!-- Right actions -->
      <div class="header-actions">
        <button
          v-if="isAboutDetail"
          class="back-btn"
          @click="goBackToAbout"
        >
          Back
        </button>
        <button class="help" @click="$router.push(headerData?.helpLink)">
          {{ headerData?.helpLabel }}
        </button>
      </div>
    </header>

    <!-- Sidebar -->
    <aside :class="['left-sidebar', { 'left-sidebar--active': sidebarOpen }]">
      <button v-if="sidebarOpen" class="close-btn" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <nav class="sidebar-menu">
        <div v-for="link in headerData?.menuLinks" :key="link._key">
          <a :href="link.url">{{ link.label }}</a>
        </div>
        <!-- <div>
          <nuxt-link to="/shop">shop</nuxt-link>
        </div> -->
      </nav>

      <!-- Social Media Icons -->
<div class="sidebar-socials">
  <a href="https://instagram.com" target="_blank" aria-label="Instagram">
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 11C3 7.22876 3 5.34315 4.17157 4.17157C5.34315 3 7.22876 3 11 3H13C16.7712 3 18.6569 3 19.8284 4.17157C21 5.34315 21 7.22876 21 11V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H11C7.22876 21 5.34315 21 4.17157 19.8284C3 18.6569 3 16.7712 3 13V11Z" stroke="#000000" stroke-width="2"></path> <circle cx="16.5" cy="7.5" r="1.5" fill="#000000"></circle> <circle cx="12" cy="12" r="3" stroke="#000000" stroke-width="2"></circle> </g></svg>
  </a>
</div>

    </aside>

    <!-- Overlay -->
    <div v-if="sidebarOpen" class="overlay" @click="sidebarOpen = false"></div>
  </div>
</template>

<script>
export default {
  name: 'SiteHeader',
  data() {
    return {
      sidebarOpen: false,
      showAccess: false,
      headerData: null,
      darkMode: false,
      fontSize: 1,
    }
  },
  async fetch() {
    this.headerData = await this.$sanity.fetch(`*[_type == "siteHeader"][0]`)
  },
  mounted() {
    // Load accessibility settings from localStorage
    const savedDark = localStorage.getItem('darkMode') === 'true'
    const savedFont = parseFloat(localStorage.getItem('fontSize')) || 1

    this.darkMode = savedDark
    this.fontSize = savedFont

    if (this.darkMode) document.body.classList.add('dark-mode')
    this.applyFontSize()
  },
  watch: {
    sidebarOpen(isOpen) {
      if (process.client) {
        document.body.classList.toggle('menu-open', isOpen)
      }
    },
    $route() {
      this.sidebarOpen = false
      this.showAccess = false
    },
  },
  beforeDestroy() {
    if (process.client) {
      document.body.classList.remove('menu-open')
    }
  },
  computed: {
    isAboutDetail() {
      return this.$route?.name?.startsWith('about-slug')
    },
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    toggleAccessibility() {
      this.showAccess = !this.showAccess
    },
    handleAccessibilityAction(action) {
      if (action === 'dark') {
        this.toggleDarkMode()
      } else if (action === 'increase') {
        this.increaseFont()
      } else if (action === 'decrease') {
        this.decreaseFont()
      }
      this.showAccess = false
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      document.body.classList.toggle('dark-mode', this.darkMode)
      localStorage.setItem('darkMode', this.darkMode)
    },
    applyFontSize() {
      const size = `${this.fontSize}em`
      document.body.style.fontSize = size
      document.documentElement.style.fontSize = size
    },
    increaseFont() {
      this.fontSize = Math.min(this.fontSize + 0.1, 1.5)
      this.applyFontSize()
      localStorage.setItem('fontSize', this.fontSize)
    },
    decreaseFont() {
      this.fontSize = Math.max(this.fontSize - 0.1, 0.8)
      this.applyFontSize()
      localStorage.setItem('fontSize', this.fontSize)
    },
    goBackToAbout() {
      this.$router.push('/about')
    },
  },
}
</script>

<style scoped>
/* Center logo */
.header-logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
}

.header-logo img {
  height: 3vw; /* adjust as needed */
  max-height: 50px;
}
/* Header */
.header {
  /* background: white; */
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1vw 2vw;
  display: flex;
  justify-content: space-between;
  z-index: 20;
  font-family: 'Syne', sans-serif;
}

.nav-left {
  display: flex;
  gap: 0.75vw;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.8vw;
}

.nav-left button,
.help {
  background: none;
  border: none;
  border-radius: 9999px;
  padding: 0.6vw 1.4vw;
  font-size: 2.5vw;                     /* Bigger text */
 /* margin-top: 1vw; */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Antic Didone', serif;
  color: #fff;                      /* Light mode text */
  text-shadow: 0 0 6px rgba(200, 0, 255, 0.4); /* Purple-pink glow */
  text-shadow: 0 0 10px rgba(255, 0, 200, 0.9),
               0 0 14px rgba(200, 0, 255, 0.7);
  transform: scale(1.05);
}

.back-btn {
  border: 1px solid rgba(57, 193, 211, 0.8);
  border-radius: 9999px;
  padding: 0.4vw 1.4vw;
  font-size: 1.2vw;
  /* text-transform: uppercase; */
  padding: 0.6vw 1.4vw;
  font-size: 1.5vw;
  letter-spacing: 0.1em;
  color: #e9fcff;
  background: rgb(20, 35, 70);
  box-shadow: 0 0 12px rgba(57, 193, 211, 0.9), 0 0 22px rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 16px rgba(57, 193, 211, 1), 0 0 28px rgba(255, 255, 255, 0.8);
}


/* Accessibility dropdown */
.accessibility {
  position: relative;
}

.accessibility .dark-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4vw;
  color: #fff;
}
.accessibility .icon-sun {
  width: 2.2rem;
  height: 2.2rem;
  color: #fff;
  filter: drop-shadow(0 0 10px rgba(255, 0, 200, 0.9)) drop-shadow(0 0 14px rgba(200, 0, 255, 0.7));
}

.sidebar-socials {
  margin-top: auto; /* pushes it to the bottom */
  margin-top: 15vh;
  border-top: #000000 1px solid;
  display: flex;
  justify-content: center;
  gap: 1.5vw;
  padding: 1vw 0;
}

.sidebar-socials a {
  color: #00000000; 
  /* icon color */
  transition: color 0.3s, transform 0.3s;
}

.sidebar-socials a:hover {
  /* color: #a36cba; */
  transform: scale(1.2);
}




/* Dark mode */
body.dark-mode {
  background-color: #111;
  color: #fff;
}

/* body.dark-mode .header button {
  background: #222;
  color: #fff;
  border: 1px solid #444;
} */

/* Sidebar */
.left-sidebar {
  /* background-image: url('/images/bgnew.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;  */
    background: radial-gradient(circle, #215623b5, #1642189e 0, #21562396 16%, #dd56ff4d, #f3c1ff4d, #eabbf6bb, #d1c8cd3c);
    background-image: url('/images/bgmis.png');
    background-image: url('/images/micbg.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;

  position: fixed;
  top: 0;
  left: -100%;
  width: 35%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: scroll;
  flex-direction: column;
  padding: 2vw;
  z-index: 50;
  transition: left 0.3s ease;
  background-color: #161018;
  height: 100vh;
  overflow: scroll;

  /* background-size: inherit;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: unset;
    position: fixed; */
}

.left-sidebar.dark-mode  {
  background-image: url('/images/bgmis.png');
}


.left-sidebar--active {
  left: 0;
}

.close-btn {
  /* background: rgb(16, 157, 121); */
  /* background-color: #111; */
  border: none;
  /* border-radius: 50%; */
  width: 40px;
  height: 40px;
  border: 1px solid #ffffff;
  border-radius: 50%;
  padding: 0.5vw;
  display: flex;
  /* color: #000 !important; */
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 2vw;
  /* box-shadow: 0 2px 6px rgba(0,0,0,0.2); */
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.1);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5vw;
}

.sidebar-menu a,
.sidebar-menu :deep(a.nuxt-link-active) {
  text-decoration: none;
  display: block;
  font-size: 1.5vw;
  text-align: left;
  font-weight: 500;
  text-transform: lowercase;
  padding: 0.9vw 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  transition: all 0.3s ease;
  font-family: 'Antic Didone', serif;
  color: #fff;                      /* Light mode text */
  text-shadow: 0 0 6px rgba(200, 0, 255, 0.4); /* Purple-pink glow */
  text-shadow: 0 0 10px rgba(255, 0, 200, 0.9),
               0 0 14px rgba(200, 0, 255, 0.7);
  transform: scale(1.05);
}

.sidebar-menu a:hover {
  /* border-left: 4px solid #a36cba; */
  padding-left: 0.5vw;
  color: #a36cba;
  color: white;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.3);
  z-index: 40;
}

@media (max-width: 768px) {
  .back-btn {
    font-size: 4vw;
    padding: 2vw 5vw;
    letter-spacing: 0.3em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .close-btn {
    position: fixed;
    top: 4vw;
    right: 6vw;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    padding: 2vw;
    z-index: 60;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  }

  .left-sidebar {
    width: 100vw;
    left: -100vw;
    padding: 12vw 8vw;
  }

  .left-sidebar--active {
    left: 0;
  }

  .sidebar-menu {
    gap: 2vw;
  }

  .sidebar-menu a {
    font-size: 5.5vw;
    padding: 4vw 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .sidebar-socials svg {
    width: 24px;
    height: 24px;
  }

  .nav-left button,
  .help {
    font-size: 5.5vw;
    margin-top: 2vw;
    
  }

  .header-logo img {
    height: 8vw;
    max-height: 50px;
    margin-top: 3vw;

}

.accessibility-menu {
    position: absolute;
    top: 10.2vw;
    left: 3vw;
  }

  .close-btn {
    padding: 2vw;
  }

}
</style>
