// src/api/axios.js
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
    baseURL: 'https://api.codular.ru/api/v1',
    withCredentials: true
})

// Интерцептор для добавления access token к каждому запросу
api.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`
    }
    return config
})

// Интерцептор для обработки 401 ошибки и попытки обновления токена
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const authStore = useAuthStore()

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Пытаемся обновить токен
                await authStore.refreshToken()
                // Повторяем оригинальный запрос с новым токеном
                return api(originalRequest)
            } catch (refreshError) {
                // Если refresh тоже вернул 401 - разлогиниваем пользователя
                if (refreshError.response?.status === 401) {
                    await authStore.logout()
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api