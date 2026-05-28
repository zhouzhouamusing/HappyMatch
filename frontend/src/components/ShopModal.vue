<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card shop-modal">
        <button class="modal-close" @click="$emit('close')">×</button>
        <div class="shop-header">
          <span class="shop-icon">🏪</span>
          <h2 class="title-gradient">技能商店</h2>
          <div class="coin-display">
            <span class="coin-icon-styled"></span>
            <span class="coin-amount">{{ coins }}</span>
          </div>
        </div>

        <div class="shop-items">
          <div class="shop-item">
            <div class="item-icon-wrap refresh-bg">
              <span class="item-icon">🔄</span>
            </div>
            <div class="item-info">
              <h3 class="item-name">刷新技能</h3>
              <p class="item-desc">重新打乱全场水果布局，破解死局</p>
              <div class="item-meta">
                <span class="item-price"><span class="coin-icon-sm"></span> 20</span>
                <span class="item-owned">已拥有: {{ refreshCount }}</span>
              </div>
            </div>
            <button
              class="buy-btn"
              :disabled="coins < 20"
              @click="$emit('buy', 'refresh')"
            >
              购买
            </button>
          </div>

          <div class="shop-item">
            <div class="item-icon-wrap hammer-bg">
              <span class="item-icon">🔨</span>
            </div>
            <div class="item-info">
              <h3 class="item-name">锤子技能</h3>
              <p class="item-desc">直接击碎任意单个水果，应对卡点难题</p>
              <div class="item-meta">
                <span class="item-price"><span class="coin-icon-sm"></span> 30</span>
                <span class="item-owned">已拥有: {{ hammerCount }}</span>
              </div>
            </div>
            <button
              class="buy-btn"
              :disabled="coins < 30"
              @click="$emit('buy', 'hammer')"
            >
              购买
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  show: Boolean,
  coins: Number,
  refreshCount: Number,
  hammerCount: Number
})
defineEmits(['close', 'buy'])
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

.shop-modal {
  background: white;
  border-radius: 24px;
  padding: 32px 28px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
}

.shop-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #fbbf24, #f59e0b, #fbbf24);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 24px;
  color: var(--text-lighter);
  background: none;
  border: none;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: var(--bg);
  color: var(--text);
}

.shop-header {
  text-align: center;
  margin-bottom: 24px;
}

.shop-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.title-gradient {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.coin-icon-styled {
  width: 20px;
  height: 20px;
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

.coin-icon-styled::after {
  content: '$';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
  color: #8B6914;
  text-shadow: 0 1px 1px rgba(255,255,255,0.3);
}

.coin-icon-sm {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffd700, #f5a623);
  border: 1.5px solid #d4920a;
  box-shadow: inset 0 -1px 2px rgba(0,0,0,0.2),
              inset 0 1px 2px rgba(255,255,255,0.4);
  display: inline-block;
  vertical-align: middle;
  position: relative;
}

.coin-icon-sm::after {
  content: '$';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  font-weight: 900;
  color: #8B6914;
}

.coin-display {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-radius: 20px;
  border: 1px solid #fde68a;
}

.coin-amount {
  font-weight: 700;
  color: #b45309;
  font-size: 15px;
}

.shop-items {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 16px;
  background: var(--bg);
  border: 1px solid var(--border-light);
  transition: var(--transition-fast);
}

.shop-item:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.item-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.refresh-bg {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
}

.hammer-bg {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
}

.item-icon {
  font-size: 24px;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}

.item-desc {
  font-size: 11px;
  color: var(--text-lighter);
  margin-bottom: 6px;
  line-height: 1.4;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.item-price {
  font-weight: 600;
  color: #b45309;
}

.item-owned {
  color: var(--text-lighter);
}

.buy-btn {
  padding: 8px 16px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  transition: var(--transition-fast);
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.buy-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

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
.modal-enter-from .shop-modal {
  transform: scale(0.85) translateY(20px);
}
.modal-leave-to .shop-modal {
  transform: scale(0.95);
}
</style>
