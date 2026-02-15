<template>
  <div class="shop-card flex flex-col items-center space-y-4 p-3 mb-4 w-full border border-gray-200 rounded-lg">
    <div class="shop-media relative w-full h-52 rounded-xl overflow-hidden bg-gray-200">
      <img
        v-if="shop.logo"
        :src="`https://images.markit.co.in/${shop.logo}`"
        :alt="shop.name"
        class="w-full h-full object-cover"
      />
      <img
        v-else
        src="/shop.png"
        :alt="shop.name"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex-1 w-full shop-copy">
      <div class="shop-title">{{ shop.name }}</div>
      <p class="shop-desc">{{ shop.description }}</p>
      <p class="shop-meta">
        {{ shop.street }} • {{ (shop.road_distance / 1000).toFixed(2) }} km
      </p>

      <!-- ✅ Show only when store already exists in nearby list -->
      <p v-if="canBeAddedToExisting" class="shop-pill mt-2">
         Can be added to existing cart
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useNearbyStore } from '@/store/useNearbyStore'
import { computed } from 'vue'

const props = defineProps({
  shop: {
    type: Object,
    required: true,
  },
})

const nearbyStore = useNearbyStore()

const canBeAddedToExisting = computed(() =>
  nearbyStore.isNearbyCompany(props.shop.id)
)
</script>

<style scoped>
.shop-card {
  background: var(--markit-glass-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  transition: transform 0.2s ease, border-color 0.2s ease;
  backdrop-filter: none;
}

.shop-card:active {
  transform: scale(0.99);
}

.shop-media {
  border-radius: 16px;
}

.shop-title {
  font-size: 1.18rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--markit-text);
  letter-spacing: 0.2px;
}

.shop-desc {
  margin-top: 4px;
  font-size: 0.92rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shop-meta {
  margin-top: 6px;
  font-size: 0.84rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}

.shop-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  line-height: 1.3;
  font-weight: 600;
  letter-spacing: 0.1px;
  background: rgba(63, 107, 84, 0.12);
  color: #2e6b4e;
}

@media (min-width: 720px) {
  .shop-card {
    padding: 16px;
  }
}
</style>

