// src/api/router.js

import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../../HomePage.vue'
import Test from '../../test.vue'
import LoginForm from '../../LoginForm.vue'
import FillGapsGenerator from '../../GapsGenerator.vue'
import NoisesGenerator from '../../NoisesGenerator.vue'
import { useAuthStore } from '../stores/auth'
import AliasPage from "../../AliasPage.vue";

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginForm },
  { path: '/start', component: HomePage },
  { path: '/generate-skips', component: FillGapsGenerator, meta: { requiresAuth: true } }, 
  { path: '/generate-noises', component: NoisesGenerator, meta: { requiresAuth: true } }, 
  { path: '/remove-noices', component: Test, meta: { requiresAuth: true } }, 
  { path: '/solve', component: Test, meta: { requiresAuth: true } },
  { path: '/task/:id', component: AliasPage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 1. Проверяем, если маршрут требует авторизации И пользователь не авторизован
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login') // Перенаправляем на страницу логина
  }
  // 2. Если пользователь авторизован и пытается перейти на страницу логина/регистрации
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/') // Перенаправляем на главную страницу (или на защищенную страницу по умолчанию)
  }
  // 3. Во всех остальных случаях (публичные страницы, или защищенные страницы для авторизованных)
  else {
    next() // Разрешаем переход
  }
})

export default router