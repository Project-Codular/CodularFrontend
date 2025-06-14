import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from '../app.vue'
import router from './api/router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)

const authStore = useAuthStore()
authStore.initialize() // Инициализация состояния авторизации

app.mount('#app')