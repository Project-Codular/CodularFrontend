<template>
  <div class="main-content-wrapper"> <span class="main-header">Code Problem Generator</span>
    <span class="main-header-subheader"
      >Generate coding problems to test your skills and improve your coding abilities.</span
    >
    <div class="start-button-1">
      <a class="get-started" href="#generate-tasks-block" @click.prevent="navigateTo('/#generate-tasks-block')">Get started</a>
    </div>

    <!-- Generate task block -->
    <div class="generate-frame" id="generate-tasks-block">
      <span class="generate-subheader">Generate your own problems</span>
      <span class="generate-header"
        >Generate your own problems with out AI-powered tool</span
      >
      <div class="flex-row-cb">
        <span class="skips-title-generate">Generate the skips problems</span>
        <span class="noises-title-generate">Generate the noises problems</span>
      </div>
      <div class="flex-row-3">
        <span class="skips-description-generate"
          >Users can practice filling in missing code elements</span>
        <span class="noises-description-generate"
            >Users can practice identifying and removing extra code lines</span>
      </div>
      <div class="flex-row-fb">
        <a class="try-now-left-generate" href="#" @click.prevent="navigateTo('/generate-skips')">Try now →</a>
        <a class="try-now-right-generate" href="#" @click.prevent="navigateTo('/generate-noises')">Try now →</a>
      </div>
    </div>

    <!-- Solve task block -->
    <div class="solve-frame" id="solve-tasks-block">
      <span class="solve-subheader">Enhance Coding Skills</span>
      <span class="solve-header"
        >Improve your coding abilities with our unique problem types</span
      >
      <div class="flex-row-cb">
        <span class="skips-title-solve">Fill in the skips problems</span>
        <span class="noises-title-solve">Remove noises problems</span>
      </div>
      <div class="flex-row-3">
        <span class="skips-description-solve"
          >You can practice filling in missing code elements</span
        >
        <span class="noises-description-solve"
          >You can practice identifying and removing extra code lines</span
        >
      </div>
      <div class="flex-row-fb">
        <a class="try-now-left-solve" href="#" @click.prevent="navigateTo('/solve-skips')">Try now →</a>
        <a class="try-now-right-solve" href="#" @click.prevent="navigateTo('/solve-noises')">Try now →</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { nextTick } from 'vue'

const router = useRouter()
const navigateTo = async (path) => {
  const currentPath = window.location.pathname
  if (currentPath !== path.split('#')[0] || path === '/') {
    await router.push(path)
    if (path.includes('#generate-tasks-block')) {
      await nextTick()
      setTimeout(() => {
        const element = document.getElementById('generate-tasks-block')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        } else {
          console.warn('Element #generate-tasks-block not found')
        }
      }, 100) // Small delay to ensure DOM is ready
    }
  } else if (path.includes('#generate-tasks-block')) {
    await nextTick()
    setTimeout(() => {
      const element = document.getElementById('generate-tasks-block')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      } else {
        console.warn('Element #generate-tasks-block not found')
      }
    }, 100) // Small delay to ensure DOM is ready
  }
}
</script>