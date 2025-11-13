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
            <button @click="toggleDarkMode">
              
              <!-- {{ darkMode ? 'Light Mode' : 'Dark Mode' }} -->
              <svg class="w-[3vw]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#a)" fill="#39c1d3"> <path d="M12 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM4.929 3.515a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 0 0 1.414-1.414L4.93 3.515ZM1 11a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H1ZM18 12a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM17.657 16.243a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 1 0 1.414-1.414l-2.828-2.828ZM7.757 17.657a1 1 0 1 0-1.414-1.414L3.515 19.07a1 1 0 1 0 1.414 1.414l2.828-2.828ZM20.485 4.929a1 1 0 0 0-1.414-1.414l-2.828 2.828a1 1 0 1 0 1.414 1.414l2.828-2.828ZM13 19a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"></path> </g> <defs> <clipPath id="a"> <path fill="#ffffff" d="M0 0h24v24H0z"></path> </clipPath> </defs> </g></svg>
            </button>
            <button @click="increaseFont">Aa+</button>
            <button @click="decreaseFont">Aa−</button>
          </div>
        </div>
      </nav>

      <!-- Center logo -->
      <!-- <div class="header-logo">
        <img src="/images/misery.gif" alt="logo" />
      </div> -->

      <!-- Right help button -->
      <button class="help" @click="$router.push(headerData?.helpLink)">
        {{ headerData?.helpLabel }}
      </button>
    </header>

    <!-- Sidebar -->
    <aside :class="['left-sidebar', { 'left-sidebar--active': sidebarOpen }]">
      <button class="close-btn" @click="toggleSidebar">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="black" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <nav v-for="link in headerData?.menuLinks" class="sidebar-menu">
        <!-- <span class="text-[1vw]">*•̩̩͙✩•̩̩͙*˚</span> -->
        <!-- <span class="text-[1vw] flex justify-center items-center w-[100%]">＊*•̩̩͙✩•̩̩͙*˚</span> -->
        <a  :key="link._key" :href="link.url"> {{ link.label }}</a>
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
/* Center logo */
.header-logo {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
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

.nav-left button,
.help {
  background: white;
  border: none;
  border-radius: 9999px;
  padding: 0.4vw 1vw;
  font-size: 1.5vw;
  margin-top: 1vw;
  display: flex;
  text-align: center;
  align-items: center;
  /* color: #39c1d3; */
    justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left button:hover {
  /* border: 2px solid rgb(0, 0, 0); */
  background-color: #111;
  color: #fff;
  /* transform: scale(1.05); */
}

/* Accessibility dropdown */
.accessibility {
  position: relative;
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
  /* background-image: url('/images/bgnew.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;  */
    background: radial-gradient(circle, #215623b5, #1642189e 0, #21562396 16%, #dd56ff4d, #f3c1ff4d, #eabbf6bb, #d1c8cd3c);
   
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
  background-color: #ffffff;
  height: 100vh;
  overflow: scroll;
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

  /* margin-top: 2vw; */
}

.sidebar-menu a {
  text-decoration: none;
  color: black;
  font-size: 2.5vw;
  text-align: center;
  font-weight: 500;
  text-transform: lowercase;
  padding: 0.9vw 0;
  border-bottom: 1px solid #000000;
  transition: all 0.3s ease;
}

.sidebar-menu a:hover {
  /* border-left: 4px solid #a36cba; */
  padding-left: 0.5vw;
  color: #a36cba;
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
