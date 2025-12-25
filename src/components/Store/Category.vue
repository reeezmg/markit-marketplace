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
          class=" w-16 h-16 rounded-md object-contain "
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
import { boysCategory, girlsCategory, mensCategory, womensCategory } from './utils/category'

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
    image: '/images/all.jpg',
    category: 'all',
  },
   ...mensCategory,
    ...womensCategory,
    ...girlsCategory,
    ...boysCategory,
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
