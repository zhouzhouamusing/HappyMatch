<template>
  <div class="page-content game-page-content">
    <div class="game-container">
      <!-- Top bar -->
      <div class="top-bar glass-card">
        <div class="user-info">
          <div class="user-avatar-wrap">
            <span class="user-avatar">🙂</span>
          </div>
          <div class="user-details">
            <span class="user-name">{{ userStore.user?.username }}</span>
            <span class="user-score">最高分: {{ gameStore.highScore }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <span>退出</span>
        </button>
      </div>

      <!-- Resource bar -->
      <div class="resource-bar glass-card">
        <div class="coin-display">
          <span class="coin-icon">🪙</span>
          <span class="coin-amount">{{ gameStore.coins }}</span>
        </div>
        <StaminaBar
          :stamina="gameStore.stamina"
          :maxStamina="gameStore.maxStamina"
          :recoverySeconds="gameStore.staminaRecoverySeconds"
        />
      </div>

      <!-- Feature buttons -->
      <div class="feature-btns">
        <button class="feature-btn shop-feature" @click="showShopModal = true">
          <span class="feature-icon">🏪</span>
          <span class="feature-label">商店</span>
        </button>
        <button class="feature-btn rank-feature" @click="showRankingModal = true">
          <span class="feature-icon">🏆</span>
          <span class="feature-label">排行</span>
        </button>
      </div>

      <!-- Level selector -->
      <Transition name="panel-slide" mode="out-in">
        <div v-if="showLevelSelector" key="levels" class="level-panel glass-card">
          <div class="level-panel-header">
            <span class="panel-icon">🍒</span>
            <h2 class="title-gradient">选择关卡</h2>
            <p class="panel-subtitle">消除水果，挑战高分 · 共 {{ LEVELS.length }} 关</p>
          </div>

          <!-- Stamina warning -->
          <div v-if="gameStore.stamina < 2" class="stamina-warning">
            ⚡ 体力不足，无法进入关卡
          </div>

          <!-- Difficulty tabs -->
          <div class="difficulty-tabs">
            <button
              v-for="tab in difficultyTabs"
              :key="tab.key"
              class="diff-tab"
              :class="{ active: activeTab === tab.key }"
              @click="activeTab = tab.key"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>

          <div class="level-grid">
            <button
              v-for="lv in filteredLevels"
              :key="lv.level"
              class="level-btn"
              :class="{
                locked: lv.level > unlockedLevel,
                current: lv.level === unlockedLevel,
                completed: lv.level < unlockedLevel,
                'no-stamina': gameStore.stamina < 2 && lv.level <= unlockedLevel
              }"
              :disabled="lv.level > unlockedLevel || gameStore.stamina < 2"
              @click="enterLevel(lv.level)"
            >
              <span class="level-badge" :class="{ unlocked: lv.level <= unlockedLevel }">
                {{ lv.level > unlockedLevel ? '🔒' : lv.level < unlockedLevel ? '✅' : '⭐' }}
              </span>
              <span class="level-num">第 {{ lv.level }} 关</span>
              <span class="level-desc">{{ lv.description }}</span>
              <div class="level-meta">
                <span>🎯 {{ lv.target }}分</span>
                <span>👟 {{ lv.moves }}步</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Game area -->
        <div v-else key="game" class="game-area glass-card" :class="{ 'hammer-cursor': hammerMode }">
          <GameHeader
            :currentLevel="currentLevel"
            :score="score"
            :targetScore="targetScore"
            :movesLeft="movesLeft"
            :totalLevels="LEVELS.length"
          />
          <GameBoard
            :grid="grid"
            @select="handleCellSelect"
          />
          <div class="game-footer">
            <button class="back-btn" @click="backToLevels">
              ← 选关
            </button>
            <SkillBar
              :refreshCount="gameStore.refreshCount"
              :hammerCount="gameStore.hammerCount"
              :hammerMode="hammerMode"
              :disabled="isProcessing || gameStatus !== 'playing'"
              @use-refresh="handleUseRefresh"
              @use-hammer="handleUseHammer"
            />
            <Transition name="combo-pop">
              <div v-if="comboCount > 1" class="combo-display">
                🔥 {{ comboCount }}x 连击！
              </div>
            </Transition>
            <div class="level-tag">
              第 {{ currentLevel }} 关
            </div>
          </div>
          <div v-if="hammerMode" class="hammer-hint">
            🔨 点击任意水果击碎 · <button class="cancel-hammer" @click="hammerMode = false">取消</button>
          </div>
        </div>
      </Transition>

      <!-- Level modal -->
      <LevelModal
        :show="gameStatus !== 'playing' && !showLevelSelector"
        :type="gameStatus"
        :score="score"
        :targetScore="targetScore"
        :currentLevel="currentLevel"
        :totalLevels="LEVELS.length"
        :coinsEarned="coinsEarned"
        @next="handleNextLevel"
        @retry="handleRetry"
        @close="backToLevels"
      />

      <!-- Shop modal -->
      <ShopModal
        :show="showShopModal"
        :coins="gameStore.coins"
        :refreshCount="gameStore.refreshCount"
        :hammerCount="gameStore.hammerCount"
        @close="showShopModal = false"
        @buy="handleBuyItem"
      />

      <!-- Ranking modal -->
      <RankingModal
        :show="showRankingModal"
        :currentUsername="userStore.user?.username"
        @close="showRankingModal = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useGameStore } from '../stores/game'
import { useGameLogic } from '../composables/useGameLogic'
import { resetAuthState } from '../router'
import GameHeader from '../components/GameHeader.vue'
import GameBoard from '../components/GameBoard.vue'
import LevelModal from '../components/LevelModal.vue'
import ShopModal from '../components/ShopModal.vue'
import RankingModal from '../components/RankingModal.vue'
import StaminaBar from '../components/StaminaBar.vue'
import SkillBar from '../components/SkillBar.vue'
import '../assets/styles/game.css'

const router = useRouter()
const userStore = useUserStore()
const gameStore = useGameStore()

const {
  grid, score, movesLeft, currentLevel,
  isProcessing, gameStatus, targetScore,
  comboCount, LEVELS, startLevel, selectCell,
  shuffleBoard, hammerDestroy, cleanup
} = useGameLogic()

onUnmounted(() => {
  cleanup()
  gameStore.cleanup()
})

const showLevelSelector = ref(true)
const unlockedLevel = ref(1)
const activeTab = ref('all')
const showShopModal = ref(false)
const showRankingModal = ref(false)
const hammerMode = ref(false)
const coinsEarned = ref(0)

watch(gameStatus, (val) => {
  if (val === 'won') {
    coinsEarned.value = getStars() * 10
  }
})

const difficultyTabs = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: 'easy', label: '入门', icon: '🌱' },
  { key: 'medium', label: '进阶', icon: '🌟' },
  { key: 'hard', label: '较难', icon: '🔥' },
  { key: 'extreme', label: '极难', icon: '💀' }
]

const filteredLevels = computed(() => {
  switch (activeTab.value) {
    case 'easy': return LEVELS.filter(l => l.level <= 10)
    case 'medium': return LEVELS.filter(l => l.level >= 11 && l.level <= 30)
    case 'hard': return LEVELS.filter(l => l.level >= 31 && l.level <= 45)
    case 'extreme': return LEVELS.filter(l => l.level >= 46)
    default: return LEVELS
  }
})

onMounted(async () => {
  await gameStore.fetchProgress()
  unlockedLevel.value = gameStore.currentLevel
})

async function enterLevel(level) {
  try {
    await gameStore.consumeStamina()
    showLevelSelector.value = false
    hammerMode.value = false
    coinsEarned.value = 0
    startLevel(level)
  } catch (e) {
    alert(e.message || '体力不足，请等待恢复！')
  }
}

function backToLevels() {
  showLevelSelector.value = true
  gameStatus.value = 'playing'
  hammerMode.value = false
}

function getStars() {
  if (!targetScore.value) return 0
  const ratio = score.value / targetScore.value
  if (ratio >= 1.5) return 3
  if (ratio >= 1.2) return 2
  return 1
}

async function handleNextLevel() {
  const nextLevel = currentLevel.value + 1
  if (nextLevel <= LEVELS.length) {
    const stars = getStars()
    unlockedLevel.value = Math.max(unlockedLevel.value, nextLevel)
    await gameStore.saveProgress(nextLevel, score.value, stars)
    try {
      await gameStore.consumeStamina()
      startLevel(nextLevel)
    } catch {
      backToLevels()
    }
  }
}

async function handleRetry() {
  coinsEarned.value = 0
  try {
    await gameStore.consumeStamina()
    startLevel(currentLevel.value)
  } catch {
    backToLevels()
  }
}

function handleCellSelect(row, col) {
  if (hammerMode.value) {
    hammerMode.value = false
    gameStore.useSkill('hammer')
    hammerDestroy(row, col)
    return
  }
  selectCell(row, col)
}

async function handleUseRefresh() {
  try {
    await gameStore.useSkill('refresh')
    shuffleBoard()
  } catch {
    alert('刷新技能数量不足！')
  }
}

function handleUseHammer() {
  hammerMode.value = !hammerMode.value
}

async function handleBuyItem(itemType) {
  try {
    await gameStore.buyItem(itemType)
  } catch (e) {
    alert(e.message || '金币不足！')
  }
}

async function handleLogout() {
  cleanup()
  gameStore.cleanup()
  await userStore.logout()
  resetAuthState()
  router.push('/login')
}
</script>

<style scoped>
.game-page-content {
  align-items: flex-start;
  padding-top: 24px;
  padding-bottom: 24px;
}

.game-container {
  width: 100%;
  max-width: 580px;
}

/* Top bar */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 14px 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-wrap {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  font-size: 22px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text);
  font-size: 15px;
}

.user-score {
  font-size: 12px;
  color: var(--text-lighter);
}

.logout-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xs);
  background: var(--bg);
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
  transition: var(--transition-fast);
  border: 1px solid var(--border-light);
}

.logout-btn:hover {
  background: var(--danger-light);
  color: var(--danger);
  border-color: var(--danger);
}

/* Resource bar */
.resource-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 12px 20px;
}

.coin-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 10px;
  border: 1px solid #fde68a;
}

.coin-icon {
  font-size: 16px;
}

.coin-amount {
  font-weight: 700;
  color: #b45309;
  font-size: 14px;
}

/* Feature buttons */
.feature-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.feature-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 16px;
  border: 2px solid transparent;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.feature-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.feature-btn:active {
  transform: translateY(0);
}

.feature-icon {
  font-size: 22px;
}

.feature-label {
  font-size: 15px;
}

.shop-feature {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
  color: #92400e;
}

.shop-feature:hover {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.2);
}

.rank-feature {
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border-color: #c4b5fd;
  color: #5b21b6;
}

.rank-feature:hover {
  border-color: #a78bfa;
  background: linear-gradient(135deg, #ede9fe, #ddd6fe);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.2);
}

/* Level panel */
.level-panel {
  padding: 28px 20px;
}

.level-panel-header {
  text-align: center;
  margin-bottom: 20px;
}

.panel-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
  animation: panelIconBounce 2s ease-in-out infinite;
}

@keyframes panelIconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.title-gradient {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.panel-subtitle {
  font-size: 13px;
  color: var(--text-lighter);
  margin-top: 4px;
}

/* Stamina warning */
.stamina-warning {
  text-align: center;
  padding: 10px;
  margin-bottom: 12px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fca5a5;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

/* Difficulty tabs */
.difficulty-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.diff-tab {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: var(--bg);
  color: var(--text-light);
  border: 1px solid var(--border-light);
  transition: var(--transition-fast);
  white-space: nowrap;
  cursor: pointer;
}

.diff-tab:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

.diff-tab.active {
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: white;
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
}

.level-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}

.level-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 10px 14px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  border: 2px solid transparent;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.level-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, rgba(167, 139, 250, 0.05));
  opacity: 0;
  transition: opacity 0.3s;
}

.level-btn:not(.locked):not(.no-stamina):hover {
  border-color: var(--primary-light);
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.level-btn:not(.locked):not(.no-stamina):hover::after {
  opacity: 1;
}

.level-btn.current {
  border-color: var(--primary);
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  box-shadow: var(--shadow-sm);
}

.level-btn.completed {
  border-color: rgba(52, 211, 153, 0.4);
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
}

.level-btn.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.level-btn.no-stamina {
  opacity: 0.6;
  cursor: not-allowed;
}

.level-badge {
  font-size: 20px;
  margin-bottom: 2px;
}

.level-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-dark);
}

.level-desc {
  font-size: 11px;
  color: var(--text-light);
}

.level-meta {
  display: flex;
  gap: 8px;
  font-size: 10px;
  color: var(--text-lighter);
  margin-top: 2px;
}

/* Game area */
.game-area {
  padding: 20px;
}

.game-area.hammer-cursor {
  cursor: crosshair;
}

.game-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  flex-wrap: wrap;
  gap: 8px;
}

.back-btn {
  padding: 8px 16px;
  border-radius: var(--radius-xs);
  background: var(--bg);
  color: var(--text-light);
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--border-light);
  transition: var(--transition-fast);
}

.back-btn:hover {
  background: var(--border-light);
  color: var(--text);
}

.combo-display {
  font-size: 15px;
  font-weight: 700;
  color: var(--warning);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  animation: comboPulse 0.6s ease-in-out infinite;
}

@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.level-tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--primary-light), var(--primary));
  color: white;
  font-weight: 600;
}

.hammer-hint {
  text-align: center;
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border: 1px solid #fca5a5;
  font-size: 13px;
  color: #dc2626;
  font-weight: 500;
}

.cancel-hammer {
  background: none;
  border: none;
  color: #dc2626;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
}

/* Transitions */
.panel-slide-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.panel-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}

.combo-pop-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.combo-pop-leave-active {
  transition: all 0.2s ease;
}
.combo-pop-enter-from {
  opacity: 0;
  transform: scale(0.5);
}
.combo-pop-leave-to {
  opacity: 0;
  transform: scale(1.3);
}
</style>
