<template>
  <div class="main-container">
    <!-- Header Section -->
    <div class="flex-row-center">
      <h1 class="main-header">About Project</h1>
    </div>

    <!-- Subheader and Description -->
    <div class="flex-row">
      <p class="main-header-subheader">
        Discover the story behind Codular, a pioneering project developed in collaboration with the National Research University Higher School of Economics (HSE) and Sber, as part of the "Project" discipline.
      </p>
    </div>

    <!-- Content Blocks -->
    <div class="content-frame">
      <div class="info-block">
        <div class="block-title">Project Overview</div>
        <div class="block-description">
          Codular is a cutting-edge educational tool born from a strategic partnership between HSE’s Faculty of Informatics Mathematics and Computer Sciences in Nizhny Novgorod and Sber’s AI Center. Initiated within the "Project" discipline, this initiative leverages generative artificial intelligence to create diverse programming challenges, including tasks with code gaps and intentional errors.
        </div>
      </div>

      <div class="info-block">
        <div class="block-title">Our Mission</div>
        <div class="block-description">
          Our mission is to revolutionize programming education by delivering high-quality, AI-generated tasks that adapt to individual learning needs. This collaboration combines academic rigor with industry expertise, ensuring Codular meets the demands of modern education.
        </div>
      </div>

      <div class="info-block">
        <div class="block-title">Partnership with HSE and Sber</div>
        <div class="block-description">
          This project reflects a commitment to excellence, uniting HSE’s academic leadership with Sber’s technological innovation to create a resource that benefits the global coding community.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style scoped>
/* Inherit global styles from assets */
@import '../assets/styles.css';

/* Ensure header is centered */
.main-header {
  text-align: center;
}

/* Frame styling */
.content-frame {
  background: #ffffff;
  padding: 6rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Info Block styling */
.info-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #0900b5;
  border-radius: 4rem;
  padding: 2rem;
  margin: 1.5rem auto;
  max-width: 1437px;
  width: 90%;
  gap: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Added shadow for 3D effect */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth transition for hover */
}

.info-block:hover {
  transform: scale(1.05); /* Slight scale increase on hover */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); /* Larger shadow on hover */
}

.block-title {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.6rem, 3vw, 1.875rem);
  font-weight: 400;
  color: #ffffff;
  flex: 0 0 30%;
  text-align: left;
}

.block-description {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.2rem, 2.5vw, 1.5625rem);
  font-weight: 400;
  color: #ffffff;
  flex: 1 1 65%;
  text-align: left;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .info-block {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }

  .block-title {
    margin-bottom: 1rem;
  }

  .block-description {
    margin-left: 0;
  }
}

@media (max-width: 375px) {
  .main-header {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  .main-header-subheader {
    font-size: clamp(1rem, 2vw, 1.2rem);
  }

  .block-title {
    font-size: clamp(1.4rem, 3vw, 1.6rem);
  }

  .block-description {
    font-size: clamp(1rem, 2vw, 1.2rem);
  }
}
</style>