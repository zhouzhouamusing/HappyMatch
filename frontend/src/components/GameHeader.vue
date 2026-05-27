<template>
  <div class="game-header">
    <div class="header-item">
      <span class="header-icon">⭐</span>
      <div class="header-info">
        <span class="header-label">关卡</span>
        <span class="header-value">{{ currentLevel }} / 5</span>
      </div>
    </div>
    <div class="header-item">
      <span class="header-icon">🎯</span>
      <div class="header-info">
        <span class="header-label">目标</span>
        <span class="header-value">{{ score }} / {{ targetScore }}</span>
      </div>
    </div>
    <div class="header-item">
      <span class="header-icon">👟</span>
      <div class="header-info">
        <span class="header-label">步数</span>
        <span class="header-value" :class="{ 'low-moves': movesLeft <= 3 }">{{ movesLeft }}</span>
      </div>
    </div>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentLevel: Number,
  score: Number,
  targetScore: Number,
  movesLeft: Number
})

const progressPercent = computed(() => {
  return Math.min(100, (props.score / props.targetScore) * 100)
})
</script>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: 12px;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 24px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-label {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 500;
}

.header-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-dark);
}

.header-value.low-moves {
  color: var(--danger);
  animation: pulse 1s infinite;
}

.progress-bar {
  height: 8px;
  background: var(--bg);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary-dark));
  border-radius: 4px;
  transition: width 0.4s ease;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
