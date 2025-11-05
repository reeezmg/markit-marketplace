<template>
  <div class="flex flex-col items-center space-y-4 p-3 mb-4 w-full border border-gray-200 rounded-lg">
    <div class="relative w-full h-52 rounded-xl overflow-hidden bg-gray-300">
      <img
        v-if="shop.logo"
        :src="`https://images.markit.co.in/${shop.logo}`"
        :alt="shop.name"
        class="w-full h-full object-fill"
      />
      <img
        v-else
        src="/shop.png"
        :alt="shop.name"
        class="w-full h-full object-cover"
      />
    </div>

    <div class="flex-1 w-full">
      <div class="text-lg font-semibold text-[#097D4C]">{{ shop.name }}</div>
      <p class="text-sm text-gray-600">{{ shop.description }}</p>
      <p class="text-sm text-gray-500">
        {{ shop.street }} • {{ (shop.road_distance / 1000).toFixed(2) }} km
      </p>

      <!-- ✅ Show only when store already exists in nearby list -->
      <p
        v-if="canBeAddedToExisting"
        class="mt-2 text-sm font-medium text-green-600"
      >
         Can be added to existing cart
      </p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { IonIcon } from '@ionic/vue'
import { star } from 'ionicons/icons'
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

