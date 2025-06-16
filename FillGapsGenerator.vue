<template>
  <div class="main-container">
    <div class="content-wrapper" :class="{ 'fade-out': isGenerating }">
      <div class="controls-row">
        <div class="control-group">
          <label for="gapsNumber" class="label-text">Number of Gaps</label>
          <input type="number" id="gapsNumber" v-model.number="gapsNumber" class="input-field" min="1" />
        </div>
        <div class="control-group">
          <label for="language" class="label-text">Language</label>
          <select id="language" v-model="selectedLanguage" class="select-field">
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="Csharp">C#</option>
            <option value="Cpp">C++</option>
          </select>
        </div>
        <div class="control-group">
          <label for="themeToggle" class="label-text">Theme</label>
          <label class="switch">
            <input type="checkbox" id="themeToggle" v-model="isDarkTheme" />
            <span class="slider"></span>
          </label>
        </div>
        <button class="generate-button" @click="generateGaps" :disabled="isLoading">
          <span v-if="!isLoading">Generate</span>
          <span v-else class="spinner"></span>
        </button>
      </div>

      <div class="code-editors-wrapper">
        <div class="editor-container">
          <label class="editor-label">Source Code</label>
          <textarea ref="editorEl" class="code-mirror-textarea"></textarea>
        </div>
        <div class="editor-container">
          <label class="editor-label">Result</label>
          <textarea ref="resultEditorEl" class="code-mirror-textarea"></textarea>
        </div>
      </div>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
    <div v-if="isGenerating" class="generating-overlay">
      <span class="generating-text">Generating...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from './src/stores/auth'
import { useTaskStore } from './src/stores/task'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const taskStore = useTaskStore()

const gapsNumber = ref(1)
const selectedLanguage = ref('JavaScript')
const editorEl = ref(null)
const resultEditorEl = ref(null)
const error = ref('')
const isLoading = ref(false)
const isGenerating = ref(false)
const isDarkTheme = ref(false)

let editorInstance = null
let resultEditorInstance = null

const loadCodeMirror = async () => {
  if (window.CodeMirror) return

  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js'),
    loadLink('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css'),
    loadLink('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/dracula.min.css')
  ]);

  await Promise.all([
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/javascript/javascript.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/python/python.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/clike/clike.min.js')
  ]);
};

const initializeCodeMirror = () => {
  if (editorEl.value && window.CodeMirror) {
    if (editorInstance) {
      editorInstance.toTextArea();
      editorInstance = null;
    }
    editorInstance = window.CodeMirror.fromTextArea(editorEl.value, {
      lineNumbers: true,
      mode: selectedLanguage.value.toLowerCase(),
      theme: isDarkTheme.value ? 'dracula' : 'default',
      indentUnit: 4,
      tabSize: 4,
    })
    editorInstance.setValue('function greet(name) {\n  console.log("Hello, " + name + "!");\n}')
  }

  if (resultEditorEl.value && window.CodeMirror) {
    if (resultEditorInstance) {
      resultEditorInstance.toTextArea();
      resultEditorInstance = null;
    }
    resultEditorInstance = window.CodeMirror.fromTextArea(resultEditorEl.value, {
      lineNumbers: true,
      mode: selectedLanguage.value.toLowerCase(),
      theme: isDarkTheme.value ? 'dracula' : 'default',
      readOnly: true,
      indentUnit: 4,
      tabSize: 4,
    })
  }
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const loadLink = (href) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
};

onMounted(async () => {
  await loadCodeMirror();
  initializeCodeMirror();
});

watch(() => route.path, async (newPath) => {
  if (newPath === '/fill-gaps') {
    await loadCodeMirror();
    initializeCodeMirror();
  }
});

watch(isDarkTheme, () => {
  if (editorInstance) {
    editorInstance.setOption('theme', isDarkTheme.value ? 'dracula' : 'default');
  }
  if (resultEditorInstance) {
    resultEditorInstance.setOption('theme', isDarkTheme.value ? 'dracula' : 'default');
  }
});

watch(selectedLanguage, () => {
  if (editorInstance) {
    editorInstance.setOption('mode', selectedLanguage.value.toLowerCase());
  }
  if (resultEditorInstance) {
    resultEditorInstance.setOption('mode', selectedLanguage.value.toLowerCase());
  }
});

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.toTextArea();
  }
  if (resultEditorInstance) {
    resultEditorInstance.toTextArea();
  }
});

const generateGaps = async () => {
  error.value = '';
  isLoading.value = true;
  isGenerating.value = true;

  const sourceCode = editorInstance ? editorInstance.getValue() : '';

  const requestData = {
    programmingLanguage: selectedLanguage.value,
    skipsNumber: gapsNumber.value,
    sourceCode: sourceCode,
  };

  try {
    const response = await fetch('https://api.codular.ru/api/v1/skips/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authStore.accessToken && { Authorization: `Bearer ${authStore.accessToken}` }),
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result = await response.json();

    if (result.taskAlias) {
      const taskAlias = result.taskAlias;
      let attempts = 0;
      const maxAttempts = 30;

      const checkInterval = setInterval(async () => {
        try {
          attempts++;
          const statusResponse = await fetch(`https://api.codular.ru/api/v1/task-status/${taskAlias}`, {
            headers: {
              'Authorization': `Bearer ${authStore.accessToken}`
            }
          });

          if (!statusResponse.ok) throw new Error('Status check failed');

          const statusData = await statusResponse.json();

          if (statusResponse.status === 200 && statusData.status === 'Done') {
            clearInterval(checkInterval);
            resultEditorInstance.setValue(JSON.stringify(statusData, null, 2));
            taskStore.setTaskAlias(taskAlias);
            await navigateTo(`task/${taskAlias}`);
          } else if (statusData.status === 'Failed' || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            error.value = statusData.message || 'Task processing failed or timed out';
            isGenerating.value = false;
            isLoading.value = false;
          }
        } catch (err) {
          console.error('Polling error:', err);
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            error.value = 'Failed to check task status';
            isGenerating.value = false;
            isLoading.value = false;
          }
        }
      }, 2000);

      onBeforeUnmount(() => {
        clearInterval(checkInterval);
      });
    } else if (resultEditorInstance) {
      resultEditorInstance.setValue(JSON.stringify(result, null, 2));
      isGenerating.value = false;
      isLoading.value = false;
    }
  } catch (err) {
    console.error('Ошибка:', err);
    error.value = `Generation error: ${err.message}`;
    if (resultEditorInstance) {
      resultEditorInstance.setValue(`Error: ${err.message}`);
    }
    isGenerating.value = false;
    isLoading.value = false;
  }
};

const navigateTo = (path) => {
  if (route.path !== path || path === '/') {
    router.push(path)
  }
};

const navigateToLogin = () => {
  if (!(route.path === '/login' && !route.query.register)) {
    router.push('/login')
  }
};

const navigateToRegister = () => {
  if (!(route.path === '/login' && route.query.register === 'true')) {
    router.push({ path: '/login', query: { register: 'true' } })
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400&display=swap');

:root {
  --default-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Ubuntu, 'Helvetica Neue', Helvetica, Arial, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft Yahei UI', 'Microsoft Yahei',
    'Source Han Sans CN', sans-serif;
}

.main-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f0f2f5;
  position: relative;
}

.content-wrapper {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  max-width: 1600px;
  margin: 0 auto;
  transition: opacity 0.5s ease;
}

.content-wrapper.fade-out {
  opacity: 0;
}

.generating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 1000;
}

.generating-text {
  font-family: Friska, var(--default-font-family);
  font-size: 32px;
  font-weight: 600;
  color: #6f6a6a;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { color: #6f6a6a; }
  50% { color: #b0b0b0; }
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
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
}

.input-field,
.select-field {
  padding: 10px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--default-font-family);
  font-size: 16px;
  color: #333;
  width: 200px;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.input-field:focus,
.select-field:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
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

input:checked + .slider {
  background-color: #4f46e5;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.generate-button {
  padding: 12px 25px;
  background-color: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: Friska, var(--default-font-family);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, opacity 0.3s ease;
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.generate-button:hover:not(:disabled) {
  background-color: #3e38c2;
}

.generate-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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

.code-editors-wrapper {
  display: flex;
  gap: 30px;
  width: 100%;
  max-width: 1600px;
  margin-top: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.editor-container {
  flex: 1;
  min-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.editor-label {
  font-family: Friska, var(--default-font-family);
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
  text-align: center;
}

.code-mirror-textarea {
  width: 100%;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  resize: vertical;
}

.CodeMirror {
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  height: 400px;
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
}

.CodeMirror-scroll {
  max-height: 400px;
  border-radius: 12px;
}

.error-message {
  color: #ef4444;
  font-family: var(--default-font-family);
  font-size: 16px;
  margin-top: 25px;
  text-align: center;
  width: 100%;
}

@media (max-width: 768px) {
  .controls-row {
    flex-direction: column;
    gap: 20px;
  }

  .input-field,
  .select-field {
    width: 100%;
    max-width: 300px;
  }

  .code-editors-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .editor-container {
    min-width: unset;
    width: 100%;
    padding: 15px;
  }

  .CodeMirror {
    height: 300px;
  }

  .generating-text {
    font-size: 24px;
  }
}
</style>