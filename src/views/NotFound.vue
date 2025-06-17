<template>
  <div class="main-container">
    <!-- Header Section -->
    <div class="flex-row">
      <h1 class="main-header">404 Not Found</h1>
    </div>

    <!-- Subheader and Description -->
    <div class="flex-row">
      <p class="main-header-subheader">
        Oops! The page you are looking for does not exist. It might have been moved or deleted.
      </p>
    </div>

    <!-- Content Frame -->
    <div class="generate-frame">
      <div class="text-content">
        <div class="left-text">Open Home page</div>
        <div class="right-text">Click the button below to return to the homepage and explore our coding tools.</div>
      </div>
      <div class="button-container">
        <a class="start-button-1" href="#" @click.prevent="navigateTo('/')">
          <span>Back to Home</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* Inherit global styles from styles.css */
@import '../assets/styles.css';

/* Frame styling */
.generate-frame {
  background: #0900b5;
  padding: 4rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh; /* Ensure enough height for centering */
}

.text-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 80%;
  max-width: 1200px;
  margin-bottom: 2rem;
}

.left-text, .right-text {
  color: #ffffff;
  font-family: Friska, var(--default-font-family);
  font-size: 1.5rem;
}

.left-text {
  flex: 1;
}

.right-text {
  flex: 2;
  padding-left: 2rem;
  text-align: left; /* Align text to the left within the block */
}

.button-container {
  display: flex;
  justify-content: center;
}

.start-button-1 {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background: #4f46e5;
  color: #ffffff;
  border: none;
  border-radius: 15px;
  font-family: Friska, var(--default-font-family);
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s ease;
  text-decoration: none; /* Remove underline */
}

.start-button-1:hover {
  transform: scale(1.03125); /* Increase size by approximately 0.5px based on 16px font */
  background-color: #3e38c2; /* Optional: keep background change for feedback */
}

.get-started {
  text-decoration: none; /* Ensure no underline on the span */
}

/* Adjust responsiveness for smaller screens */
@media (max-width: 768px) {
  .text-content {
    flex-direction: column;
    text-align: center;
    width: 90%;
  }

  .left-text, .right-text {
    margin-bottom: 1rem;
    padding-left: 0;
    text-align: center; /* Reset to center for mobile */
  }

  .right-text {
    flex: none;
  }

  .start-button-1 {
    width: 90%;
    margin-top: 1rem;
  }
}

@media (max-width: 375px) {
  .main-header {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  .main-header-subheader {
    font-size: clamp(1rem, 2vw, 1.2rem);
  }

  .left-text, .right-text {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
  }

  .start-button-1 {
    font-size: 1rem;
    padding: 0.8rem 1.5rem;
  }
}
</style>