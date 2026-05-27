<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card ranking-modal">
        <button class="modal-close" @click="$emit('close')">×</button>
        <div class="ranking-header">
          <span class="ranking-icon">🏆</span>
          <h2 class="title-gradient">荣誉排行</h2>
          <p class="ranking-subtitle">全服玩家最高分排名</p>
        </div>

        <div v-if="loading" class="ranking-loading">加载中...</div>

        <div v-else class="ranking-list">
          <div
            v-for="entry in rankingList"
            :key="entry.rank"
            class="ranking-item"
            :class="{
              'top-1': entry.rank === 1,
              'top-2': entry.rank === 2,
              'top-3': entry.rank === 3,
              'is-me': entry.username === currentUsername
            }"
          >
            <div class="rank-badge">
              <span v-if="entry.rank === 1">🥇</span>
              <span v-else-if="entry.rank === 2">🥈</span>
              <span v-else-if="entry.rank === 3">🥉</span>
              <span v-else class="rank-num">{{ entry.rank }}</span>
            </div>
            <div class="rank-info">
              <span class="rank-name">{{ entry.username }}</span>
              <span class="rank-level">第{{ entry.currentLevel }}关</span>
            </div>
            <div class="rank-score">{{ entry.highScore }} 分</div>
          </div>

          <div v-if="rankingList.length === 0" class="ranking-empty">
            暂无排名数据
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useGameStore } from '../stores/game'

const props = defineProps({
  show: Boolean,
  currentUsername: String
})
defineEmits(['close'])

const gameStore = useGameStore()
const rankingList = ref([])
const loading = ref(false)

watch(() => props.show, async (val) => {
  if (val) {
    loading.value = true
    try {
      rankingList.value = await gameStore.fetchRanking()
    } catch {
      rankingList.value = []
    }
    loading.value = false
  }
})
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

.ranking-modal {
  background: white;
  border-radius: 24px;
  padding: 32px 24px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.ranking-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #fbbf24, #a78bfa, #fbbf24);
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

.ranking-header {
  text-align: center;
  margin-bottom: 20px;
}

.ranking-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 8px;
}

.title-gradient {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fbbf24 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.ranking-subtitle {
  font-size: 12px;
  color: var(--text-lighter);
  margin-top: 4px;
}

.ranking-loading {
  text-align: center;
  padding: 40px 0;
  color: var(--text-lighter);
  font-size: 14px;
}

.ranking-list {
  overflow-y: auto;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--bg);
  border: 1px solid var(--border-light);
  transition: var(--transition-fast);
}

.ranking-item.top-1 {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #fde68a;
}

.ranking-item.top-2 {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border-color: #cbd5e1;
}

.ranking-item.top-3 {
  background: linear-gradient(135deg, #fffbeb, #fed7aa);
  border-color: #fdba74;
}

.ranking-item.is-me {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.rank-badge {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.rank-num {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-light);
}

.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rank-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-level {
  font-size: 11px;
  color: var(--text-lighter);
}

.rank-score {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  flex-shrink: 0;
}

.ranking-empty {
  text-align: center;
  padding: 40px 0;
  color: var(--text-lighter);
  font-size: 14px;
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
.modal-enter-from .ranking-modal {
  transform: scale(0.85) translateY(20px);
}
.modal-leave-to .ranking-modal {
  transform: scale(0.95);
}
</style>
