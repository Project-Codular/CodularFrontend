// src/api/router.js

import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import LoginForm from '../views/LoginForm.vue'
import FillGapsGenerator from '../views/GapsGenerator.vue'
import NoisesGenerator from '../views/NoisesGenerator.vue'
import SolveSkipsPage from '../views/SolveSkips.vue'
import SolveNoises from '../views/SolveNoises.vue'
import { useAuthStore } from '../stores/auth'
import AliasPage from "../views/AliasPage.vue"
import MyTasks from '../views/MyTasks.vue'
import AboutProject from '../views/AboutProject.vue'
import Team from '../views/Team.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutProject },
  { path: '/our-team', component: Team },
  { path: '/login', component: LoginForm },
  { path: '/my-tasks', component: MyTasks, meta: { requiresAuth: true } },
  { path: '/start', component: HomePage },
  { path: '/generate-skips', component: FillGapsGenerator, meta: { requiresAuth: true } }, 
  { path: '/generate-noises', component: NoisesGenerator, meta: { requiresAuth: true } }, 
  { path: '/solve-skips', component: SolveSkipsPage, meta: { requiresAuth: true } },
  { path: '/solve-noises', component: SolveNoises, meta: { requiresAuth: true } },
  { path: '/task/:id', component: AliasPage, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to top for route changes (not in-page anchors)
    if (to.path !== from.path || !savedPosition) {
      return { top: 0, behavior: 'smooth' }
    }
    // Preserve saved position if navigating back (e.g., browser back button)
    if (savedPosition) {
      return savedPosition
    }
    // Handle in-page navigation (e.g., #generate-tasks-block) if needed
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  }
  else {
    next()
  }
})

export default router