// src/stores/task.js
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
    state: () => ({
        taskAlias: null
    }),
    actions: {
        setTaskAlias(alias) {
            this.taskAlias = alias
        }
    }
})