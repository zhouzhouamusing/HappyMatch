<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card" :class="type">
        <div class="modal-icon">{{ type === 'won' ? '🎉' : '😢' }}</div>
        <h2>{{ type === 'won' ? '恭喜过关！' : '挑战失败' }}</h2>
        <p class="modal-desc">
          {{ type === 'won'
            ? `太棒了！你获得了 ${score} 分！`
            : `目标 ${targetScore} 分，你获得了 ${score} 分` }}
        </p>
        <div class="modal-actions">
          <button v-if="type === 'won' && currentLevel < 5" class="btn-primary" @click="$emit('next')">
            下一关 ➜
          </button>
          <button v-if="type === 'won' && currentLevel >= 5" class="btn-primary" @click="$emit('close')">
            全部通关！🏆
          </button>
          <button class="btn-secondary" @click="$emit('retry')">
            {{ type === 'won' ? '重玩本关' : '再试一次' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  type: String,
  score: Number,
  targetScore: Number,
  currentLevel: Number
})
defineEmits(['close', 'next', 'retry'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: var(--bg-card);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 360px;
  width: 90%;
}

.modal-icon {
  font-size: 56px;
  margin-bottom: 12px;
}

.modal-card h2 {
  font-size: 22px;
  color: var(--primary-dark);
  margin-bottom: 8px;
}

.modal-card.lost h2 {
  color: var(--danger);
}

.modal-desc {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 28px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary {
  padding: 14px 24px;
  border-radius: var(--radius-sm);
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  font-size: 15px;
  font-weight: 600;
  transition: transform 0.15s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s ease;
}

.btn-secondary:hover {
  background: var(--border);
}

.modal-enter-active {
  transition: all 0.3s ease;
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.9);
}
</style>
