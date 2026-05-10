<template>
  <div class="shop-card flex flex-col items-center mb-4 w-full border border-gray-200 animate-pulse">
    <div class="shop-media relative w-full h-52 overflow-hidden bg-gray-200">
      <div class="h-full w-full bg-gray-200"></div>
    </div>

    <div class="flex-1 w-full shop-copy p-3">
      <div class="shop-title-skeleton bg-gray-200 rounded"></div>

      <div class="shop-desc-skeleton space-y-2">
        <div class="h-4 w-full bg-gray-200 rounded"></div>
        <div class="h-4 w-5/6 bg-gray-200 rounded"></div>
      </div>

      <div class="shop-meta-skeleton h-4 w-2/3 bg-gray-200 rounded"></div>

      <div class="shop-pill-skeleton mt-2 h-6 w-44 bg-gray-200 rounded-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure loading placeholder that mirrors ShopCard.vue structure.
</script>

<style scoped>
.shop-card {
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  transition: transform 0.2s ease, border-color 0.2s ease;
  backdrop-filter: none;
  background-color: #ffffff;
}

.shop-media {
  border-radius: 16px 16px 0 0;
}

.shop-copy {
  min-height: 132px;
}

.shop-title-skeleton {
  height: 1.25rem;
  width: 72%;
}

.shop-desc-skeleton {
  margin-top: 8px;
}

.shop-meta-skeleton {
  margin-top: 10px;
}

.shop-pill-skeleton {
  display: inline-block;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.55;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>
