<template>
  <div class="stamina-bar">
    <span class="stamina-icon">⚡</span>
    <div class="stamina-info">
      <div class="stamina-numbers">
        <span class="stamina-current" :class="staminaClass">{{ stamina }}</span>
        <span class="stamina-sep">/</span>
        <span class="stamina-max">{{ maxStamina }}</span>
      </div>
      <div v-if="stamina < maxStamina && recoverySeconds > 0" class="stamina-timer">
        {{ formatTime(recoverySeconds) }} 后恢复
      </div>
    </div>
    <div class="stamina-progress">
      <div class="stamina-fill" :class="staminaClass" :style="{ width: (stamina / maxStamina * 100) + '%' }"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stamina: { type: Number, default: 30 },
  maxStamina: { type: Number, default: 30 },
  recoverySeconds: { type: Number, default: 0 }
})

const staminaClass = computed(() => {
  if (props.stamina > 10) return 'high'
  if (props.stamina >= 5) return 'medium'
  return 'low'
})

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
</script>

<style scoped>
.stamina-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
  border: 1px solid #bbf7d0;
  min-width: 140px;
}

.stamina-icon {
  font-size: 18px;
}

.stamina-info {
  flex: 1;
  min-width: 0;
}

.stamina-numbers {
  display: flex;
  align-items: baseline;
  gap: 2px;
  font-size: 14px;
  font-weight: 700;
}

.stamina-current.high { color: #16a34a; }
.stamina-current.medium { color: #ca8a04; }
.stamina-current.low { color: #dc2626; }

.stamina-sep, .stamina-max {
  font-size: 12px;
  color: var(--text-lighter);
  font-weight: 500;
}

.stamina-timer {
  font-size: 10px;
  color: var(--text-lighter);
  margin-top: 1px;
}

.stamina-progress {
  width: 40px;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  overflow: hidden;
}

.stamina-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stamina-fill.high { background: linear-gradient(90deg, #22c55e, #16a34a); }
.stamina-fill.medium { background: linear-gradient(90deg, #eab308, #ca8a04); }
.stamina-fill.low { background: linear-gradient(90deg, #ef4444, #dc2626); }
</style>
