<template>
  <div class="login-page-wrapper">
    <div class="login-form-card">
      <h2 class="form-title">{{ isLogin ? 'Log In' : 'Register' }}</h2>
      <form @submit.prevent="handleSubmit" class="form-content-wrapper">
        <div class="input-group">
          <div class="icon-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <input v-model="email" type="email" required placeholder="Email" class="form-input" />
        </div>
        <div class="input-group">
          <div class="icon-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.31-8H8.69V6c0-1.81 1.47-3.26 3.29-3.26S15.29 4.19 15.29 6v1z"/>
            </svg>
          </div>
          <input v-model="password" type="password" required placeholder="Password" class="form-input" />
        </div>
        <div v-if="!isLogin" class="input-group">
          <div class="icon-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.31-8H8.69V6c0-1.81 1.47-3.26 3.29-3.26S15.29 4.19 15.29 6v1z"/>
            </svg>
          </div>
          <input v-model="confirmPassword" type="password" required placeholder="Confirm Password" class="form-input" />
        </div>

        <button
          type="submit"
          class="submit-button"
          :class="{ 'submit-button-loading': isLoading }"
          :disabled="isLoading"
        >
          <div v-if="isLoading" class="spinner"></div>
          {{ isLogin ? 'Log In' : 'Register' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <p class="toggle-form-text">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <a href="#" @click.prevent="toggleForm" class="toggle-form-link">
          {{ isLogin ? 'Register' : 'Log In' }}
        </a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const isLogin = ref(true)
const isLoading = ref(false)

const toggleForm = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  router.push({ query: { register: isLogin.value ? undefined : 'true' } })
}

const setModeFromQuery = () => {
  isLogin.value = !(route.query.register === 'true')
  error.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

onMounted(() => {
  setModeFromQuery()
})

watch(
  () => route.query.register,
  () => {
    setModeFromQuery()
  }
)

const handleSubmit = async () => {
  error.value = ''
  isLoading.value = true

  try {
    if (isLogin.value) {
      await authStore.login({ email: email.value, password: password.value })
      // Если логин успешен, перенаправляем.
      // Важно: если перенаправление происходит через window.location.href,
      // то дальнейший код в try не выполнится.
      window.location.href = '/' // Перенаправление на главную после логина
    } else {
      if (password.value !== confirmPassword.value) {
        error.value = 'Пароли не совпадают'
        return
      }
      await authStore.register({ email: email.value, password: password.value })
      window.location.href = '/' // Перенаправление на главную после регистрации
    }
  } catch (err) {
    console.error('Ошибка аутентификации:', err)
    if (err.response) {
      const statusCode = err.response.status
      const serverMessage = err.response.data?.message || 'Неизвестная ошибка сервера.'

      if (statusCode === 400) {
        // Ошибка валидации данных (например, неверный формат email, короткий пароль)
        error.value = 'Ошибка данных: Проверьте правильность email и убедитесь, что пароль не менее 8 символов.'
      } else if (statusCode === 401 && isLogin.value) {
        // 401 для логина: неверные учетные данные
        error.value = 'Неверный email или пароль.'
      } else if (statusCode === 401 && !isLogin.value) {
        // 401 для регистрации: возможно, уже существует пользователь, или другая ошибка авторизации
        error.value = 'Ошибка регистрации: Возможно, пользователь с таким email уже существует или другая проблема с аутентификацией.'
      }
      else if (statusCode === 500) {
        error.value = 'Сервер временно недоступен. Пожалуйста, попробуйте позже.'
      } else {
        error.value = `Неизвестная ошибка (${statusCode}): ${serverMessage}. Пожалуйста, попробуйте позже или сообщите нам.`
      }
    } else if (err.request) {
      error.value = 'Нет соединения с сервером. Проверьте ваше интернет-соединение.'
    } else {
      error.value = 'Произошла неизвестная ошибка. Пожалуйста, попробуйте позже или сообщите нам.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Стили остаются без изменений, как в предыдущем ответе */

:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, 'Helvetica Neue', Helvetica, Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
}

.login-page-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
  box-sizing: border-box;
}

.login-form-card {
  background-color: #ffffff;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
  text-align: center;
}

.form-title {
  font-family: Friska, var(--default-font-family);
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

.form-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.icon-wrapper {
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.input-icon {
  width: 24px;
  height: 24px;
  color: #666;
}

.form-input {
  width: 100%;
  padding: 12px 12px 12px 50px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--default-font-family);
  font-size: 16px;
  color: #333;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.form-input::placeholder {
  color: #a0a0a0;
}

.form-input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.submit-button {
  width: 100%;
  padding: 15px;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: Friska, var(--default-font-family);
  font-size: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.submit-button:hover:not(:disabled) {
  background-color: #3e38c2;
}

.submit-button-loading {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: #4f46e5;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  font-family: var(--default-font-family);
  font-size: 14px;
  margin-top: 15px;
  text-align: center;
}

.toggle-form-text {
  font-family: var(--default-font-family);
  font-size: 15px;
  color: #666;
  margin-top: 25px;
}

.toggle-form-link {
  color: #4f46e5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.toggle-form-link:hover {
  text-decoration: underline;
}
</style>