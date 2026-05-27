<template>
  <div class="game-page">
    <div class="game-container">
      <div class="top-bar">
        <div class="user-info">
          <span class="user-avatar">🙂</span>
          <span class="user-name">{{ userStore.user?.username }}</span>
        </div>
        <button class="logout-btn" @click="handleLogout">退出登录</button>
      </div>

      <div class="level-selector" v-if="showLevelSelector">
        <h2>🍓 选择关卡</h2>
        <div class="level-grid">
          <button
            v-for="lv in LEVELS"
            :key="lv.level"
            class="level-btn"
            :class="{ locked: lv.level > unlockedLevel, current: lv.level === unlockedLevel }"
            :disabled="lv.level > unlockedLevel"
            @click="enterLevel(lv.level)"
          >
            <span class="level-num">{{ lv.level > unlockedLevel ? '🔒' : lv.level }}</span>
            <span class="level-desc">{{ lv.description }}</span>
            <span class="level-target">目标: {{ lv.target }}分</span>
          </button>
        </div>
      </div>

      <div class="game-area" v-else>
        <GameHeader
          :currentLevel="currentLevel"
          :score="score"
          :targetScore="targetScore"
          :movesLeft="movesLeft"
        />
        <GameBoard
          :grid="grid"
          @select="selectCell"
        />
        <div class="game-footer">
          <button class="back-btn" @click="backToLevels">
            ← 返回关卡
          </button>
          <div class="combo-display" v-if="comboCount > 1">
            🔥 {{ comboCount }}连击！
          </div>
        </div>
      </div>

      <LevelModal
        :show="gameStatus !== 'playing' && !showLevelSelector"
        :type="gameStatus"
        :score="score"
        :targetScore="targetScore"
        :currentLevel="currentLevel"
        @next="handleNextLevel"
        @retry="handleRetry"
        @close="backToLevels"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useGameStore } from '../stores/game'
import { useGameLogic } from '../composables/useGameLogic'
import GameHeader from '../components/GameHeader.vue'
import GameBoard from '../components/GameBoard.vue'
import LevelModal from '../components/LevelModal.vue'
import '../assets/styles/game.css'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const {
  grid, score, movesLeft, currentLevel, selectedCell,
  isProcessing, gameStatus, levelConfig, targetScore,
  comboCount, LEVELS, startLevel, selectCell
} = useGameLogic()

const showLevelSelector = ref(true)
const unlockedLevel = ref(1)

onMounted(async () => {
  await gameStore.fetchProgress()
  unlockedLevel.value = gameStore.currentLevel
})

function enterLevel(level) {
  showLevelSelector.value = false
  startLevel(level)
}

function backToLevels() {
  showLevelSelector.value = true
  gameStatus.value = 'playing'
}

async function handleNextLevel() {
  const nextLevel = currentLevel.value + 1
  if (nextLevel <= 5) {
    unlockedLevel.value = Math.max(unlockedLevel.value, nextLevel)
    await gameStore.saveProgress(nextLevel, score.value)
    startLevel(nextLevel)
  }
}

function handleRetry() {
  startLevel(currentLevel.value)
}

async function handleLogout() {
  await userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.game-page {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 50%, #fce7f3 100%);
  padding: 20px;
}

.game-container {
  width: 100%;
  max-width: 560px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  font-size: 24px;
}

.user-name {
  font-weight: 600;
  color: var(--text);
}

.logout-btn {
  padding: 6px 14px;
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: var(--danger);
  color: white;
}

.level-selector {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 32px;
  text-align: center;
}

.level-selector h2 {
  font-size: 22px;
  color: var(--primary-dark);
  margin-bottom: 24px;
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.level-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.level-btn:not(.locked):hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.level-btn.current {
  border-color: var(--primary);
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
}

.level-btn.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-num {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-dark);
}

.level-desc {
  font-size: 12px;
  color: var(--text);
  font-weight: 500;
}

.level-target {
  font-size: 11px;
  color: var(--text-light);
}

.game-area {
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: var(--border);
  color: var(--text);
}

.combo-display {
  font-size: 14px;
  font-weight: 700;
  color: var(--warning);
  animation: pulse 0.6s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
</style>
