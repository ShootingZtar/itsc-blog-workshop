<script setup lang="ts">
import MainLogo from '@/components/MainLogo.vue'
</script>

<template>
  <div class="bg-[#EDE7F6] min-h-[100vh] ">
    <div class="bg-white w-full">
      <RouterLink to="/" class="text-xl font-bold text-white">
        <MainLogo />
      </RouterLink>
    </div>
    <div class="container mx-auto p-8">
      <RouterView />
    </div>
  </div>
</template>
