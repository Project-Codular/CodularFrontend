<template>
  <div class="user-profile-container">
    <div class="profile-circle" @click="toggleDropdown">
      <template v-if="userEmailInitials">
        <span class="profile-initial">{{ userEmailInitials }}</span>
      </template>
      <svg
        v-else
        class="profile-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>

    <div v-if="isDropdownOpen" class="dropdown-menu">
      <div v-if="authStore.userEmail" class="user-email-display">
        {{ authStore.userEmail }}
      </div>
      <div class="dropdown-item my-tasks-item" @click="navigateToMyTasks">
        My Tasks
      </div>
      <div class="dropdown-separator"></div>
      <div 
        class="dropdown-item logout-item" 
        @click="handleLogout" 
        :class="{ 'logging-out': isLoggingOut }"
        :disabled="isLoggingOut"
      >
        <svg v-if="!isLoggingOut" class="logout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.59L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z"/>
        </svg>
        <span v-if="!isLoggingOut">Logout</span>
        <span v-else>Logging out...</span> 
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const isDropdownOpen = ref(false);
const isLoggingOut = ref(false);
const router = useRouter();

const userEmailInitials = computed(() => {
  if (authStore.userEmail) {
    return authStore.userEmail.substring(0, 2).toUpperCase();
  }
  return null;
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const handleClickOutside = (event) => {
  const profileContainer = document.querySelector('.user-profile-container');
  if (profileContainer && !profileContainer.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

const handleLogout = async () => {
  isLoggingOut.value = true;
  try {
    await authStore.logout();
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
    isLoggingOut.value = false;
    window.location.href = '/';
  }
};

const navigateToMyTasks = () => {
  router.push('/my-tasks');
  isDropdownOpen.value = false; // Close dropdown after navigation
};

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.userEmail) {
    authStore.fetchUserEmail();
  }
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-profile-container {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: auto;
  z-index: 10;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

.profile-circle {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.profile-initial {
  color: #4f46e5;
  font-size: 24px;
  font-weight: bold;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.profile-icon {
  width: 40px;
  height: 40px;
  color: #a0a0a0;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.dropdown-menu {
  position: absolute;
  top: 70px;
  right: 0;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  z-index: 100;
  padding: 15px;
}

.dropdown-item {
  padding: 15px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
  white-space: nowrap;
  border-radius: 8px;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.dropdown-item:hover {
  background-color: #f7f7f7;
}

.dropdown-item.logging-out {
  cursor: not-allowed;
  opacity: 0.7;
  background-color: #f0f0f0;
  color: #888;
  pointer-events: none;
}

.user-email-display {
  font-size: 18px;
  font-weight: 500;
  color: #202020;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  margin-bottom: 10px;
  white-space: normal;
  word-wrap: break-word;
  cursor: default;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  text-align: center;
}

.my-tasks-item {
  color: #333;
  padding: 15px 20px;
  border-radius: 8px;
}

.my-tasks-item:hover {
  background-color: #f7f7f7;
}

.dropdown-separator {
  height: 1px;
  background-color: #eee;
  margin: 10px 0;
}

.logout-item {
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-radius: 8px;
}

.logout-item:hover {
  background-color: #fee2e2;
}

.logout-icon {
  width: 24px;
  height: 24px;
  fill: #ef4444;
}
</style>