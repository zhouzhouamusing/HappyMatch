import { defineStore } from 'pinia'
import { ref, onUnmounted } from 'vue'
import api from '../api'

export const useGameStore = defineStore('game', () => {
  const currentLevel = ref(1)
  const highScore = ref(0)
  const coins = ref(0)
  const stamina = ref(30)
  const maxStamina = ref(30)
  const staminaRecoverySeconds = ref(0)
  const refreshCount = ref(0)
  const hammerCount = ref(0)

  let staminaTimer = null

  function updateFromData(data) {
    currentLevel.value = data.currentLevel
    highScore.value = data.highScore
    coins.value = data.coins
    stamina.value = data.stamina
    maxStamina.value = data.maxStamina
    staminaRecoverySeconds.value = data.staminaRecoverySeconds
    refreshCount.value = data.refreshCount
    hammerCount.value = data.hammerCount
    startStaminaTimer()
  }

  function startStaminaTimer() {
    stopStaminaTimer()
    if (stamina.value >= maxStamina.value) return
    staminaTimer = setInterval(() => {
      if (staminaRecoverySeconds.value > 0) {
        staminaRecoverySeconds.value--
      } else if (stamina.value < maxStamina.value) {
        stamina.value++
        staminaRecoverySeconds.value = 300
        if (stamina.value >= maxStamina.value) {
          stopStaminaTimer()
        }
      }
    }, 1000)
  }

  function stopStaminaTimer() {
    if (staminaTimer) {
      clearInterval(staminaTimer)
      staminaTimer = null
    }
  }

  async function fetchProgress() {
    try {
      const res = await api.get('/api/game/progress')
      updateFromData(res.data.data)
    } catch {
      // use defaults
    }
  }

  async function saveProgress(level, score, stars) {
    try {
      const res = await api.post('/api/game/progress', {
        currentLevel: level,
        highScore: score,
        stars: stars || 0
      })
      updateFromData(res.data.data)
    } catch {
      // silent fail
    }
  }

  async function consumeStamina() {
    const res = await api.post('/api/game/stamina/consume')
    updateFromData(res.data.data)
  }

  async function buyItem(itemType, quantity = 1) {
    const res = await api.post('/api/game/shop/buy', { itemType, quantity })
    updateFromData(res.data.data)
  }

  async function useSkill(skillType) {
    const res = await api.post('/api/game/skill/use', { skillType })
    updateFromData(res.data.data)
  }

  async function fetchRanking() {
    const res = await api.get('/api/game/ranking')
    return res.data.data
  }

  function cleanup() {
    stopStaminaTimer()
  }

  return {
    currentLevel, highScore, coins, stamina, maxStamina,
    staminaRecoverySeconds, refreshCount, hammerCount,
    fetchProgress, saveProgress, consumeStamina,
    buyItem, useSkill, fetchRanking, cleanup
  }
})
