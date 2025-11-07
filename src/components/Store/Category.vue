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
  // 👕 Tops
  {
    label: 'T Shirt',
    value: 't_shirt',
    image: '/images/categories/men/t_shirt.png',
    category: 'men',
  },
   {
    label: 'Polo',
    value: 'polo',
    image: '/images/categories/men/polo.png',
    category: 'men',
  },
  {
    label: 'Casual Shirt',
    value: 'casual_shirt',
    image: '/images/categories/men/casual_shirt.png',
    category: 'men',
  },
  {
    label: 'Formal Shirt',
    value: 'formal_shirt',
    image: '/images/categories/men/formal_shirt.png',
    category: 'men',
  },
  {
    label: 'Hoodie',
    value: 'hoodie',
    image: '/images/categories/men/hoodie.png',
    category: 'men',
  },
  
  {
    label: 'Jacket',
    value: 'jacket',
    image: '/images/categories/men/jacket.png',
    category: 'men',
  },
  {
    label: 'Kurta',
    value: 'kurta',
    image: '/images/categories/men/kurta.png',
    category: 'men',
  },
  {
    label: 'Inner Wear',
    value: 'inner_wear',
    image: '/images/categories/men/inner_wear.png',
    category: 'men',
  },

  // 👖 Bottoms
  {
    label: 'Jeans',
    value: 'jeans',
    image: '/images/categories/men/jeans.png',
    category: 'men',
  },
  {
    label: 'Casual Pant',
    value: 'casual_pant',
    image: '/images/categories/men/casual_pant.png',
    category: 'men',
  },
  {
    label: 'Formal Pant',
    value: 'formal_pant',
    image: '/images/categories/men/formal_pant.png',
    category: 'men',
  },
  {
    label: 'Shorts',
    value: 'shorts',
    image: '/images/categories/men/shorts.png',
    category: 'men',
  },


  // 👟 Footwear (Casual → Formal → Ethnic → Open)
   {
    label: 'Slipper',
    value: 'slipper',
    image: '/images/categories/men/slipper.png',
    category: 'men',
  },
  {
    label: 'Casual Shoe',
    value: 'casual_shoe',
    image: '/images/categories/men/casual_shoe.png',
    category: 'men',
  },
  {
    label: 'Sports Shoe',
    value: 'sports_shoe',
    image: '/images/categories/men/sports_shoe.png',
    category: 'men',
  },
  {
    label: 'Formal Shoe',
    value: 'formal_shoe',
    image: '/images/categories/men/formal_shoe.png',
    category: 'men',
  },
  {
    label: 'Loafer',
    value: 'loafer',
    image: '/images/categories/men/loafer.png',
    category: 'men',
  },
 
  {
    label: 'Sports Sandal',
    value: 'sports_sandal',
    image: '/images/categories/men/sports_sandal.png',
    category: 'men',
  },
  {
    label: 'Formal Sandal',
    value: 'formal_sandal',
    image: '/images/categories/men/formal_sandal.png',
    category: 'men',
  },
  {
    label: 'Ethnic Sandal',
    value: 'ethnic_sandal',
    image: '/images/categories/men/ethnic_sandal.png',
    category: 'men',
  },
  {
    label: 'Open Shoe',
    value: 'open_shoe',
    image: '/images/categories/men/open_shoe.png',
    category: 'men',
  },
  {
    label: 'Clogs',
    value: 'clogs',
    image: '/images/categories/men/clogs.png',
    category: 'men',
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
