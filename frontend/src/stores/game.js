import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useGameStore = defineStore('game', () => {
  const currentLevel = ref(1)
  const highScore = ref(0)

  async function fetchProgress() {
    try {
      const res = await api.get('/api/game/progress')
      currentLevel.value = res.data.currentLevel
      highScore.value = res.data.highScore
    } catch {
      // ignore
    }
  }

  async function saveProgress(level, score) {
    try {
      const res = await api.post('/api/game/progress', {
        currentLevel: level,
        highScore: score
      })
      currentLevel.value = res.data.currentLevel
      highScore.value = res.data.highScore
    } catch {
      // ignore
    }
  }

  return { currentLevel, highScore, fetchProgress, saveProgress }
})
