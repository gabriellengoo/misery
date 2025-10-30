<template>
  <div>
    <header class="header">
      <nav class="nav-left">
        <!-- Menu -->
        <button @click="toggleSidebar">{{ headerData?.menuLabel }}</button>

        <!-- Accessibility -->
        <div class="accessibility">
          <button @click="toggleAccessibility">{{ headerData?.accessibilityLabel }}</button>

          <div v-if="showAccess" class="accessibility-menu">
            <button @click="toggleDarkMode">
              {{ darkMode ? 'Light Mode' : 'Dark Mode' }}
            </button>
            <button @click="increaseFont">A+</button>
            <button @click="decreaseFont">A−</button>
          </div>
        </div>

        <!-- Events -->
        <!-- <button>{{ headerData?.eventsLabel }}</button> -->
      </nav>

      <!-- Help -->
      <button class="help" @click="$router.push(headerData?.helpLink)">
        {{ headerData?.helpLabel }}
      </button>
    </header>

    <!-- Sidebar -->
    <aside :class="['left-sidebar', { 'left-sidebar--active': sidebarOpen }]">
      <button class="close-btn" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="1">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <nav class="sidebar-menu">
        <a v-for="link in headerData?.menuLinks" :key="link._key" :href="link.url">{{ link.label }}</a>
      </nav>
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
    document.body.style.fontSize = `${this.fontSize}em`
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    toggleAccessibility() {
      this.showAccess = !this.showAccess
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode
      document.body.classList.toggle('dark-mode', this.darkMode)
      localStorage.setItem('darkMode', this.darkMode)
    },
    increaseFont() {
      this.fontSize = Math.min(this.fontSize + 0.1, 1.5)
      document.body.style.fontSize = `${this.fontSize}em`
      localStorage.setItem('fontSize', this.fontSize)
    },
    decreaseFont() {
      this.fontSize = Math.max(this.fontSize - 0.1, 0.8)
      document.body.style.fontSize = `${this.fontSize}em`
      localStorage.setItem('fontSize', this.fontSize)
    },
  },
}
</script>

<style scoped>
/* Header */
.header {
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

.nav-left button,
.help {
  background: white;
  border: none;
  border-radius: 9999px;
  padding: 0.4vw 1vw;
  font-size: 1.3vw;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left button:hover {
  border: 2px solid rgb(0, 0, 0);
  transform: scale(1.05);
}

/* Accessibility dropdown */
.accessibility {
  position: relative;
}

.accessibility-menu {
  position: absolute;
  top: 2.2vw;
  left: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  z-index: 30;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.accessibility-menu button {
  background: none;
  border: none;
  padding: 0.6vw 1vw;
  cursor: pointer;
  text-align: left;
  transition: background 0.2s ease;
}

.accessibility-menu button:hover {
  background: #f2f2f2;
}

/* Dark mode */
body.dark-mode {
  background-color: #111;
  color: #fff;
}

body.dark-mode .header button {
  background: #222;
  color: #fff;
  border: 1px solid #444;
}

/* Sidebar */
.left-sidebar {
  position: fixed;
  top: 0;
  left: -100%;
  width: 35%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 2vw;
  z-index: 50;
  transition: left 0.3s ease;
  background-color: #ffffff;
}

.left-sidebar--active {
  left: 0;
}

.close-btn {
  background: rgb(16, 157, 121);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 2vw;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.1);
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  margin-top: 2vw;
}

.sidebar-menu a {
  text-decoration: none;
  color: black;
  font-size: 2vw;
  text-align: center;
  font-weight: 500;
  text-transform: lowercase;
  padding: 0.9vw 0;
  border-bottom: 1px solid #ccc;
  transition: all 0.3s ease;
}

.sidebar-menu a:hover {
  border-left: 4px solid black;
  padding-left: 0.5vw;
  color: #111;
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
</style>
