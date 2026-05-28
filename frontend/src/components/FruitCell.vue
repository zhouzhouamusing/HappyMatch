<template>
  <div class="fruit-cell"
    :class="[cell.state, specialClass, { hinted: cell.hinted }]"
    :style="cellStyle"
    @click="$emit('select', cell.row, cell.col)"
  >
    <span class="fruit-emoji">{{ displayEmoji }}</span>
    <span v-if="cell.special === 'line-h'" class="special-overlay line-h-overlay"></span>
    <span v-if="cell.special === 'line-v'" class="special-overlay line-v-overlay"></span>
    <span v-if="cell.special === 'line-h'" class="direction-icon direction-h">⟷</span>
    <span v-if="cell.special === 'line-v'" class="direction-icon direction-v">⟷</span>
    <span v-if="cell.special === 'area'" class="special-overlay area-overlay"></span>
    <span v-if="cell.special === 'area'" class="direction-icon direction-area">✦</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, required: true }
})

defineEmits(['select'])

const displayEmoji = computed(() => {
  if (props.cell.special === 'bomb') return '💫'
  return props.cell.fruit
})

const specialClass = computed(() => {
  if (!props.cell.special) return ''
  return `special-${props.cell.special}`
})

const cellStyle = computed(() => {
  if (props.cell.state === 'dropping' && props.cell.dropDistance) {
    return { '--drop-distance': `-${props.cell.dropDistance}px` }
  }
  return {}
})
</script>

<style scoped>
.fruit-emoji {
  pointer-events: none;
  line-height: 1;
}

.special-overlay {
  position: absolute;
  pointer-events: none;
}

.line-h-overlay {
  width: 85%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(251, 146, 60, 0.95), transparent);
  border-radius: 2px;
  bottom: 8px;
  box-shadow: 0 0 6px rgba(251, 146, 60, 0.6);
}

.line-v-overlay {
  width: 3px;
  height: 85%;
  background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.95), transparent);
  border-radius: 2px;
  right: 8px;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
}

.direction-icon {
  position: absolute;
  font-size: 10px;
  font-weight: bold;
  pointer-events: none;
  opacity: 0.85;
  line-height: 1;
}

.direction-h {
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  color: #ea580c;
  text-shadow: 0 0 3px rgba(251, 146, 60, 0.8);
}

.direction-v {
  top: 2px;
  right: 2px;
  transform: rotate(90deg);
  color: #2563eb;
  text-shadow: 0 0 3px rgba(59, 130, 246, 0.8);
}

.area-overlay {
  width: 80%;
  height: 80%;
  border: 2px dashed rgba(16, 185, 129, 0.6);
  border-radius: 4px;
  box-shadow: 0 0 4px rgba(16, 185, 129, 0.4);
}

.direction-area {
  bottom: 1px;
  right: 2px;
  color: #059669;
  font-size: 11px;
  font-weight: 900;
  text-shadow: 0 0 4px rgba(16, 185, 129, 0.8);
}
</style>
