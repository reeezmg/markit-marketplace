<template>
  <li
    class="col-span-1 bg-white flex flex-col rounded-lg overflow-hidden border border-gray-200 hover:shadow-[0_6px_20px_rgba(10,10,10,0.08)] transition-transform duration-200 transform hover:-translate-y-1 relative cursor-pointer group"
    @click="navigateToProduct"
    :class="{ 'opacity-60 pointer-events-none': variant.outOfStock }"
  >
    <!-- Out of Stock overlay -->
    <div
      v-if="variant.outOfStock"
      class="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-gray-900/80"
    >
      <span class="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        Out of Stock
      </span>
    </div>

    <!-- Image area -->
    <div class="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
      <!-- badges -->
      <div class="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <Badge
          v-if="variant.isNew"
          color="primary"
          variant="subtle"
          size="sm"
          class="rounded-full text-xs font-semibold px-2 py-1"
        >
          New
        </Badge>
      </div>

      <div v-if="variant.discount > 0" class="absolute top-3 right-3 z-20">
        <div class="bg-red-600 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
          {{ Math.round(variant.discount) }}% OFF
        </div>
      </div>

      <!-- image (cover, zoom on hover) -->
      <img
        v-if="variant.images?.length"
        :src="imageUrl(variant.images[0])"
        :alt="`${variant.productName ?? ''} - ${variant.name}`"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>

      <!-- info -->
      <div class="px-3 pt-2 pb-1 flex flex-col gap-1 flex-1">
        <div class="text-[13px] leading-tight line-clamp-2">
    <span class="text-gray-700 font-medium">
      {{ variant.name }}
    </span>
        <span  v-if="variant.productName" class="text-gray-500 font-medium">
      ({{ variant.productName }})
    </span>
  </div>


      <div class="flex items-center justify-between mt-auto">
        <div>
          <template v-if="variant.discount <= 0">
            <div class="text-[15px] font-semibold text-gray-900">
              {{ formatPrice(variant.sprice) }}
            </div>
          </template>
          <template v-else>
            <div class="flex items-baseline gap-2">
              <div class="text-[12px] text-gray-400 line-through">
                {{ formatPrice(variant.sprice) }}
              </div>
              <div class="text-[15px] font-bold text-[#097D4C]">
                {{ formatPrice(variant.dprice) }}
              </div>
            </div>
          </template>
        </div>

        <!-- small company / rating placeholder (optional) -->
        <div class="text-xs text-gray-400">
          <!-- you can render brand here -->
        </div>
      </div>
    </div>

    <!-- actions -->
    <div class="flex items-center justify-between py-2 border-t border-gray-100 bg-white">
      <button
        type="button"
        class="w-1/2 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
        @click.stop="toggleLike"
        aria-label="like"
      >
        <IonIcon :icon="isLiked ? heart : heartOutline" class="w-5 h-5" :class="isLiked ? 'text-red-500' : 'text-gray-400 group-hover:text-red-500'" />
        <span class="sr-only">like</span>
      </button>

      <button
        type="button"
        class="w-1/2 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#097D4C] transition-colors border-l border-gray-100"
        @click.stop="addToCart"
        aria-label="add to cart"
      >
        <IonIcon :icon="cartOutline" class="w-5 h-5" />
        <span class="sr-only">add to cart</span>
      </button>
    </div>

    <!-- Size selector modal -->
    <SizeSelector
      :isOpen="isSizeSelectorOpen"
      :sizes="sizes"
      @close="isSizeSelectorOpen = false"
      @select-sizes="handleSizeSelect"
    />
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SizeSelector from '@/components/SizeSelector.vue';
import Badge from '@/components/Badge.vue';
import { useCartStore } from '@/store/useCartStore';
import { useLikeStore } from '@/store/useLikeStore';
import { IonIcon } from '@ionic/vue';
import { heart, heartOutline, cartOutline } from 'ionicons/icons';

type Variant = {
  id: string;
  name: string;
  productName?: string | null;
  images?: string[];
  sprice: number;
  dprice: number;
  discount: number;
  isNew?: boolean;
  outOfStock?: boolean;
  items?: { id?: string; size?: string; qty?: number }[];
  variants?: { id: string; label?: string; image?: string | null }[];
};

const props = defineProps<{ variant: Variant }>();

const router = useRouter();
const cartStore = useCartStore();
const likeStore = useLikeStore();
likeStore.loadLikes();

const isLiked = computed(() => likeStore.isLiked(props.variant.id));
const isSizeSelectorOpen = ref(false);
const sizes = ref<string[]>([]);

const imageUrl = (imgPath: string) => {
  // keep your image base logic intact
  if (!imgPath) return '';
  return imgPath.startsWith('http') ? imgPath : `https://images.markit.co.in/${imgPath}`;
};

const formatPrice = (p: number) => {
  if (p == null) return '';
  return `₹${Number(p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const navigateToProduct = () => {
  router.push(`/product/${props.variant.id}`);
};

const toggleLike = () => {
  likeStore.toggleLike(props.variant);
};

const addToCart = () => {
  // preserve original logic: open size selector only when necessary
  const items = props.variant.items ?? [];
  if (items.length > 1 || (items.length === 1 && items[0].size)) {
    sizes.value = items.map(i => i.size).filter(Boolean) as string[];
    isSizeSelectorOpen.value = true;
  } else {
    cartStore.addItem(props.variant, [null]);
  }
};

const handleSizeSelect = (selectedSizes: string[]) => {
  if (!selectedSizes || selectedSizes.length === 0) return;
  cartStore.addItem(props.variant, selectedSizes);
};
</script>

<style scoped>
/* small helper for line-clamp for browsers that don't have native utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
