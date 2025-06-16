<template>
  <div class="header-outer-wrapper">
    <div class="flex-row">
      <span class="code-genius" @click="navigateTo('/')">Codular</span>
      <div class="menu">
        <a class="contribute-problem" href="#" @click.prevent="navigateTo('/gaps-generator')">Generate gaps</a>
        <a class="solve-problems" href="#" @click.prevent="navigateTo('/generate-noises')">Generate noises</a>
        <a class="solve-problems" href="#" @click.prevent="navigateTo('/solve')">Solve problems</a>
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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore() // Инициализация store

const navigateTo = (path) => {
  if (route.path !== path || path === '/') {
    router.push(path)
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
/* Добавьте следующие стили в блок <style scoped> вашего AppHeader.vue */

:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, 'Helvetica Neue', Helvetica, Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
}

.header-outer-wrapper {
  background: #ffffff; /* Убедимся, что фон белый */
  padding: 20px 0; /* Одинаковый отступ сверху и снизу (20px), по бокам 0 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); /* Легкая тень, если нужна */
  z-index: 100; /* Убедимся, что шапка всегда сверху */
  position: relative; /* Чтобы z-index работал */
}

.flex-row {
  position: relative;
  width: 1437px; /* Или 100% с max-width и margin: auto */
  height: 65px; /* Высота внутреннего контента */
  margin: 0 auto; /* Центрируем содержимое шапки */
  display: flex;
  align-items: center;
  justify-content: space-between; /* Распределяем элементы по краям */
  padding: 0 20px; /* Горизонтальные отступы внутри flex-row, вертикальные отступы теперь заданы на .header-outer-wrapper */
  box-sizing: border-box; /* Учитываем padding в ширине */
}

.code-genius {
  font-family: Friska, var(--default-font-family);
  font-size: 36px;
  font-weight: 700;
  color: #4f46e5; /* Цвет как в макете */
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.menu {
  display: flex;
  align-items: center;
  gap: 40px; /* Отступ между элементами меню */
  margin-left: auto; /* Сдвигаем меню вправо, отталкивая от .code-genius */
  margin-right: 80px; /* Отступ между меню и блоком логина */
}

.contribute-problem,
.solve-problems {
  color: #6f6a6a;
  font-family: Friska, var(--default-font-family);
  font-size: 22px;
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
  gap: 42px;
  /* Убираем абсолютное позиционирование, так как flexbox сам справится */
  /* position: relative; */ /* Если нужно позиционировать UserProfile внутри, то относительное */
  /* width: 320px; */ /* Эти фиксированные размеры теперь не нужны из-за flexbox */
  /* height: 65px; */
  /* top: 0; */
  /* left: 1117px; */
  /* z-index: 5; */
}

.log-in {
  flex-shrink: 0;
  flex-basis: auto;
  position: relative;
  height: 55px;
  color: #6f6a6a;
  font-family: Friska, var(--default-font-family);
  font-size: 22px;
  font-weight: 400;
  line-height: 55px;
  text-align: left;
  white-space: nowrap;
  letter-spacing: 1.32px;
  text-decoration: none;
  z-index: 6;
}

.get-started {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  flex-shrink: 0;
  position: relative;
  width: 210px;
  height: 65px;
  background: #4f46e5;
  border-radius: 15px;
  color: #ffffff;
  font-family: Friska, var(--default-font-family);
  font-size: 25px;
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.get-started:hover {
  background-color: #3e38c2;
}
</style>