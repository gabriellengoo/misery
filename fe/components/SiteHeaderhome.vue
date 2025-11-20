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
              <svg class="w-[4vw]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#a)" fill="#f2f2f2"> <path d="M12 0a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V1a1 1 0 0 1 1-1ZM4.929 3.515a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 0 0 1.414-1.414L4.93 3.515ZM1 11a1 1 0 1 0 0 2h4a1 1 0 1 0 0-2H1ZM18 12a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM17.657 16.243a1 1 0 0 0-1.414 1.414l2.828 2.828a1 1 0 1 0 1.414-1.414l-2.828-2.828ZM7.757 17.657a1 1 0 1 0-1.414-1.414L3.515 19.07a1 1 0 1 0 1.414 1.414l2.828-2.828ZM20.485 4.929a1 1 0 0 0-1.414-1.414l-2.828 2.828a1 1 0 1 0 1.414 1.414l2.828-2.828ZM13 19a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0v-4ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"></path> </g> <defs> <clipPath id="a"> <path fill="#ffffff" d="M0 0h24v24H0z"></path> </clipPath> </defs> </g></svg>
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

      <!-- Social Media Icons -->
<div class="sidebar-socials">
  <a href="https://twitter.com" target="_blank" aria-label="Twitter">
  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M19.7828 3.91825C20.1313 3.83565 20.3743 3.75444 20.5734 3.66915C20.8524 3.54961 21.0837 3.40641 21.4492 3.16524C21.7563 2.96255 22.1499 2.9449 22.4739 3.11928C22.7979 3.29366 23 3.6319 23 3.99986C23 5.08079 22.8653 5.96673 22.5535 6.7464C22.2911 7.40221 21.9225 7.93487 21.4816 8.41968C21.2954 11.7828 20.3219 14.4239 18.8336 16.4248C17.291 18.4987 15.2386 19.8268 13.0751 20.5706C10.9179 21.3121 8.63863 21.4778 6.5967 21.2267C4.56816 20.9773 2.69304 20.3057 1.38605 19.2892C1.02813 19.0108 0.902313 18.5264 1.07951 18.109C1.25671 17.6916 1.69256 17.4457 2.14144 17.5099C3.42741 17.6936 4.6653 17.4012 5.6832 16.9832C5.48282 16.8742 5.29389 16.7562 5.11828 16.6346C4.19075 15.9925 3.4424 15.1208 3.10557 14.4471C2.96618 14.1684 2.96474 13.8405 3.10168 13.5606C3.17232 13.4161 3.27562 13.293 3.40104 13.1991C2.04677 12.0814 1.49999 10.5355 1.49999 9.49986C1.49999 9.19192 1.64187 8.90115 1.88459 8.71165C1.98665 8.63197 2.10175 8.57392 2.22308 8.53896C2.12174 8.24222 2.0431 7.94241 1.98316 7.65216C1.71739 6.3653 1.74098 4.91284 2.02985 3.75733C2.1287 3.36191 2.45764 3.06606 2.86129 3.00952C3.26493 2.95299 3.6625 3.14709 3.86618 3.50014C4.94369 5.36782 6.93116 6.50943 8.78086 7.18568C9.6505 7.50362 10.4559 7.70622 11.0596 7.83078C11.1899 6.61019 11.5307 5.6036 12.0538 4.80411C12.7439 3.74932 13.7064 3.12525 14.74 2.84698C16.5227 2.36708 18.5008 2.91382 19.7828 3.91825ZM10.7484 9.80845C10.0633 9.67087 9.12171 9.43976 8.09412 9.06408C6.7369 8.56789 5.16088 7.79418 3.84072 6.59571C3.86435 6.81625 3.89789 7.03492 3.94183 7.24766C4.16308 8.31899 4.5742 8.91899 4.94721 9.10549C5.40342 9.3336 5.61484 9.8685 5.43787 10.3469C5.19827 10.9946 4.56809 11.0477 3.99551 10.9046C4.45603 11.595 5.28377 12.2834 6.66439 12.5135C7.14057 12.5929 7.49208 13.0011 7.49986 13.4838C7.50765 13.9665 7.16949 14.3858 6.69611 14.4805L5.82565 14.6546C5.95881 14.7703 6.103 14.8838 6.2567 14.9902C6.95362 15.4727 7.65336 15.6808 8.25746 15.5298C8.70991 15.4167 9.18047 15.6313 9.39163 16.0472C9.60278 16.463 9.49846 16.9696 9.14018 17.2681C8.49626 17.8041 7.74425 18.2342 6.99057 18.5911C6.63675 18.7587 6.24134 18.9241 5.8119 19.0697C6.14218 19.1402 6.48586 19.198 6.84078 19.2417C8.61136 19.4594 10.5821 19.3126 12.4249 18.6792C14.2614 18.0479 15.9589 16.9385 17.2289 15.2312C18.497 13.5262 19.382 11.1667 19.5007 7.96291C19.51 7.71067 19.6144 7.47129 19.7929 7.29281C20.2425 6.84316 20.6141 6.32777 20.7969 5.7143C20.477 5.81403 20.1168 5.90035 19.6878 5.98237C19.3623 6.04459 19.0272 5.94156 18.7929 5.70727C18.0284 4.94274 16.5164 4.43998 15.2599 4.77822C14.6686 4.93741 14.1311 5.28203 13.7274 5.89906C13.3153 6.52904 13 7.51045 13 8.9999C13 9.28288 12.8801 9.5526 12.6701 9.74221C12.1721 10.1917 11.334 9.92603 10.7484 9.80845Z" fill="#0F0F0F"></path> </g></svg>
  </a>
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

/* .nav-left button,
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
  
    justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left button:hover {
  background-color: #111;
  color: #fff;
} */

.nav-left button,
.help {
  background: none;
  border: none;
  border-radius: 9999px;
  padding: 0.6vw 1.4vw;
  font-size: 2.5vw;                     /* Bigger text */
 margin-top: 1vw;
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



/* ---------------------- */
/*       DARK MODE        */
/* ---------------------- */

.dark-mode .nav-left button,
.dark-mode .help {
  text-shadow: 0 0 14px rgba(255, 0, 255, 1),
  0 0 18px rgba(255, 100, 255, 0.9);
  color: #fff;   /* White text in dark mode */
  text-shadow: 0 0 8px rgba(255, 0, 255, 0.6); /* Bright purple-pink glow */
}



/* ---------------------- */



/* Accessibility dropdown */
.accessibility {
  position: relative;
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
  background-color: #ffffff;
  height: 100vh;
  overflow: scroll;
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
  font-size: 1.5vw;
  text-align: center;
  text-align: left;
  font-weight: 500;
  text-transform: lowercase;
  padding: 0.9vw 0;
  border-bottom: 1px solid #000000;
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
</style>
