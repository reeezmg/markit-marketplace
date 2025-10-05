<template>
  <div class="w-full overflow-x-auto no-scrollbar">
    <div class="flex space-x-4 px-2">
      <div
        v-for="item in categories"
        :key="item.value"
        class="flex flex-col items-center flex-shrink-0 cursor-pointer"
        @click="onSelect(item.value)"
      >
        <img
          :src="item.image"
          alt=""
          class="w-20 h-20 rounded-full object-contain p-2 border-2 border-gray-200"
        />
        <span class="mt-2 text-sm font-medium text-gray-700">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, ref } from 'vue'

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

// JSON Data
const categories = ref([
  {
    label: 'All',
    value: 'all',
    image: '/images/categories/all.png',
  },
  {
    label: 'Tshirt',
    value: 'tshirt',
    image: '/images/categories/tshirt.png',
  },
  {
    label: 'Shirt',
    value: 'shirt',
    image: '/images/categories/shirt.png',
  },
  {
    label: 'Gowen',
    value: 'gowen',
    image: '/images/categories/gowen.png',
  },
  {
    label: 'Kurta',
    value: 'kurta',
    image: '/images/categories/kurta.png',
  },
  {
    label: 'Sneakers',
    value: 'sneakers',
    image: '/images/categories/sneakers.png',
  },
  {
    label: 'Heels',
    value: 'heels',
    image: '/images/categories/heels.png',
  },
  {
    label: 'Handbags',
    value: 'handbags',
    image: '/images/categories/handbags.png',
  },
  {
    label: 'Necklace',
    value: 'necklace',
    image: '/images/categories/necklace.png',
  },
])

function onSelect(value: string) {
  // Reset if "all" is clicked
  if (value === 'all') {
    emit('select', '') // send empty to reset searchTerm
  } else {
    emit('select', value)
  }
}
</script>


<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.no-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
