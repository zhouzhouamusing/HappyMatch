<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card" :class="type">
        <div class="modal-icon-wrap">
          <span class="modal-icon">{{ type === 'won' ? '🎉' : '😢' }}</span>
          <div class="modal-icon-ring" :class="type"></div>
        </div>
        <h2 class="modal-title">{{ type === 'won' ? '恭喜过关！' : '挑战失败' }}</h2>
        <p class="modal-score">
          {{ type === 'won'
            ? `太棒了！获得了 ${score} 分！`
            : `还差 ${targetScore - score} 分达标` }}
        </p>
        <div class="modal-stars" v-if="type === 'won'">
          <span v-for="i in 3" :key="i" class="star" :class="{ filled: getStars() >= i }">⭐</span>
        </div>
        <div v-if="type === 'won' && coinsEarned > 0" class="coins-reward">
          <span class="coins-reward-icon-styled"></span>
          <span class="coins-reward-text">+{{ coinsEarned }} 金币</span>
        </div>
        <div class="modal-actions">
          <button v-if="type === 'won' && currentLevel < totalLevels" class="btn-primary" @click="$emit('next')">
            下一关 →
          </button>
          <button v-if="type === 'won' && currentLevel >= totalLevels" class="btn-primary" @click="$emit('close')">
            全部通关 🏆
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
const props = defineProps({
  show: Boolean,
  type: String,
  score: Number,
  targetScore: Number,
  currentLevel: Number,
  totalLevels: { type: Number, default: 50 },
  coinsEarned: { type: Number, default: 0 }
})
defineEmits(['close', 'next', 'retry'])

function getStars() {
  if (!props.targetScore) return 0
  const ratio = props.score / props.targetScore
  if (ratio >= 1.5) return 3
  if (ratio >= 1.2) return 2
  return 1
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: white;
  border-radius: 24px;
  padding: 44px 36px 36px;
  text-align: center;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  max-width: 360px;
  width: 90%;
  position: relative;
  overflow: hidden;
}

.modal-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-light), var(--primary-dark), var(--primary-light));
}

.modal-card.lost::before {
  background: linear-gradient(90deg, #fca5a5, #ef4444, #fca5a5);
}

.modal-icon-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.modal-icon {
  font-size: 56px;
  display: block;
  animation: iconBounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes iconBounceIn {
  0% { transform: scale(0) rotate(-20deg); }
  100% { transform: scale(1) rotate(0); }
}

.modal-icon-ring {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  animation: ringExpand 1s ease-out forwards;
  opacity: 0.5;
}

.modal-icon-ring.lost {
  border-color: #fca5a5;
}

@keyframes ringExpand {
  0% { transform: scale(0.5); opacity: 1; }
  100% { transform: scale(1.2); opacity: 0; }
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 8px;
}

.modal-card.lost .modal-title {
  color: var(--danger);
}

.modal-score {
  color: var(--text-light);
  font-size: 14px;
  margin-bottom: 16px;
}

.modal-stars {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.star {
  font-size: 28px;
  opacity: 0.2;
  transition: all 0.3s;
}

.star.filled {
  opacity: 1;
  animation: starPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.star.filled:nth-child(2) { animation-delay: 0.1s; }
.star.filled:nth-child(3) { animation-delay: 0.2s; }

@keyframes starPop {
  0% { transform: scale(0); }
  100% { transform: scale(1); }
}

.coins-reward {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  margin-bottom: 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  animation: coinsPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
}

@keyframes coinsPop {
  0% { transform: scale(0); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.coins-reward-icon-styled {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #f5a623);
  border: 2px solid #d4920a;
  box-shadow: inset 0 -2px 4px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.4),
              0 2px 6px rgba(245, 166, 35, 0.4);
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.coins-reward-icon-styled::after {
  content: '$';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  color: #8B6914;
  text-shadow: 0 1px 1px rgba(255,255,255,0.3);
}

.coins-reward-text {
  font-size: 15px;
  font-weight: 700;
  color: #b45309;
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
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.btn-primary:hover::before {
  transform: translateX(100%);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.3);
}

.btn-secondary {
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--border-light);
  border-color: var(--border);
}

/* Modal transition */
.modal-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.85) translateY(20px);
}
.modal-leave-to .modal-card {
  transform: scale(0.95);
}
</style>
