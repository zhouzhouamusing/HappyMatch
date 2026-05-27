<template>
  <div class="page-bg"></div>
  <div class="floating-fruits" ref="container">
    <span
      v-for="item in particles"
      :key="item.id"
      class="floating-fruit"
      :style="item.style"
    >{{ item.emoji }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const EMOJIS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🫐', '🍑', '🍒', '🌟', '💫']
const container = ref(null)
const particles = ref([])

onMounted(() => {
  for (let i = 0; i < 15; i++) {
    particles.value.push(createParticle(i))
  }
})

function createParticle(id) {
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const left = Math.random() * 100
  const duration = 12 + Math.random() * 18
  const delay = Math.random() * duration
  const size = 18 + Math.random() * 14

  return {
    id,
    emoji,
    style: {
      left: `${left}%`,
      fontSize: `${size}px`,
      animationDuration: `${duration}s`,
      animationDelay: `-${delay}s`
    }
  }
}
</script>
