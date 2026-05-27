<template>
  <AnimatedBackground />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
</template>

<script setup>
import AnimatedBackground from './components/AnimatedBackground.vue'
</script>
