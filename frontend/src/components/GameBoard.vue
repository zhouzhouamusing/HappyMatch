<template>
  <div class="game-board">
    <FruitCell
      v-for="cell in flatGrid"
      :key="cell.id"
      :cell="cell"
      @select="(r, c) => $emit('select', r, c)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import FruitCell from './FruitCell.vue'

const props = defineProps({
  grid: { type: Array, required: true }
})

defineEmits(['select'])

const flatGrid = computed(() => {
  return props.grid.flat()
})
</script>
