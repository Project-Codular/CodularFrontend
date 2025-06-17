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
import NotFound from '../views/NotFound.vue'

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
  { path: '/:catchAll(.*)', component: NotFound } // Catch-all route for 404
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.path !== from.path || !savedPosition) {
      return { top: 0, behavior: 'smooth' }
    }
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if the route is authenticated and user is not authenticated
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  }
  // Redirect authenticated users away from login
  else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  }
  // Proceed with navigation
  else {
    next()
  }
})

export default router