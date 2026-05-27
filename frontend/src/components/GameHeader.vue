<template>
  <div class="game-header-wrap">
    <div class="game-header">
      <div class="header-item">
        <span class="header-icon">⭐</span>
        <div class="header-info">
          <span class="header-label">关卡</span>
          <span class="header-value">{{ currentLevel }} / {{ totalLevels }}</span>
        </div>
      </div>
      <div class="header-item score-item">
        <span class="header-icon">🎯</span>
        <div class="header-info">
          <span class="header-label">得分</span>
          <span class="header-value score-value">{{ score }}<span class="score-target"> / {{ targetScore }}</span></span>
        </div>
      </div>
      <div class="header-item">
        <span class="header-icon">👟</span>
        <div class="header-info">
          <span class="header-label">步数</span>
          <span class="header-value" :class="{ 'danger-pulse': movesLeft <= 3 }">{{ movesLeft }}</span>
        </div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }">
        <div class="progress-glow"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentLevel: Number,
  score: Number,
  targetScore: Number,
  movesLeft: Number,
  totalLevels: { type: Number, default: 10 }
})

const progressPercent = computed(() => {
  return Math.min(100, (props.score / props.targetScore) * 100)
})
</script>

<style scoped>
.game-header-wrap {
  margin-bottom: 16px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  padding: 14px 16px;
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.header-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 22px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.header-label {
  font-size: 11px;
  color: var(--text-lighter);
  font-weight: 500;
}

.header-value {
  font-size: 17px;
  font-weight: 700;
  color: var(--primary-dark);
  transition: var(--transition-fast);
}

.score-target {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-lighter);
}

.header-value.danger-pulse {
  color: var(--danger);
  animation: dangerPulse 1s infinite;
}

@keyframes dangerPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

.progress-bar {
  height: 10px;
  background: var(--bg);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary-dark));
  border-radius: 5px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(180deg, rgba(255,255,255,0.4), transparent);
  border-radius: 5px 5px 0 0;
}
</style>
