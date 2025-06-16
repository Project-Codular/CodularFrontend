<template>
  <footer class="footer-outer-wrapper">
    <div class="footer-content">
      <!-- Site Description -->
      <div class="site-info">
        <span class="footer-logo">Codular</span>
        <p class="site-description">
          Codular is your platform for generating and solving coding challenges. Create custom problems with gaps or noises to test your skills or challenge others, and improve your coding abilities with unique problem types.
        </p>
      </div>

      <!-- Navigation Links -->
      <div class="footer-nav">
        <span class="nav-title">Explore Codular</span>
        <div class="nav-links">
          <a href="#" @click.prevent="navigateTo('/gaps-generator')">Generate Gaps Problems</a>
          <a href="#" @click.prevent="navigateTo('/noises')">Generate Noises Problems</a>
          <a href="#" @click.prevent="navigateTo('/solve?type=skips')">Solve Random Gaps Task</a>
          <a href="#" @click.prevent="navigateTo('/solve?type=noises')">Solve Random Noises Task</a>
        </div>
      </div>

      <!-- Info Links -->
      <div class="footer-info">
        <span class="nav-title">Info</span>
        <div class="nav-links">
          <a href="#" @click.prevent="navigateTo('/about')">About Us</a>
          <a href="#" @click.prevent="navigateTo('/team')">Our Team</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const navigateTo = (path) => {
  if (route.path !== path || path === '/') {
    router.push(path)
  }
}
</script>

<style scoped>
:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
  --primary-purple: #4f46e5;
  --text-gray: #6f6a6a;
}

.footer-outer-wrapper {
  background: #ffffff;
  padding: 40px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 1437px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.site-info {
  flex: 2;
  min-width: 300px;
}

.footer-logo {
  font-family: Friska, var(--default-font-family);
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-purple);
  display: block;
  margin-bottom: 15px;
  cursor: pointer;
}

.site-description {
  font-family: var(--default-font-family);
  font-size: 16px;
  font-weight: 400;
  color: var(--text-gray);
  line-height: 1.5;
  max-width: 400px;
}

.footer-nav,
.footer-info {
  flex: 1;
  min-width: 200px;
}

.nav-title {
  font-family: Friska, var(--default-font-family);
  font-size: 20px;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-links a {
  font-family: var(--default-font-family);
  font-size: 16px;
  font-weight: 400;
  color: var(--text-gray);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-links a:hover {
  color: var(--primary-purple);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 20px;
  }

  .site-info,
  .footer-nav,
  .footer-info {
    min-width: unset;
  }

  .footer-logo {
    font-size: 28px;
  }

  .site-description {
    font-size: 14px;
  }

  .nav-title {
    font-size: 18px;
  }

  .nav-links a {
    font-size: 14px;
  }
}
</style>