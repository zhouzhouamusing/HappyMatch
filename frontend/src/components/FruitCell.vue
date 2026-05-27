<template>
  <div class="fruit-cell"
    :class="[cell.state]"
    :style="cellStyle"
    @click="$emit('select', cell.row, cell.col)"
  >
    <span class="fruit-emoji">{{ cell.fruit }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cell: { type: Object, required: true }
})

defineEmits(['select'])

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
</style>
