<template>
  <div
    class="flex flex-col items-center space-y-4 p-3 mb-4 w-full border border-gray-200 rounded-lg animate-pulse"
  >
    <!-- Image Skeleton -->
    <div class="relative w-full h-52 rounded-xl overflow-hidden bg-gray-200"></div>

    <!-- Text Skeletons -->
    <div class="flex-1 w-full space-y-2">
      <!-- Shop Name -->
      <div class="h-5 w-3/4 bg-gray-200 rounded"></div>

      <!-- Description -->
      <div class="h-4 w-full bg-gray-200 rounded"></div>
      <div class="h-4 w-5/6 bg-gray-200 rounded"></div>

      <!-- Location/Distance -->
      <div class="h-4 w-2/3 bg-gray-200 rounded"></div>

      <!-- Optional Existing Cart Text -->
      <div class="h-4 w-1/2 bg-gray-200 rounded mt-2"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No props or logic needed — purely visual skeleton placeholder
</script>

<style scoped>
/* Slight shimmering effect */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
