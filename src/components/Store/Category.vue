<template>
  <div class="w-full overflow-x-auto no-scrollbar">
    <div class="flex space-x-4 px-2">
      <div
        v-for="item in filteredCategories"
        :key="item.value"
        class="flex flex-col items-center flex-shrink-0 cursor-pointer"
        @click="onSelect(item.value)"
      >
        <img
          :src="item.image"
          alt=""
          class="w-20 h-20 rounded-full object-contain border-1 border-gray-200"
        />
        <span class="mt-2 text-sm font-medium text-gray-700">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, ref, computed } from 'vue'

const props = defineProps<{
  selectedCategory: string
}>()

const filteredCategories = computed(() => {
  const allCategory = categories.value.find(cat => cat.value === 'all');
  const filtered = categories.value.filter(cat => 
    cat.value === 'all' || cat.category === props.selectedCategory
  );
  return props.selectedCategory ? filtered : categories.value;
});

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

// JSON Data
const categories = ref([
  {
    label: 'All',
    value: 'all',
    image: '/images/categories/all.png',
    category: 'all',
  },
  {
    label: 'Tshirt',
    value: 'tshirt',
    image: '/images/categories/T-shirt.png',
    category: 'men',

  },
  {
    label: 'Shirt',
    value: 'shirt',
    image: '/images/categories/shirt.png',
    category: 'men',
  },
  {
    label: 'Gowen',
    value: 'gowen',
    image: '/images/categories/gowen.png',
     category: 'women',
  },
  {
    label: 'Kurta',
    value: 'kurta',
    image: '/images/categories/kurta.png',
    category: 'women',
  },
  {
    label: 'Sneakers',
    value: 'sneakers',
    image: '/images/categories/sneakers.png',
    category: 'men',
  },
  {
    label: 'Sneakers',
    value: 'sneakers',
    image: '/images/categories/sneakers.png',
    category: 'women',
  },
  {
    label: 'Heels',
    value: 'heels',
    image: '/images/categories/heels.png',
    category: 'women',
  },
  {
    label: 'Handbags',
    value: 'handbags',
    image: '/images/categories/handbags.png',
    category: 'women',
  },
  {
    label: 'Necklace',
    value: 'necklace',
    image: '/images/categories/necklace.png',
    category: 'women',
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
