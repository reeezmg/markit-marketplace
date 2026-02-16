<template>
  <div class="ion-pad overflow-x-auto no-scrollbar">
    <div class="relative flex space-x-4 px-2 pb-1">
      <div
        v-for="(item, index) in filteredCategories"
        :key="item.value"
        class="flex flex-col items-center flex-shrink-0 cursor-pointer"
        @click="onSelect(item.value, index)"
      >
        <div class="cat-tile" :class="isActive(item.value) ? 'cat-tile--active' : ''">
          <img :src="item.image" alt="" class="w-16 h-16 rounded-md object-contain" />
        </div>

        <span
          class="mt-0.5 text-sm font-medium transition-colors duration-200"
          :class="isActive(item.value) ? 'text-[#53816C]' : 'text-gray-700'"
        >
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, defineProps, defineEmits } from 'vue'
import {
  boysCategory,
  girlsCategory,
  mensCategory,
  womensCategory,
} from './utils/category'

const props = defineProps<{
  selectedCategory: string
}>()

const emit = defineEmits<{
  (e: 'select', value: string): void
}>()

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

const activeValue = ref('all')
const activeIndex = ref(0)

const filteredCategories = computed(() => {
  if (!props.selectedCategory) return categories.value

  return categories.value.filter(
    (cat) => cat.value === 'all' || cat.category === props.selectedCategory
  )
})

function onSelect(value: string, index: number) {
  activeValue.value = value
  activeIndex.value = index

  emit('select', value === 'all' ? '' : value)
  nextTick()
}

function isActive(value: string) {
  return activeValue.value === value
}

watch(filteredCategories, async () => {
  activeIndex.value = 0
  activeValue.value = filteredCategories.value[0]?.value ?? 'all'
  await nextTick()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.cat-tile {
  padding: 6px;
  border-radius: 14px;
  background: var(--markit-glass-surface-strong);
  border: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
  backdrop-filter: blur(14px) saturate(140%);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.cat-tile--active {
  border-color: color-mix(in srgb, var(--ion-color-primary) 58%, #dbe6e1 42%);
  box-shadow: inset 0 1px 0 #ffffff, 0 8px 14px rgba(20, 34, 28, 0.07);
}

span {
  will-change: transform, width;
}
</style>
