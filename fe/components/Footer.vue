<template>
 <div class="site-footerall">
    <footer class="site-footer" v-if="footer">
    <!-- Top: Navigation + Donate -->
    <div class="footer-top">
      <nav class="footer-nav">
        <ul>
          <li v-for="(link, i) in footer.navLinks" :key="i">
            <NuxtLink
              v-if="link.link?.slug?.current"
              :to="'/' + link.link.slug.current"
            >
              {{ link.label }}
            </NuxtLink>
            <a v-else :href="link.linkUrl || '#'" target="_blank">{{
              link.label
            }}</a>
          </li>
        </ul>
      </nav>
      <a
        v-if="footer.donateLink"
        :href="footer.donateLink"
        class="footer-donate"
      >
        donate
      </a>
    </div>

    <!-- Newsletter -->
    <div class="footer-newsletter" v-if="footer.newsletter">
      <h3>{{ footer.newsletter.title }}</h3>
      <p>{{ footer.newsletter.description }}</p>
      <form @submit.prevent="submitNewsletter">
        <input
          type="email"
          :placeholder="footer.newsletter.placeholder"
          v-model="email"
        />
        <button type="submit">{{ footer.newsletter.buttonText }}</button>
      </form>
    </div>

    <!-- Optional: Search Bar -->
    <div class="footer-search">
      <input
        type="text"
        placeholder="Search..."
        v-model="searchQuery"
        @input="onSearch"
      />
    </div>

 
  </footer>
  <p class="footer-copy">
      &copy; {{ new Date().getFullYear() }} misery
    </p>
 </div>
</template>

<script>
import sanityClient from "@sanity/client";

const client = sanityClient({
  projectId: "gsh23bac",
  dataset: "production",
  apiVersion: "2023-01-01",
  useCdn: true,
});

export default {
  data() {
    return {
      footer: null,
      email: "",
      searchQuery: "",
    };
  },
  async fetch() {
    const query = `*[_type == "footer"][0]{
        navLinks[]{label, url},
        donateLink,
        newsletter{title, description, placeholder, buttonText}
      }`;
    this.footer = await client.fetch(query);
  },
  methods: {
    submitNewsletter() {
      alert(`Newsletter submitted: ${this.email}`);
      this.email = "";
    },
    onSearch() {
      console.log("Search query:", this.searchQuery);
    },
  },
};
</script>

<style scoped>
.site-footerall {
  /* background: #fff; */
/* border-top: 1px solid #000; */
  /* padding-top: 2vw; */
}

.site-footer {
  /* background: #fff; */
  /* color: #000; */
  padding: 4vw;
  font-family: sans-serif;
  font-size: 0.9vw;
  display: flex;
  gap: 4vw;
  padding-bottom: 0;
  justify-content: space-between;
  justify-content: space-around;
}

.footer-top{
    width: 25vw;
}
.footer-newsletter {
  width: 25vw;
}
.footer-search {
  width: 25vw;
}

/* Three equal columns */
.footer-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5vw;
}

/* Navigation Section */
.footer-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1vw;
  margin-bottom: 2vw;
}

.footer-nav a {
  /* color: #000; */
  text-decoration: none;
  transition: color 0.2s;
}

.footer-nav a:hover {
  color: #5a6b41;
}

/* Donate Section */
.footer-donate {
  display: block;
  width: 100%;
  border: 1px solid #000;
  background: none;
  padding: 0.8vw 0;
  font-size: 0.9vw;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.footer-donate:hover {
  /* background: #000; */
  color: #fff;
}

/* Search + Newsletter Section */
.footer-search input,
.footer-newsletter input {
  width: 100%;
  border: none;
  /* border-bottom: 1px solid #000; */
  background: none;
  padding: 0.5vw 0;
  font-size: 0.9vw;
  margin-bottom: 1vw;
}

.footer-newsletter button {
    padding-left: 1vw;
    /* margin-top: 2vw;
    display: block;
    width: auto;
    border: 1px solid #000;
    background: none;
    padding: 0.8vw 0;
    font-size: 0.9vw;
    text-align: center;
    -webkit-text-decoration: none;
    text-decoration: none;
    cursor: pointer;
    transition: background 0.2s, color 0.2s; */
}

form{
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
}

.footer-newsletter h3 {
  font-size: 1vw;
  margin-bottom: 0.5vw;
  font-weight: 500;
}

.footer-newsletter p {
  font-size: 0.9vw;
  margin-bottom: 0.5vw;
}

.footer-newsletter button:hover {
  color: #5a6b41;
  border-color: #5a6b41;
  cursor: pointer;
}

/* Footer bottom copy */
.footer-copy {
    display: flex;
    justify-content: center;
    align-items: center;
  width: 100%;
  text-align: center;
  font-size: 0.8vw;
  /* margin-top: 2vw; */
  /* border-top: 1px solid #000; */
  padding-top: 1vw;
  /* color: #000; */
}

/* Mobile */
@media (max-width: 768px) {
  .site-footer {
    flex-direction: column;
    gap: 3vw;
  }
  .footer-column {
    width: 100%;
  }
  .footer-newsletter input,
  .footer-newsletter button,
  .footer-search input,
  .footer-donate {
    width: 100%;
    font-size: 3vw;
  }
  .footer-newsletter h3 {
    font-size: 4vw;
  }
  .footer-newsletter p {
    font-size: 3vw;
  }
  .footer-copy {
    font-size: 3vw;
  }
}

  
</style>
