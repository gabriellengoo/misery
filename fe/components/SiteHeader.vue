<template>
  <div>
    <header class="header">
      <nav class="nav-left">
        <button @click="toggleSidebar">menu</button>
        <button>Aa</button>
        <button>events</button>
      </nav>
      <button class="help">Help</button>
    </header>

    <!-- Fullscreen left sidebar -->
    <aside :class="['left-sidebar', { 'left-sidebar--active': sidebarOpen }]">
      <!-- Close button -->
   <!-- Close button -->
<button class="close-btn" @click="toggleSidebar">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
</button>


      <nav class="sidebar-menu">
        <a href="/">home</a>
        <a href="/events">events</a>
        <a href="/aa">about us</a>
        <a href="/contact">contact</a>
      </nav>
    </aside>

    <!-- Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="overlay" 
      @click="sidebarOpen = false"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'SiteHeader',
  data() {
    return {
      sidebarOpen: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }
}
</script>

<style scoped>
/* Header */
.header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  z-index: 20;
  font-family: 'Syne', sans-serif;
}

.nav-left {
  display: flex;
  gap: 0.75rem;
}

.nav-left button,
.help {
  background: white;
  border: none;
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-left button:hover {
  border: 2px solid rgb(0, 0, 0);
  transform: scale(1.05);
}

/* Left sidebar */
.left-sidebar {
  position: fixed;
  top: 0;
  left: -100%; /* hidden offscreen initially */
  width: 35%;
  height: 100vh;
  background: url('/images/bg.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  z-index: 50; /* above everything */
  transition: left 0.3s ease;
}

.left-sidebar--active {
  left: 0;
}

/* Close button */
/* Close button with circle bg */
.close-btn {
  background: rgb(16, 157, 121);        /* circle color */
  border: none;
  border-radius: 50%;       /* makes it a circle */
  width: 40px;              /* circle size */
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
  margin-bottom: 2rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2); /* optional: subtle shadow */
  transition: transform 0.2s ease;
}

.close-btn:hover {
  transform: scale(1.1); /* slight hover effect */
}


/* Sidebar menu */
.sidebar-menu {
  display: flex;
  flex-direction: column;
  margin-top: 2rem;
}

.sidebar-menu a {
  text-decoration: none;
  color: black;
  font-size: 1.2rem;
  font-weight: 500;
  text-transform: lowercase;
  padding: 0.5rem 0;
  border-bottom: 1px solid #ccc; /* light gray border between links */
  transition: all 0.3s ease;
}

.sidebar-menu a:hover {
  border-left: 4px solid black;
  padding-left: 0.5rem;
  color: #111;
}

/* Overlay */
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
