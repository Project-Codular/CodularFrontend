<template>
  <div>
    <AppHeader />
    <router-view></router-view>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './views/AppHeader.vue'
import AppFooter from './views/AppFooter.vue'
</script>

<script>
export default {
  components: {
    AppHeader,
    AppFooter,
  },
}
</script>