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
  const progressLoaded = ref(false)

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
      progressLoaded.value = true
    } catch {
      progressLoaded.value = false
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
    if (progressLoaded.value && stamina.value < 2) {
      throw new Error('体力不足，请等待恢复')
    }
    try {
      const res = await api.post('/api/game/stamina/consume')
      updateFromData(res.data.data)
      progressLoaded.value = true
    } catch (e) {
      if (e.response?.data?.message) {
        throw new Error(e.response.data.message)
      }
      // If the API is unavailable, still allow playing (deduct locally)
      if (progressLoaded.value) {
        stamina.value = Math.max(0, stamina.value - 2)
      }
    }
  }

  async function buyItem(itemType, quantity = 1) {
    try {
      const res = await api.post('/api/game/shop/buy', { itemType, quantity })
      updateFromData(res.data.data)
    } catch (e) {
      const msg = e.response?.data?.message || '购买失败'
      throw new Error(msg)
    }
  }

  async function useSkill(skillType) {
    try {
      const res = await api.post('/api/game/skill/use', { skillType })
      updateFromData(res.data.data)
    } catch (e) {
      const msg = e.response?.data?.message || '使用失败'
      throw new Error(msg)
    }
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
    staminaRecoverySeconds, refreshCount, hammerCount, progressLoaded,
    fetchProgress, saveProgress, consumeStamina,
    buyItem, useSkill, fetchRanking, cleanup
  }
})
