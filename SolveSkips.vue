<template>
  <div class="solve-skips-page-wrapper">
    <div v-if="loading" class="loading-message">Looking for a task...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <router-view v-else></router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from './src/api/axios'

const router = useRouter()
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const response = await api.get('/task/random', {
      params: { type: 'skips' }
    })
    const alias = response.data.taskAlias
    if (alias) {
      router.push(`/task/${alias}`)
    } else {
      throw new Error('No alias received from server')
    }
  } catch (err) {
    console.error('Error fetching task:', err)
    if (err.response) {
      switch (err.response.status) {
        case 400:
          error.value = 'Invalid task type'
          break
        case 404:
          error.value = 'No public tasks found for skips'
          break
        case 500:
          error.value = 'Internal server error'
          break
        default:
          error.value = 'An unexpected error occurred'
      }
    } else {
      error.value = 'Network error'
    }
    loading.value = false
  }
})
</script>

<style scoped>
.solve-skips-page-wrapper {
  max-width: 1437px;
  margin: 40px auto;
  padding: 20px;
  font-family: var(--default-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif);
  position: relative;
  background: #ffffff;
  min-height: 70vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-message {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  color: #6f6a6a;
  margin-top: 50px;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { color: #6f6a6a; }
  50% { color: #b0b0b0; }
}

.error-message {
  text-align: center;
  font-size: 1.2em;
  color: #e54646;
  margin-top: 20px;
}
</style>