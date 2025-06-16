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
                rows="4"
              ></textarea>
            </div>
          </div>
          <button class="submit-button" @click="submitAnswers">Submit</button>
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

const route = useRoute()
const taskData = ref(null)
const loading = ref(true)
const error = ref(null)
const userAnswers = ref([])
const codeMirrorContainer = ref(null)
let editorView = null

const inputCount = computed(() => {
  if (taskData.value && taskData.value.codeToSolve) {
    return (taskData.value.codeToSolve.match(/\uD83D\uDD11/g) || []).length
  }
  return 0
})

const fetchTask = async (alias) => {
  console.log('fetchTask: Starting for alias:', alias)
  loading.value = true
  error.value = null
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
        EditorView.editable.of(false),
        keymap.of([indentWithTab]),
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
          editorView.destroy();
          editorView = null;
      }
  } else {
      console.log('initializeCodeMirror: Conditions not met for initialization (container or data missing).')
  }
}

const submitAnswers = () => {
  console.log('User Answers:', userAnswers.value)
  alert('Answers submitted! Check console for values.')
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
            initializeCodeMirror();
        });
    }
}, { immediate: false });

watch(
  () => route.params.id,
  (newId) => {
    console.log('Watcher (route.params.id): Detected change. New ID:', newId)
    if (newId) {
      fetchTask(newId)
    }
  }
)
</script>

<style scoped>
/*
  Важное примечание: `scoped` стили в Vue добавляют уникальный атрибут к элементам
  компонента (например, `data-v-xyz123`).
  Если CodeMirror или другие библиотеки вставляют свои элементы,
  которые не имеют этого атрибута, то `scoped` стили могут на них не распространяться.
  Для CodeMirror, его `.cm-editor` класс генерируется библиотекой, и он не будет
  иметь атрибут `data-v-xyz123`. Поэтому, чтобы стили применялись,
  мы можем либо:
  1. Создать отдельный CSS-файл для глобальных стилей CodeMirror и импортировать его.
  2. Использовать глубокий селектор (deep selector) типа `::v-deep` или `/deep/` (устарел, но может работать).
     Однако, в Composition API с `<style scoped>` и `<script setup>`,
     часто достаточно простого селектора, так как некоторые стили CodeMirror
     могут быть применены глобально через импорт `basicSetup` или других расширений.
     Проблема обычно в специфичности.
*/

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

.codemirror-wrapper >>> .cm-editor,
.codemirror-wrapper :deep(.cm-editor)
{
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

/* Изменения для кнопки Submit */
.answers-section .submit-button {
  display: block;
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
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.answers-section .submit-button:hover {
  transform: scale(1.04);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.answers-section .submit-button:active,
.answers-section .submit-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.4);
}
</style>