<template>
  <div class="flex flex-col items-center space-y-4 p-3 mb-4 w-full border border-gray-200 rounded-lg">
    <div class="relative w-full h-52 rounded-xl overflow-hidden  bg-gray-300">
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
      <!-- <div class="absolute bottom-0 left-0 right-0 text-white text-xs text-center py-1">
        CURRENTLY UNAVAILABLE
      </div> -->
    </div>

    <div class="flex-1 w-full">
      <div class="text-lg font-semibold text-[#097D4C]">{{ shop.name }}</div>
      <!-- <div class="flex items-center">
        <ion-icon :icon="star" class="text-green-500 w-4 h-4"></ion-icon>
        <span class="text-sm mt-1 font-medium">4.4</span>
        <span class="text-sm mt-1 text-gray-500">(95)</span>
      </div> -->
      <p class="text-sm text-gray-600">{{ shop.description }}</p>
      <p class="text-sm text-gray-500">{{ shop.street }} • {{ (shop.distance / 1000).toFixed(2) }} km</p>

      <!-- <p class="mt-2 text-sm text-red-600">Delivery partners in this area are busy</p> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { star } from 'ionicons/icons';
defineProps({
  shop: {
    type: Object,
    required: true
  }
});
</script>
