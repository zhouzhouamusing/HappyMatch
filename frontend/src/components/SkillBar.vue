<template>
  <div class="skill-bar">
    <button
      class="skill-btn refresh-skill"
      :disabled="refreshCount <= 0 || disabled"
      @click="$emit('use-refresh')"
    >
      <span class="skill-icon">🔄</span>
      <span class="skill-label">刷新</span>
      <span class="skill-count" v-if="refreshCount > 0">{{ refreshCount }}</span>
      <span class="skill-count empty" v-else>0</span>
    </button>

    <button
      class="skill-btn hammer-skill"
      :class="{ active: hammerMode }"
      :disabled="hammerCount <= 0 || disabled"
      @click="$emit('use-hammer')"
    >
      <span class="skill-icon">🔨</span>
      <span class="skill-label">锤子</span>
      <span class="skill-count" v-if="hammerCount > 0">{{ hammerCount }}</span>
      <span class="skill-count empty" v-else>0</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  refreshCount: { type: Number, default: 0 },
  hammerCount: { type: Number, default: 0 },
  hammerMode: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})
defineEmits(['use-refresh', 'use-hammer'])
</script>

<style scoped>
.skill-bar {
  display: flex;
  gap: 10px;
}

.skill-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 12px;
  background: var(--bg);
  border: 2px solid var(--border-light);
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  transition: var(--transition-fast);
  position: relative;
}

.skill-btn:hover:not(:disabled) {
  border-color: var(--primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.skill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.skill-btn.active {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  animation: hammerPulse 1s ease-in-out infinite;
}

@keyframes hammerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}

.skill-icon {
  font-size: 16px;
}

.skill-label {
  font-size: 12px;
}

.skill-count {
  background: var(--primary);
  color: white;
  font-size: 10px;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 0 4px;
}

.skill-count.empty {
  background: #d1d5db;
}
</style>
