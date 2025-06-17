<template>
  <div class="main-container">
    <!-- Header Section -->
    <div class="flex-row-center">
      <h1 class="main-header">Our Team</h1>
    </div>

    <!-- Subheader and Description -->
    <div class="flex-row">
      <p class="main-header-subheader">
        Meet the dedicated team behind Codular, a collaborative students from the National Research University Higher School of Economics (HSE). This talented group worked together under the "Project" discipline to bring innovative AI-driven programming tools to life.
      </p>
    </div>

    <!-- Content Frame -->
    <div class="generate-frame">
      <div class="team-block" v-for="member in teamMembers" :key="member.surname">
        <img :src="avatarMap[member.surname]" :alt="' + member.surname + \'s avatar'" class="team-avatar" />
        <div class="team-info">
          <div class="block-title">{{ member.name }} {{ member.surname }}</div>
          <div class="block-description">{{ member.role }}</div>
        </div>
        <a :href="member.github" target="_blank" class="github-button">> View GitHub</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const teamMembers = [
  { name: 'Yuriy', surname: 'Magus', role: 'Backend&ML Developer, Project Manager', github: 'https://github.com/theMagusDev' },
  { name: 'Ruslan', surname: 'Mukhametshin', role: 'ML Developer', github: 'https://github.com/MRuslanR' },
  { name: 'Angelina', surname: 'Shevchenko', role: 'ML Developer', github: 'https://github.com/angeshass' },
  { name: 'Daniil', surname: 'Smirnov', role: 'DevOps', github: 'https://github.com/xm1k' },
  { name: 'Alexander', surname: 'Fedoryako', role: 'Frontend Lead', github: 'https://github.com/i-am-a-saw' },
  { name: 'Nikita', surname: 'Andriyanov', role: 'Frontend Developer', github: 'https://github.com/Axeedev' },
  { name: 'Artyom', surname: 'Linnik', role: 'Frontend Developer', github: 'https://github.com/' },
  { name: 'Valentina', surname: 'Dashinimaeva', role: 'Backend&Manual Testing', github: 'https://github.com/immedeg' },
  { name: 'Natalia', surname: 'Khlopochkina', role: 'Testing and Project Reporting', github: 'https://github.com/Natasha3008' }
]

// Dynamically import avatars using import.meta.glob
const avatarModules = import.meta.glob('../assets/avatar_*.png', { eager: true })
const avatarMap = {}
for (const path in avatarModules) {
  const surnameMatch = path.match(/avatar_([^.]+)\.png/)
  if (surnameMatch) {
    const surname = surnameMatch[1]
    avatarMap[surname] = avatarModules[path].default
  }
}
</script>

<style scoped>
/* Inherit global styles from styles.css */
@import '../assets/styles.css';

/* Frame styling */
.generate-frame {
  background: #0900b5;
  padding: 4rem 0;
}

/* Team Block styling */
.team-block {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Distribute space, pushing button to the right */
  background: #0900b5;
  border-radius: 1rem;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 1538px;
  width: 90%;
  position: relative;
}

.team-avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  clip-path: circle(50%);
  margin-right: 2rem;
}

.team-info {
  flex: 1;
}

.block-title {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.6rem, 3vw, 1.875rem);
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.block-description {
  font-family: Friska, var(--default-font-family);
  font-size: clamp(1.2rem, 2.5vw, 1.5625rem);
  font-weight: 400;
  color: #ffffff;
}

/* GitHub Button styling */
.github-button {
  font-family: Friska, var(--default-font-family);
  font-size: 1.2rem;
  color: #ffffff;
  text-decoration: underline;
  padding: 0.5rem 1rem;
  text-align: right;
  transition: transform 0.2s ease;
  text-decoration-color: #ffffff; /* Ensure underline color matches text */
}

.github-button:hover {
  transform: scale(1.025); /* Increase size by approximately 0.4px for typical font size */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .team-block {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
  }

  .team-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .team-info {
    margin-bottom: 1rem;
  }

  .github-button {
    margin-top: 1rem;
    text-align: center;
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

  .team-avatar {
    width: 80px;
    height: 80px;
  }

  .github-button {
    font-size: 1rem;
  }
}
</style>