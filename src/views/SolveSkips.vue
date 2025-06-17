<template>
  <div class="solve-skips-page-wrapper">
    <div v-if="loading" class="loading-message">Looking for tasks...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else class="content-container">
      <h2 class="section-header">Available Skips Tasks</h2>
      <div class="tasks-list">
        <div v-for="(task, index) in tasks" :key="task.alias" class="task-item" @click="navigateToTask(task.alias)">
          <span class="task-index">{{ index + 1 }}</span>
          <span class="task-language">{{ task.programming_language }}</span>
          <span class="task-description">{{ task.description }}</span>
        </div>
      </div>
      <button v-if="hasMore" class="load-more-button" @click="loadMoreTasks" :disabled="loadingMore">
        <span v-if="!loadingMore">Load more</span>
        <span v-else class="spinner"></span>
      </button>
      <button class="random-task-button" @click="getRandomTask" :disabled="loadingRandom">
        <span class="dice-icon">🎲</span> Get random task
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const offset = ref(0)
const limit = ref(10)
const hasMore = ref(true)
const loadingMore = ref(false)
const loadingRandom = ref(false)

const loadTasks = async () => {
  loading.value = true
  try {
    const response = await api.get('/tasks', {
      params: {
        type: 'skips',
        offset: offset.value,
        limit: limit.value
      }
    })
    const data = response.data
    if (data.responseInfo.status === 'OK') {
      tasks.value = offset.value === 0 ? data.tasks : [...tasks.value, ...data.tasks]
      hasMore.value = data.tasks.length === limit.value
      offset.value += data.tasks.length
    } else {
      throw new Error('Invalid response status')
    }
  } catch (err) {
    console.error('Error fetching tasks:', err)
    if (err.response) {
      switch (err.response.status) {
        case 400:
          error.value = 'Invalid query parameters'
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
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreTasks = async () => {
  if (!loadingMore.value && hasMore.value) {
    loadingMore.value = true
    await loadTasks()
  }
}

const getRandomTask = async () => {
  loadingRandom.value = true
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
    console.error('Error fetching random task:', err)
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
  } finally {
    loadingRandom.value = false
  }
}

const navigateToTask = (alias) => {
  router.push(`/task/${alias}`)
}

onMounted(loadTasks)
</script>

<style scoped>
.solve-skips-page-wrapper {
  width: 90%;
  max-width: 1437px;
  margin: clamp(1rem, 2.5vw, 2.5rem) auto;
  padding: clamp(0.625rem, 1.25vw, 1.25rem);
  font-family: Friska, var(--default-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial, sans-serif);
  position: relative;
  background: #ffffff;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-message {
  text-align: center;
  font-size: clamp(1.5rem, 2vw, 2rem);
  font-weight: 600;
  color: #6f6a6a;
  margin-top: clamp(1.25rem, 3vw, 3.125rem);
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { color: #6f6a6a; }
  50% { color: #b0b0b0; }
}

.error-message {
  text-align: center;
  font-size: clamp(1rem, 1.5vw, 1.2em);
  color: #e54646;
  margin-top: clamp(0.625rem, 1.25vw, 1.25rem);
}

.content-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.section-header {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: clamp(0.625rem, 1.25vw, 1.25rem);
  text-align: center;
}

.tasks-list {
  width: 100%;
  max-width: clamp(20rem, 50vw, 50rem);
}

.task-item {
  display: flex;
  justify-content: space-between;
  padding: clamp(0.625rem, 1vw, 0.9375rem) clamp(0.625rem, 1.25vw, 1.25rem);
  margin-bottom: clamp(0.3125rem, 0.625vw, 0.625rem);
  background: #f9f9f9;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.task-item:hover {
  background-color: #f0f0f0;
}

.task-index, .task-language, .task-description {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(0.9rem, 1.5vw, 1.125rem);
  color: #333;
}

.task-index {
  font-weight: 600;
  width: clamp(1.25rem, 3vw, 3.125rem);
}

.task-language {
  width: clamp(3rem, 6vw, 6.25rem);
  text-align: center;
}

.task-description {
  flex-grow: 1;
  margin-left: clamp(0.625rem, 1.25vw, 1.25rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.load-more-button, .random-task-button {
  padding: clamp(0.5rem, 1vw, 0.75rem) clamp(1rem, 2vw, 1.5625rem);
  margin-top: clamp(0.625rem, 1.25vw, 1.25rem);
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 0.625rem;
  font-family: Friska, var(--default-font-family);
  font-size: clamp(0.9rem, 1.5vw, 1.125rem);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  gap: clamp(0.3125rem, 0.625vw, 0.625rem);
}

.load-more-button:hover:not(:disabled), .random-task-button:hover:not(:disabled) {
  background-color: #3e38c2;
}

.load-more-button:disabled, .random-task-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  width: clamp(0.625rem, 1.25vw, 1.25rem);
  height: clamp(0.625rem, 1.25vw, 1.25rem);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.dice-icon {
  font-size: clamp(0.9rem, 1.25vw, 1.25rem);
}

@media (max-width: 768px) {
  .tasks-list {
    max-width: 100%;
  }

  .task-item {
    flex-direction: column;
    align-items: flex-start;
    padding: clamp(0.5rem, 1vw, 0.9375rem);
  }

  .task-index {
    margin-bottom: 0.5rem;
  }

  .task-language {
    margin-bottom: 0.5rem;
    width: auto;
  }

  .task-description {
    margin-left: 0;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }

  .load-more-button,
  .random-task-button {
    width: 100%;
    max-width: 20rem;
    margin: clamp(0.625rem, 1vw, 1.25rem) auto;
  }
}

@media (max-width: 375px) {
  .section-header {
    font-size: clamp(1.2rem, 3vw, 1.875rem);
  }

  .task-index,
  .task-language,
  .task-description {
    font-size: clamp(0.8rem, 1.5vw, 1rem);
  }

  .load-more-button,
  .random-task-button {
    font-size: clamp(0.8rem, 1.5vw, 1rem);
  }
}
</style>