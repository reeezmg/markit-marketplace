<template>
  <li
    class="col-span-1 bg-white flex flex-col divide-y divide-gray-200 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md overflow-hidden cursor-pointer transition-all duration-200 group relative"
    @click="navigateToProduct"
    :class="{ 'opacity-70': variant.outOfStock }"
  >
    <!-- Out of Stock Overlay -->
    <div 
      v-if="variant.outOfStock"
      class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 z-20 flex items-center justify-center"
    >
      <span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
        Out of Stock
      </span>
    </div>

    <!-- Image Container -->
    <div class="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
      <!-- Badges -->
      <div class="absolute top-2 left-2 z-10 flex flex-col space-y-1">
        <Badge
          v-if="variant.isNew"
          color="primary"
          variant="subtle"
          size="sm"
          class="font-bold rounded-full"
        >
          New
        </Badge>
      </div>

      <!-- Discount Badge -->
      <Badge
        v-if="variant.discount > 0"
        color="danger"
        variant="subtle"
        size="sm"
        class="absolute top-2 right-2 z-10 font-bold rounded-full"
      >
        {{ variant.discount }}% OFF
      </Badge>

      <!-- Product Image -->
      <img
        v-if="variant.images?.length"
        :src="`https://images.markit.co.in/${variant.images[0]}`"
        class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 bg-white"
        :alt="`${variant.productName} - ${variant.name}`"
       
      />
    </div>

    <!-- Product Info -->
    <div class="flex flex-col p-2 space-y-1 flex-grow">
      <div class="text-md font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight">
        {{ variant.productName }}
      </div>

      <!-- Price -->
      <div class="mt-1">
        <template v-if="variant.discount <= 0">
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {{ formatPrice(variant.sprice) }}
          </span>
        </template>
        <template v-else>
          <div class="flex items-baseline gap-1">
            <span class="text-xs text-gray-500 dark:text-gray-400 line-through">
              {{ formatPrice(variant.sprice) }}
            </span>
            <span class="text-sm font-semibold text-primary-600 dark:text-primary-400">
              {{ formatPrice(variant.dprice) }}
            </span>
          </div>
        </template>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex divide-x divide-gray-200 border-t border-gray-200">
      <!-- Like Button -->
      <div
        class="flex-1 py-3 flex items-center justify-center text-xs text-gray-700 transition-colors"
        @click.stop="toggleLike"
      >
        <ion-icon
          :icon="isLiked ? heart : heartOutline"
          class="w-5 h-5"
          :class="isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'"
        > {{ isLiked ? 'Liked' : 'Add to Like' }}</ion-icon>
      </div>

      <!-- Add to Cart Button -->
      <div
        class="flex-1 py-3 flex items-center justify-center text-xs text-gray-700 transition-colors"
        @click.stop="addToCart"
      >
        <ion-icon
          :icon="cartOutline"
          class="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
        />
      </div>
    </div>

    <SizeSelector
      :isOpen="isSizeSelectorOpen"
      :sizes="sizes"
      @close="isSizeSelectorOpen = false"
      @select-sizes="handleSizeSelect"
    />
  </li>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import SizeSelector from '@/components/SizeSelector.vue'   // ✅ import modal
import { useCartStore } from '@/store/useCartStore'
import { useLikeStore } from '@/store/useLikeStore'
import { useRouter } from 'vue-router'
import { heart, heartOutline, cartOutline } from 'ionicons/icons'
import Badge from '@/components/Badge.vue'
import { IonIcon } from '@ionic/vue'

type variant = {
  id: string;
  name: string;
  productName: string | null;
  images: string[]; // assuming images are stored as string URLs
  sprice: number;
  dprice: number;
  discount: number;
  isNew: boolean;
  outOfStock: boolean;
  items: {
    size: string;
    qty: number;
  }[];
  variants: {
    id: string;
    label: string;
    image: string | null;
  }[];
};


const props = defineProps<{
  variant: variant
}>()

const router = useRouter()
const cartStore = useCartStore()
const likeStore = useLikeStore()
likeStore.loadLikes()

const isLiked = computed(() => likeStore.isLiked(props.variant.id))
const formatPrice = (price: number) => `₹${price.toFixed(2)}`

const isSizeSelectorOpen = ref(false) // ✅ modal state
const sizes = ref<string[]>([])       // ✅ dynamic sizes for modal

const navigateToProduct = () => {
  // localStorage.setItem('product', JSON.stringify(props.variant))
  router.push(`/product/${props.variant.id}`)
}

const toggleLike = () => {
  likeStore.toggleLike(props.variant)
}
const addToCart = () => {
  // If variant has more than 1 item OR a single item with a valid size → open size selector
  if (props.variant.items.length > 1 || (props.variant.items.length === 1 && props.variant.items[0].size)) {
    // ✅ keep both size and qty so we can display stock later
    sizes.value = props.variant.items.map((i: any) => i.size).filter(Boolean)
    isSizeSelectorOpen.value = true
  } else {
    console.log(props.variant)
    // No size choice needed, add directly (size = null)
    cartStore.addItem(props.variant, [null])
  }
}

// ✅ now expect an array of sizes from SizeSelector
const handleSizeSelect = (selectedSizes: string[]) => {
  console.log(selectedSizes)
  if (!selectedSizes.length) return
  cartStore.addItem(props.variant, selectedSizes)
}

</script>