<template>
  <div class="task-page-wrapper">
    <div v-if="loading" class="loading-message">Loading task...</div>
    <div v-else-if="taskData.error" class="error-message">
      Error loading task: {{ taskData.error }}
    </div>
    <div v-else class="task-content">
      <div class="controls-row">
        <div class="control-group">
          <label for="themeToggle" class="label-text">Theme: {{ isDarkTheme ? 'Dark' : 'Light' }}</label>
          <label class="switch">
            <input type="checkbox" id="themeToggle" v-model="isDarkTheme" />
            <span class="theme-slider" :class="{ 'dark-theme': isDarkTheme }"></span>
          </label>
        </div>
        <div v-if="taskData.canEdit" class="control-group">
          <button class="setup-button" @click="showModal = true">
            Setup task <span class="gear-icon">⚙️</span>
          </button>
        </div>
      </div>
      <h2 class="task-description">{{ taskData.description }}</h2>

      <div v-if="taskType" class="task-type-label">{{ taskType === 'skips' ? 'Fill in the gaps (___) task' : 'Remove noises task' }}</div>

      <div class="code-and-inputs-container">
        <div class="code-section">
          <h3>Code to Solve:</h3>
          <div ref="codeMirrorContainer" class="codemirror-wrapper">
            <textarea ref="codeMirrorTextarea"></textarea>
          </div>
        </div>

        <div class="answers-section">
          <h3 v-if="taskType === 'skips'">Your Answers:</h3>
          <h3 v-else-if="taskType === 'noises'">Submission Results:</h3>
          
          <!-- Skips task interface -->
          <div v-if="taskType === 'skips'">
            <div v-if="inputCount === 0" class="no-inputs-message">
              No gaps to fill in this problem.
            </div>
            <div v-else class="inputs-grid">
              <div
                v-for="index in inputCount"
                :key="index"
                class="input-wrapper"
              >
                <label :for="`answer-${index}`">Gap {{ index }}:</label>
                <textarea
                  :id="`answer-${index}`"
                  v-model="userAnswers[index - 1]"
                  class="answer-input"
                  :placeholder="`Enter your answer for gap ${index}`"
                  rows="2"
                  style="font-size: 20px;"
                ></textarea>
              </div>
            </div>
            <div v-if="submissionResult.hints.length" class="hints">
              <h4>Hints:</h4>
              <ul>
                <li v-for="(hint, index) in submissionResult.hints" :key="index">{{ hint }}</li>
              </ul>
            </div>
            <div v-if="submissionResult.message" class="result-message">
              {{ submissionResult.message }}
            </div>
          </div>

          <!-- Noises task interface -->
          <div v-else-if="taskType === 'noises'">
            <div v-if="submissionResult.score === -1 && submissionResult.hints.length === 0" class="no-submissions-message">
              No submissions yet. Make your first one!
            </div>
            <div v-else class="submission-result">
              <p class="score">Score: {{ submissionResult.score }}</p>
              <div v-if="submissionResult.hints.length" class="hints">
                <h4>Hints:</h4>
                <ul>
                  <li v-for="(hint, index) in submissionResult.hints" :key="index">{{ hint }}</li>
                </ul>
              </div>
              <div v-if="submissionResult.message" class="result-message">
                {{ submissionResult.message }}
              </div>
            </div>
          </div>

          <button
            class="submit-button"
            :class="{ 'inactive': isSubmitting }"
            :disabled="isSubmitting"
            @click="submitAnswers"
          >
            <span v-if="isSubmitting" class="spinner"></span>
            <span>{{ isSubmitting ? 'Checking...' : 'Submit' }}</span>
          </button>
          <div v-if="submissionError" class="error-message">
            {{ submissionError }}
          </div>
        </div>
      </div>

      <!-- Modal for Setup Task -->
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-content">
          <span class="close-modal" @click="showModal = false">×</span>
          <h3>Task Settings</h3>
          <div class="control-group">
            <label for="publicToggle" class="label-text">Task: {{ isPublic ? 'Public' : 'Private' }}</label>
            <label class="switch">
              <input type="checkbox" id="publicToggle" v-model="isPublic" @change="togglePublic" />
              <span class="slider" :class="{ 'public-theme': isPublic }"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notification -->
      <div v-if="notification" class="notification">{{ notification }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../api/axios'

const route = useRoute()
const router = useRouter()
const taskData = ref({})
const loading = ref(true)
const userAnswers = ref([])
const codeMirrorContainer = ref(null)
const codeMirrorTextarea = ref(null)
const isSubmitting = ref(false)
const submissionError = ref(null)
const submissionResult = ref({ score: -1, hints: [], message: '' })
const isDarkTheme = ref(false)
const isPublic = ref(false)
const showModal = ref(false)
const notification = ref(null)
let editorInstance = null

const taskType = computed(() => taskData.value.taskType || '')
const inputCount = computed(() => {
  if (taskData.value && taskData.value.codeToSolve && taskType.value === 'skips') {
    return (taskData.value.codeToSolve.match(/\uD83D\uDD11/g) || []).length
  }
  return 0
})
const modifiedCode = computed(() => {
  if (taskData.value && taskData.value.codeToSolve && taskType.value === 'skips') {
    return taskData.value.codeToSolve.replace(/\uD83D\uDD11/g, '___')
  }
  return taskData.value.codeToSolve || ''
})

const getMode = (language) => {
  switch (language?.toLowerCase()) {
    case 'python':
      return 'python'
    case 'java':
    case 'cpp':
      return 'text/x-c++src'
    default:
      console.warn(`No mode for language ${language}`)
      return 'text/plain'
  }
}

const loadCodeMirror = async () => {
  if (window.CodeMirror) return
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js'),
    loadLink('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css'),
    loadLink('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/dracula.min.css')
  ])
  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clike/clike.min.js')
  ])
}

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const loadLink = (href) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.onload = resolve
    link.onerror = reject
    document.head.appendChild(link)
  })
}

const fetchTask = async (alias) => {
  console.log('fetchTask: Starting for alias:', alias)
  loading.value = true
  submissionError.value = null
  submissionResult.value = { score: -1, hints: [], message: '' }
  if (editorInstance) {
    console.log('fetchTask: Destroying existing CodeMirror instance.')
    editorInstance.toTextArea()
    editorInstance = null
  }

  try {
    const response = await api.get(`/task/${alias}`)
    taskData.value = response.data
    isPublic.value = taskData.value.isPublic || false
    console.log('fetchTask: Task data received:', taskData.value)
    if (taskType.value === 'skips') {
      userAnswers.value = Array(inputCount.value).fill('')
    }
  } catch (err) {
    console.error('fetchTask: Error fetching task:', err)
    if (err.response && err.response.status === 404) {
      router.push('/NotFound') // Redirect to 404 page on 404 from server
    } else {
      taskData.value = { error: err.message } // Fallback for other errors
    }
  } finally {
    loading.value = false
    console.log('fetchTask: Loading finished.')
  }
}

const initializeCodeMirror = async () => {
  console.log('initializeCodeMirror: Attempting initialization.')
  console.log('initializeCodeMirror: codeMirrorTextarea.value:', codeMirrorTextarea.value)
  console.log('initializeCodeMirror: modifiedCode.value:', modifiedCode.value)

  await loadCodeMirror()

  if (codeMirrorTextarea.value && taskData.value && modifiedCode.value && window.CodeMirror) {
    if (editorInstance) {
      console.log('initializeCodeMirror: Destroying old editor.')
      editorInstance.toTextArea()
      editorInstance = null
    }

    editorInstance = window.CodeMirror.fromTextArea(codeMirrorTextarea.value, {
      lineNumbers: true,
      mode: getMode(taskData.value.programmingLang),
      theme: isDarkTheme.value ? 'dracula' : 'default',
      readOnly: taskType.value === 'skips',
      indentUnit: 4,
      tabSize: 4,
      lineWrapping: true
    })
    editorInstance.setValue(modifiedCode.value)
    console.log('initializeCodeMirror: CodeMirror initialized successfully!')
  } else {
    console.log('initializeCodeMirror: Conditions not met for initialization.')
  }
}

const submitAnswers = async () => {
  console.log('submitAnswers: Starting submission.')
  isSubmitting.value = true
  submissionError.value = null
  submissionResult.value = { score: -1, hints: [], message: '' }

  const taskAlias = route.params.id
  let endpoint, payload

  try {
    if (taskType.value === 'skips') {
      endpoint = '/skips/solve'
      payload = {
        answers: userAnswers.value,
        taskAlias
      }
    } else if (taskType.value === 'noises') {
      endpoint = '/noises/solve'
      payload = {
        answer: editorInstance.getValue(),
        taskAlias
      }
    } else {
      throw new Error('Unknown task type')
    }

    console.log('submitAnswers: Sending request to', endpoint, 'with payload:', payload)
    const response = await api.post(endpoint, payload)
    console.log('submitAnswers: Response received:', response.data)

    const { submissionId } = response.data
    if (!submissionId) {
      throw new Error('No submission ID received')
    }

    let attempts = 0
    const maxAttempts = 30
    const checkInterval = setInterval(async () => {
      try {
        attempts++
        console.log('Polling submission status for ID:', submissionId, 'Attempt:', attempts)
        const statusResponse = await api.get(`/submission-status/${submissionId}`)
        const statusData = statusResponse.data
        console.log('Polling response:', statusData)

        if (statusData.isCorrect === 'Pending') {
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            submissionError.value = 'Submission check timed out'
            isSubmitting.value = false
          }
        } else {
          clearInterval(checkInterval)
          submissionResult.value = {
            score: statusData.score,
            hints: statusData.hints || [],
            message: statusData.score === 100 ? 'Task solved correctly! Score: 100' : `Task not solved correctly. Score: ${statusData.score}`
          }
          isSubmitting.value = false
        }
      } catch (err) {
        console.error('Polling error:', err)
        if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          submissionError.value = 'Failed to check submission status'
          isSubmitting.value = false
        }
      }
    }, 2000)

    onMounted(() => {
      return () => clearInterval(checkInterval)
    })
  } catch (err) {
    console.error('submitAnswers: Error:', err)
    submissionError.value = `Submission error: ${err.message}`
    isSubmitting.value = false
  }
}

const togglePublic = async () => {
  const taskAlias = route.params.id
  try {
    const response = await api.patch(`/task/${taskAlias}/set-access`, { public: isPublic.value })
    console.log('togglePublic: Response received:', response.data)
    notification.value = 'Task updated successfully'
    setTimeout(() => {
      notification.value = null
    }, 3000)
  } catch (err) {
    const status = err.response?.status || 500
    let message = 'An error occurred'
    if (status === 403) message = 'No permission to edit task'
    else if (status === 404) message = 'Task not found'
    else if (status === 500) message = 'Server error'
    notification.value = message
    setTimeout(() => {
      notification.value = null
    }, 3000)
    isPublic.value = !isPublic.value // Revert the change on error
  }
}

onMounted(async () => {
  console.log('onMounted: Component mounted.')
  if (route.params.id) {
    await fetchTask(route.params.id)
    await initializeCodeMirror()
  }
})

watch(() => taskData.value?.codeToSolve, (newCode) => {
  console.log('Watcher (taskData.value?.codeToSolve): Detected change. New code:', newCode)
  if (newCode !== undefined && newCode !== null) {
    nextTick(() => {
      initializeCodeMirror()
    })
  }
}, { immediate: false })

watch(() => route.params.id, (newId) => {
  console.log('Watcher (ID): Detected change. New ID:', newId)
  if (newId) {
    fetchTask(newId)
  }
})

watch(isDarkTheme, () => {
  if (editorInstance) {
    editorInstance.setOption('theme', isDarkTheme.value ? 'dracula' : 'default')
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap');

:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Arial,
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
  --primary-purple: #4f46e5;
  --text-gray: #6f6a6a;
  --white: #ffffff;
  --border-radius-lg: 15px;
}

.task-page-wrapper {
  max-width: 1437px;
  margin: 40px auto;
  padding: 20px;
  font-family: var(--default-font-family);
  position: relative;
}

.controls-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  gap: 20px;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  white-space: nowrap;
}

.label-text {
  font-family: Friska, var(--default-font-family);
  font-size: 18px;
  font-weight: 500;
  color: #333;
  width: 120px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.theme-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.theme-slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.theme-slider:after {
  position: absolute;
  content: "☀️";
  font-size: 20px;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #000;
  line-height: 34px;
}

.theme-slider.dark-theme:after {
  content: "🌙";
  left: 10px;
  right: auto;
  color: #fff;
  line-height: 34px;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

.slider:after {
  position: absolute;
  content: "🔒";
  font-size: 20px;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #000;
  line-height: 34px;
}

.slider.public-theme:after {
  content: "🌐";
  left: 10px;
  right: auto;
  color: #fff;
  line-height: 34px;
}

.slider:not(.public-theme):after {
  content: "🔒";
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #000;
  line-height: 34px;
}

input:checked + .theme-slider {
  background-color: #4f46e5;
}

input:checked + .theme-slider:before {
  transform: translateX(46px);
}

input:checked + .slider {
  background-color: #4f46e5;
}

input:checked + .slider:before {
  transform: translateX(46px);
}

.setup-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 15px;
  font-family: Friska, var(--default-font-family);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.setup-button:hover {
  background-color: #3e38c2;
}

.gear-icon {
  margin-left: 8px;
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

.error-message,
.no-inputs-message,
.no-submissions-message {
  text-align: center;
  font-size: 1.2em;
  color: var(--text-gray);
  margin-top: 20px;
}

.error-message {
  color: #e54646;
}

.task-type-label {
  font-size: 1.5em;
  color: var(--text-gray);
  text-align: center;
  margin-bottom: 10px;
  font-weight: normal;
}
.task-type-label span.underline-placeholder {
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
}

.task-description {
  font-size: 2em;
  font-weight: 700;
  color: var(--primary-purple);
  margin-bottom: 30px;
  text-align: center;
}

.code-and-inputs-container {
  display: flex;
  gap: 40px;
  margin-top: 30px;
}

.code-section,
.answers-section {
  flex: 1;
  background: var(--white);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.code-section h3,
.answers-section h3 {
  font-size: 1.5em;
  font-weight: 600;
  color: var(--primary-purple);
  margin-bottom: 20px;
}

.codemirror-wrapper {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.codemirror-wrapper :deep(.CodeMirror) {
  font-size: 1.38em !important; /* Reduced by ~2px from 1.4em */
  height: 400px;
  border-radius: 8px;
  font-family: 'Roboto Mono', monospace;
}
.codemirror-wrapper :deep(.CodeMirror span.cm-___) {
  font-family: 'Roboto Mono', monospace;
  font-weight: bold;
}

.CodeMirror-scroll {
  max-height: 400px;
  border-radius: 8px;
}

.CodeMirror {
  height: 400px;
}

.inputs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
}

.input-wrapper label {
  font-size: 0.9em;
  color: var(--text-gray);
  margin-bottom: 5px;
}

.answer-input {
  padding: 12px 15px;
  border: 1px solid #d0d0d0;
  border-radius: 8px;
  font-size: 1em;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  resize: vertical;
  min-height: 80px;
}

.answer-input:focus {
  outline: none;
  border-color: var(--primary-purple);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 200px;
  padding: 15px 25px;
  margin: 30px auto 0;
  background: #3e38c2;
  color: #ffffff;
  border: none;
  border-radius: 15px;
  font-size: 1.2em;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease, opacity 0.3s ease;
  gap: 10px;
}

.submit-button:hover:not(.inactive) {
  transform: scale(1.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.submit-button:active:not(.inactive),
.submit-button:focus:not(.inactive) {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.4);
}

.submit-button.inactive {
  background-color: #d0d0d0;
  cursor: not-allowed;
  opacity: 0.7;
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

.submission-result {
  margin-top: 20px;
  text-align: center;
}

.score {
  font-size: 1.2em;
  font-weight: 600;
  color: var(--primary-purple);
}

.hints {
  margin-top: 10px;
  text-align: left;
}

.hints h4 {
  font-size: 1.1em;
  color: var(--text-gray);
  margin-bottom: 10px;
}

.hints ul {
  list-style-type: disc;
  padding-left: 20px;
}

.hints li {
  font-size: 1em;
  color: var(--text-gray);
  margin-bottom: 5px;
}

.result-message {
  margin-top: 10px;
  font-size: 1.1em;
  color: var(--primary-purple);
  text-align: center;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #ffffff;
  padding: 20px;
  border-radius: var(--border-radius-lg);
  position: relative;
  width: 400px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #333;
  color: #fff;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1100;
  animation: fadeInOut 3s ease-in-out forwards;
}

@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; }
}

@media (max-width: 768px) {
  .code-and-inputs-container {
    flex-direction: column;
  }

  .controls-row {
    justify-content: center;
  }

  .switch {
    width: 60px;
  }

  .theme-slider:after {
    font-size: 16px;
  }

  .theme-slider.dark-theme:after {
    font-size: 16px;
  }

  .slider:after {
    font-size: 16px;
  }

  .slider.public-theme:after {
    font-size: 16px;
  }

  .input-wrapper textarea {
    height: 80px;
  }

  input:checked + .theme-slider:before {
    transform: translateX(26px);
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }

  .label-text {
    width: 100px;
  }

  .loading-message {
    font-size: 24px;
  }

  .modal-content {
    width: 90%;
  }
}
</style>