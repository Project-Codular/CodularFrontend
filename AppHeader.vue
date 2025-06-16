<template>
  <div class="header-outer-wrapper">
    <div class="flex-row">
      <span class="code-genius" @click="navigateTo('/')">Codular</span>
      <div class="menu">
        <a class="contribute-problem" href="#" @click.prevent="navigateTo('/generate-skips')">Generate skips</a>
        <a class="solve-problems" href="#" @click.prevent="navigateTo('/generate-noises')">Generate noises</a>
        <a class="solve-problems" href="#solve-tasks-block" @click.prevent="navigateTo('/#solve-tasks-block')">Solve problems</a>
      </div>
      <div class="log-in-start">
        <template v-if="!authStore.isAuthenticated">
          <a class="log-in" href="#" @click.prevent="navigateToLogin()">Log in</a>
          <a class="get-started" href="#" @click.prevent="navigateToRegister()">Register</a>
        </template>
        <template v-else>
          <UserProfile />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './src/stores/auth' // Импорт Pinia store
import UserProfile from './UserProfile.vue' // Импорт нового компонента профиля
import { nextTick } from 'vue' // Импорт nextTick из vue

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore() // Инициализация store

const navigateTo = async (path) => {
  if (route.path !== path || path === '/') {
    await router.push(path)
    if (path === '/#solve-tasks-block') {
      await nextTick()
      setTimeout(() => {
        const element = document.getElementById('solve-tasks-block')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        } else {
          console.warn('Element #solve-tasks-block not found')
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  } else if (path === '/#solve-tasks-block') {
    await nextTick()
    setTimeout(() => {
      const element = document.getElementById('solve-tasks-block')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        console.warn('Element #solve-tasks-block not found')
      }
    }, 100) // Small delay to ensure DOM is ready
  }
}

const navigateToLogin = () => {
  if (!(route.path === '/login' && !route.query.register)) {
    router.push('/login')
  }
}

const navigateToRegister = () => {
  if (!(route.path === '/login' && route.query.register === 'true')) {
    router.push({ path: '/login', query: { register: 'true' } })
  }
}
</script>

<style scoped>
:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, 'Helvetica Neue', Helvetica, Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
}

.header-outer-wrapper {
  background: #ffffff;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
  position: relative;
}

.flex-row {
  position: relative;
  width: 90%;
  max-width: 1437px;
  height: auto;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
}

.code-genius {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.6rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #4f46e5;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.menu {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2.5rem);
  margin: 0 auto;
}

.contribute-problem,
.solve-problems {
  color: #6f6a6a;
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1rem, 1.5vw, 1.375rem);
  font-weight: 400;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.contribute-problem:hover,
.solve-problems:hover {
  color: #4f46e5;
}

.log-in-start {
  display: flex;
  align-items: center;
  gap: clamp(1rem, 2.5vw, 2.625rem);
}

.log-in {
  flex-shrink: 0;
  flex-basis: auto;
  height: auto;
  color: #6f6a6a;
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1rem, 1.5vw, 1.375rem);
  font-weight: 400;
  line-height: 1.5;
  text-align: left;
  white-space: nowrap;
  letter-spacing: 0.0825rem;
  text-decoration: none;
  z-index: 6;
}

.get-started {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
  width: clamp(8rem, 15vw, 13.125rem);
  height: clamp(2.5rem, 4vw, 4rem);
  background: #4f46e5;
  border-radius: 0.9375rem;
  color: #ffffff;
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1rem, 1.5vw, 1.5625rem);
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.get-started:hover {
  background-color: #3e38c2;
}

@media (max-width: 768px) {
  .flex-row {
    flex-direction: column;
    gap: 1rem;
    padding: 0 10px;
  }

  .code-genius {
    margin-bottom: 0.5rem;
  }

  .menu {
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
  }

  .log-in-start {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .get-started {
    width: 100%;
    max-width: 13.125rem;
  }
}

@media (max-width: 375px) {
  .code-genius {
    font-size: clamp(1.2rem, 3vw, 1.875rem);
  }

  .contribute-problem,
  .solve-problems,
  .log-in {
    font-size: clamp(0.9rem, 2vw, 1.125rem);
  }

  .get-started {
    font-size: clamp(0.9rem, 2vw, 1.25rem);
  }
}
</style>