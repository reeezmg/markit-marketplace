<template>
  <li
    v-if="hasAnyStock"
    class="variant-card col-span-1 bg-white flex flex-col rounded-lg overflow-hidden border border-gray-200 hover:shadow-[0_6px_20px_rgba(10,10,10,0.08)] transition-transform duration-200 transform hover:-translate-y-1 relative cursor-pointer group"
    @click="navigateToProduct" :class="{ 'opacity-60 pointer-events-none': isOutOfStock }">
    <!-- Out of Stock overlay -->
    <div v-if="isOutOfStock" class="absolute inset-0 z-30 flex items-center justify-center bg-white/85">
      <span class="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
        Out of Stock
      </span>
    </div>

    <!-- Image area -->
    <div class="relative w-full aspect-[4/5] bg-gray-50 overflow-hidden">
      <!-- badges -->
      <div class="absolute top-3 left-3 z-20 flex flex-col gap-2">
        <Badge v-if="variant.isNew" color="primary" variant="subtle" size="sm"
          class="rounded-full text-xs font-semibold px-2 py-1">
          New
        </Badge>
      </div>

      <div v-if="variant.discount > 0" class="absolute top-3 right-3 z-20">
        <div class="bg-red-600 text-white text-[11px] font-semibold px-2 py-1 rounded-full">
          {{ Math.round(variant.discount) }}% OFF
        </div>
      </div>

      <!-- image (cover, zoom on hover) -->
      <img v-if="variant.images?.length" :src="imageUrl(variant.images[0])" @error="onError"
        :alt="`${variant.productName ?? ''} - ${variant.name}`"
        class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy" />
    </div>

    <!-- info -->
    <div class="variant-card-body px-3 pt-2 pb-1 flex flex-col gap-1 flex-1">
      <div class="variant-title line-clamp-2">
        <span class="text-sm text-gray-500 ">
          {{ formatLabel(variant.brandName) }}
        </span>
        <span class="variant-title-main">
          {{ formatLabel(variant.productName) }}
        </span>
        <!-- <span v-if="variant.productName && variant.name" class="variant-title-sub">
            ({{ formatLabel(variant.name) }})
          </span> -->
      </div>


      <div class="variant-price-row flex items-center justify-between mt-auto">
        <div>
          <template v-if="variant.discount <= 0">
            <div class="variant-price-main">
              {{ formatPrice(variant.sprice) }}
            </div>
          </template>
          <template v-else>
            <div class="variant-price-group">
              <div class="variant-price-strike">
                {{ formatPrice(variant.sprice) }}
              </div>
              <div class="variant-price-main variant-price-main--discount">
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
    <div class="flex items-center py-2 border-t border-gray-100 bg-white">

      <!-- LIKE BUTTON -->
      <button type="button"
        class="flex-1 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors"
        @click.stop="toggleLike" aria-label="like">
        <IonIcon :icon="isLiked ? heart : heartOutline" class="w-5 h-5"
          :class="isLiked ? 'text-red-500' : 'text-gray-400'" />
        <span class="sr-only">like</span>
      </button>

      <!-- ✅ VERTICAL DIVIDER -->
      <div class="w-px self-stretch bg-gray-200"></div>

      <!-- CART BUTTON -->
      <button type="button"
        class="flex-1 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-[#097D4C] transition-colors"
        @click.stop="addToCart" aria-label="add to cart">
        <IonIcon :icon="cartOutline" class="w-5 h-5" />
        <span class="sr-only">add to cart</span>
      </button>

    </div>


    <!-- Size selector modal -->
    <SizeSelector :isOpen="isSizeSelectorOpen" :sizes="sizes" @close="isSizeSelectorOpen = false"
      @select-sizes="handleSizeSelect" />
  </li>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useIonRouter, toastController } from '@ionic/vue';
import SizeSelector from '@/components/SizeSelector.vue';
import Badge from '@/components/Badge.vue';
import { useCartStore } from '@/store/useCartStore';
import { useLikeStore } from '@/store/useLikeStore';
import { IonIcon } from '@ionic/vue';
import { heart, heartOutline, cartOutline } from 'ionicons/icons';
import { getCartQuantity, getVariantAvailableQty, reconcileCartStock } from '@/utils/cartStock';

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

const emit = defineEmits(["imageError"]);

function onError() {
  emit("imageError");
}

const props = defineProps<{ variant: Variant }>();

const router = useIonRouter();
const cartStore = useCartStore();
const likeStore = useLikeStore();
likeStore.loadLikes();

const isLiked = computed(() => likeStore.isLiked(props.variant.id));
const isSizeSelectorOpen = ref(false);
const sizes = ref<string[]>([]);

const stockItems = computed(() => props.variant.items ?? []);
const hasAnyStock = computed(() =>
  !props.variant.outOfStock &&
  stockItems.value.some((item) => Number(item.qty || 0) > 0)
);
const isOutOfStock = computed(() => !hasAnyStock.value);
const availableSizeItems = computed(() =>
  stockItems.value.filter((item) => item.size && Number(item.qty || 0) > 0)
);

const imageUrl = (imgPath: string) => {
  // keep your image base logic intact
  if (!imgPath) return '';
  return imgPath.startsWith('http') ? imgPath : `https://images.markit.co.in/${imgPath}`;
};

const formatPrice = (p: number) => {
  if (p == null) return '';
  return `₹${Number(p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatLabel = (value?: string | null) => {
  if (!value) return '';

  return value
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
        .join('-')
    )
    .join(' ');
};

const navigateToProduct = () => {
  router.push({ name: 'product', params: { variantId: props.variant.id } });
};

const toggleLike = () => {
  likeStore.toggleLike(props.variant);
};

const addToCart = async () => {
  const items = stockItems.value

  if (!hasAnyStock.value) {
    await showToast('Out of stock', 'danger', 'top')
    return
  }

  if (
    items.length > 1 ||
    (items.length === 1 && items[0].size)
  ) {
    sizes.value = Array.from(new Set(
      availableSizeItems.value
        .map(i => i.size)
        .filter(Boolean) as string[]
    ))

    if (!sizes.value.length) {
      await showToast('Out of stock', 'danger', 'top')
      return
    }

    isSizeSelectorOpen.value = true
  } else {
    if (!canAddSize(null)) {
      await showToast('Out of stock', 'danger', 'top')
      return
    }

    const res = await cartStore.addItem(
      props.variant,
      [null]
    )

    await showToast(
      res?.message || 'Product added to cart',
      res?.success ? 'success' : 'danger',
      'bottom'
    )

    if (res?.success) await validateAfterAdd()
  }
}

const handleSizeSelect = async (
  selectedSizes: string[]
) => {
  if (!selectedSizes || selectedSizes.length === 0)
    return

  const unavailableSize = selectedSizes.find((size) => !canAddSize(size))
  if (unavailableSize !== undefined) {
    await showToast(`${formatLabel(unavailableSize)} is out of stock`, 'danger', 'top')
    return
  }

  const res = await cartStore.addItem(
    props.variant,
    selectedSizes
  )

  await showToast(
    res?.message || 'Product added to cart',
    res?.success ? 'success' : 'danger',
    'bottom'
  )

  if (res?.success) await validateAfterAdd()
}

function canAddSize(size: string | null) {
  return getCartQuantity(cartStore, props.variant.id, size) + 1 <=
    getVariantAvailableQty(props.variant, size)
}

async function showToast(
  message: string,
  color: 'success' | 'danger' | 'warning',
  position: 'top' | 'bottom' = 'bottom'
) {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position,
    cssClass: `markit-toast ${color === 'success' ? 'markit-toast-success' : 'markit-toast-warning'}`
  })

  await toast.present()
}

async function validateAfterAdd() {
  try {
    const messages = await reconcileCartStock(cartStore)
    if (!messages.length) return
    await showToast(messages[0], 'warning', 'top')
  } catch (error) {
    console.error('Failed to validate cart stock', error)
  }
}


</script>

<style scoped>
/* small helper for line-clamp for browsers that don't have native utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.variant-card {
  border-color: var(--markit-border);
  border-radius: var(--markit-radius-lg);
  background: var(--markit-surface);
}

.variant-card-body {
  gap: 6px;
}

.variant-title {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}



.variant-title-sub {
  color: var(--markit-text-muted);
  font-weight: 500;
}

.variant-price-main {
  font-size: 1rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--markit-text);
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.variant-price-main--discount {
  color: #2d5444;
}

.variant-price-group {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 8px;
}

.variant-price-strike {
  font-size: 0.8rem;
  line-height: 1.2;
  color: var(--markit-text-muted);
  text-decoration: line-through;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
