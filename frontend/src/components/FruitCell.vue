<template>
  <div class="fruit-cell"
    :class="[cell.state, specialClass, { hinted: cell.hinted }]"
    :style="cellStyle"
    @click="$emit('select', cell.row, cell.col)"
  >
    <span class="fruit-emoji">{{ displayEmoji }}</span>
    <span v-if="cell.special === 'line-h'" class="special-overlay line-h-overlay"></span>
    <span v-if="cell.special === 'line-v'" class="special-overlay line-v-overlay"></span>
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
  width: 80%;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.9), transparent);
  border-radius: 2px;
  bottom: 8px;
}

.line-v-overlay {
  width: 3px;
  height: 80%;
  background: linear-gradient(180deg, transparent, rgba(251, 191, 36, 0.9), transparent);
  border-radius: 2px;
  right: 8px;
}
</style>
