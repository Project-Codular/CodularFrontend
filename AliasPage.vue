<template>
  <div class="task-page-wrapper">
    <div v-if="loading" class="loading-message">Loading task...</div>
    <div v-else-if="error" class="error-message">
      Error loading task: {{ error }}
    </div>
    <div v-else class="task-content">
      <h2 class="task-description">{{ taskData.description }}</h2>

      <div class="code-and-inputs-container">
        <div class="code-section">
          <h3>Code to Solve:</h3>
          <div ref="codeMirrorContainer" class="codemirror-wrapper"></div>
        </div>

        <div class="answers-section">
          <h3>Your Answers:</h3>
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
                rows="4"
                style="font-size: 20px;"
              ></textarea>
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
          <div v-if="submissionResult" class="submission-result">
            <p class="score">Score: {{ submissionResult.score }}</p>
            <div v-if="submissionResult.hints.length" class="hints">
              <h4>Hints:</h4>
              <ul>
                <li v-for="(hint, index) in submissionResult.hints" :key="index">{{ hint }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import api from './src/api/axios'
import { basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { oneDark } from '@codemirror/theme-one-dark'
import { indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'

const route = useRoute()
const taskData = ref(null)
const loading = ref(true)
const error = ref(null)
const userAnswers = ref([])
const codeMirrorContainer = ref(null)
const isSubmitting = ref(false)
const submissionError = ref(null)
const submissionResult = ref(null)
let editorView = null

const inputCount = computed(() => {
  if (taskData.value && taskData.value.codeToSolve) {
    return (taskData.value.codeToSolve.match(/\uD83D\uDD11/g) || []).length
  }
  return 0
})

const getLanguageExtension = (lang) => {
  switch (lang?.toLowerCase()) {
    case 'python':
      return python()
    case 'java':
      return java()
    case 'cpp':
      return cpp()
    default:
      return []
  }
}

const fetchTask = async (alias) => {
  console.log('fetchTask: Starting for alias:', alias)
  loading.value = true
  error.value = null
  submissionError.value = null
  submissionResult.value = null
  if (editorView) {
    console.log('fetchTask: Destroying existing CodeMirror instance.')
    editorView.destroy()
    editorView = null
  }

  try {
    const response = await api.get(`/task/${alias}`)
    taskData.value = response.data
    console.log('fetchTask: Task data received:', taskData.value)
    userAnswers.value = Array(inputCount.value).fill('')
  } catch (err) {
    error.value = err.message
    console.error('fetchTask: Error fetching task:', err)
  } finally {
    loading.value = false
    console.log('fetchTask: Loading finished.')
  }
}

const initializeCodeMirror = () => {
  console.log('initializeCodeMirror: Attempting initialization.')
  console.log('initializeCodeMirror: codeMirrorContainer.value:', codeMirrorContainer.value)
  console.log('initializeCodeMirror: taskData.value?.codeToSolve:', taskData.value?.codeToSolve)

  if (codeMirrorContainer.value && taskData.value && taskData.value.codeToSolve) {
    if (editorView && editorView.dom.parentNode === codeMirrorContainer.value) {
      console.log('initializeCodeMirror: Destroying old editor in same container.')
      editorView.destroy()
    }

    const startState = EditorState.create({
      doc: taskData.value.codeToSolve,
      extensions: [
        basicSetup,
        oneDark,
        EditorView.lineWrapping,
        EditorView.editable.of(taskData.value.canEdit || false),
        keymap.of([indentWithTab]),
        getLanguageExtension(taskData.value.programmingLang)
      ],
    })

    editorView = new EditorView({
      state: startState,
      parent: codeMirrorContainer.value,
    })
    console.log('initializeCodeMirror: CodeMirror initialized successfully!')
  } else if (codeMirrorContainer.value && !taskData.value?.codeToSolve) {
    console.log('initializeCodeMirror: No codeToSolve found, ensuring editor is destroyed.')
    if (editorView) {
      editorView.destroy()
      editorView = null
    }
  } else {
    console.log('initializeCodeMirror: Conditions not met for initialization (container or data missing).')
  }
}

const submitAnswers = async () => {
  console.log('submitAnswers: Starting submission.')
  isSubmitting.value = true
  submissionError.value = null
  submissionResult.value = null

  const taskAlias = route.params.id
  const taskType = taskData.value.taskType
  let endpoint, payload

  try {
    if (taskType === 'skips') {
      endpoint = '/skips/solve'
      payload = {
        answers: userAnswers.value,
        taskAlias
      }
    } else if (taskType === 'noises') {
      endpoint = '/noises/solve'
      payload = {
        answer: 'placeholder_answer', // Placeholder as instructed
        taskAlias
      }
    } else {
      throw new Error('Unknown task type')
    }

    console.log('submitAnswers: Sending request to', endpoint, 'with payload:', payload)
    const response = await api.post(`${endpoint}`, payload)
    console.log('submitAnswers: Response received:', response.data)

    const { submissionId } = response.data
    if (!submissionId) {
      throw new Error('No submission ID received')
    }

    // Start polling submission status
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
          // Continue polling
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval)
            submissionError.value = 'Submission check timed out'
            isSubmitting.value = false
          }
        } else if (statusData.isCorrect === 'Failed') {
          clearInterval(checkInterval)
          if (statusData.responseInfo.error) {
            submissionError.value = statusData.responseInfo.error
          } else {
            submissionResult.value = {
              score: statusData.score,
              hints: statusData.hints || []
            }
          }
          isSubmitting.value = false
        } else {
          clearInterval(checkInterval)
          submissionResult.value = {
            score: statusData.score,
            hints: statusData.hints || []
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

onMounted(() => {
  console.log('onMounted: Component mounted.')
  if (route.params.id) {
    fetchTask(route.params.id)
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
</script>

<style scoped>
:root {
  --default-font-family: Friska, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, Ubuntu, 'Helvetica Neue', Helvetica, Helvetica, Arial,
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
}

.loading-message,
.error-message,
.no-inputs-message {
  text-align: center;
  font-size: 1.2em;
  color: var(--text-gray);
  margin-top: 50px;
}

.error-message {
  color: #e54646;
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

.codemirror-wrapper :deep(.cm-editor) {
  font-size: 1.4em !important;
  height: 400px;
  border-radius: 8px;
}

.cm-editor.cm-scroller {
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }
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
</style>