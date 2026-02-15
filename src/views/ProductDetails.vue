<template>
  <ion-page>
    <ion-header class="ion-no-border details-header">
      <div class="details-topbar-shell">
        <div class="details-topbar-row">
          <ion-buttons slot="start">
            <ion-button fill="clear" class="markit-back-btn" @click="goBack" aria-label="Go back">
              <ion-icon :icon="arrowBackOutline" />
            </ion-button>
          </ion-buttons>

          <div class="details-head-actions">
            <button @click="goWishlist" class="details-head-icon-btn" aria-label="Open wishlist">
              <ion-icon
                :icon="heartOutline"
                class="details-head-icon"
                :style="{ color: '#2d5444' }"
              ></ion-icon>
            </button>

            <button @click="$router.push({ name: 'cart' })" class="relative details-head-icon-btn">
              <ion-icon :icon="cartOutline" class="details-head-icon"></ion-icon>
              <ion-badge
                v-if="totalCartCount > 0"
                class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
              >
                {{ totalCartCount }}
              </ion-badge>
            </button>
          </div>
        </div>
      </div>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding details-page">
      <div v-if="loading" class="flex justify-center items-center h-[70vh]">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <div v-else class="p-4 details-body">
        <swiper
          :slides-per-view="1"
          :loop="true"
          :pagination="{ clickable: true }"
          class="details-swiper"
        >
          <swiper-slide v-for="(img, index) in selectedVariant?.images" :key="index">
            <img
              :src="`https://images.markit.co.in/${img}`"
              alt="Product Image"
              class="w-full h-full object-cover"
              @click="openImageViewer(index)"
            />
          </swiper-slide>
        </swiper>

        <div class="mt-4 space-y-3">
          <h3 class="details-product-title">
            {{ detailsTitle }}
          </h3>

          <div class="flex items-center gap-3">
            <span class="details-price-main"> ₹{{ selectedVariant?.dprice }} </span>

            <span v-if="selectedVariant?.discount > 0" class="details-price-strike">
              ₹{{ selectedVariant?.sprice }}
            </span>

            <Badge v-if="selectedVariant?.discount > 0" color="danger" variant="subtle" size="md">
              {{ selectedVariant?.discount }}% OFF
            </Badge>
          </div>
        </div>

        <div v-if="selectedVariant?.items?.length" class="mt-6">
          <div class="flex justify-between items-center">
            <div class="details-size-title">Select Sizes</div>
            <button class="details-size-guide">Size Guide</button>
          </div>

          <div class="p-3 details-sizes-card">
            <div class="flex flex-wrap gap-3">
              <div
                v-for="item in selectedVariant.items"
                :key="item.id"
                class="size-chip-wrap"
                :class="{ 'size-chip-wrap--oos': item.qty === 0 }"
              >
                <ion-button
                  class="size-chip-btn"
                  shape="round"
                  size="small"
                  :color="selectedSizes.includes(item.size) ? 'primary' : 'medium'"
                  :fill="selectedSizes.includes(item.size) ? 'solid' : 'outline'"
                  @click="toggleSize(item.size)"
                  :disabled="item.qty === 0"
                >
                  {{ formatSizeLabel(item.size) }}
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-modal :is-open="isImageViewerOpen" @didDismiss="isImageViewerOpen = false" class="full-image-modal">
      <div class="relative w-full h-full bg-black flex items-center justify-center">
        <button class="absolute top-5 right-5 z-50 backdrop-blur-md p-2 rounded-full" @click="isImageViewerOpen = false">
          <ion-icon :icon="closeOutline" class="text-white text-3xl"></ion-icon>
        </button>

        <swiper :slides-per-view="1" :loop="true" class="w-full h-full">
          <swiper-slide v-for="(img, index) in selectedVariant?.images" :key="index">
            <img :src="`https://images.markit.co.in/${img}`" class="w-full h-full object-contain" />
          </swiper-slide>
        </swiper>
      </div>
    </ion-modal>

    <ion-footer v-if="!loading" class="details-footer ion-no-border">
      <div class="grid grid-cols-[5fr_1fr] gap-3 p-3 w-full">
        <ion-button class="flex-1 details-action-btn cart-btn" @click="addToCart">
          <ion-icon class="me-2" slot="start" :icon="cartOutline"></ion-icon>
          Add to Cart
        </ion-button>

        <ion-button class="flex-1 details-icon-action-btn wishlist-btn" @click="toggleLike">
          <ion-icon
            class="p-0 details-wishlist-icon"
            slot="start"
            :icon="isLiked ? heart : heartOutline"
            :style="{ color: isLiked ? '#ef4444' : '#738092' }"
          ></ion-icon>
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<style scoped>
.details-page {
  --background: var(--markit-bg);
  --padding-bottom: calc(112px + env(safe-area-inset-bottom, 0px));
}

.details-header {
  position: sticky;
  top: 0;
  z-index: 80;
  background: transparent !important;   /* was var(--markit-bg) – now transparent */
  padding: 10px 0 0;                  /* side margins moved to inner shell */
}

/* ----- Inner glass card – exact match of wishlist/cart ----- */
.details-topbar-shell {
  padding: 10px 14px;
  margin: 0 12px;                    /* consistent with all other pages */
  border-radius: 14px;              /* was var(--markit-radius-xl) – now fixed 14px */
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  backdrop-filter: blur(20px) saturate(145%);
  -webkit-backdrop-filter: blur(20px) saturate(145%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.details-topbar-shell:hover,
.details-topbar-shell:focus-within {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
}

/* ----- Row layout – unchanged structure ----- */
.details-topbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

/* ----- BACK BUTTON – 100% ORIGINAL (no glass, no border) ----- */
.markit-back-btn {
  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;
  --box-shadow: none;
  --ripple-color: transparent;
  --padding-start: 6px;
  --padding-end: 6px;
  width: auto;
  height: auto;
  border: none;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.markit-back-btn::part(native) {
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  width: auto;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* back icon – original size & colour */
.markit-back-btn ion-icon {
  font-size: 22px;
  color: #2d5444;
}

/* remove any hover/focus effects from glass theme */
.markit-back-btn:hover,
.markit-back-btn:focus-visible {
  border-color: transparent;
  box-shadow: none;
}

.markit-back-btn:focus-visible ion-icon {
  color: #2d5444;
}

/* ----- RIGHT ICONS – glass buttons, 6px gap (wishlist/cart spec) ----- */
.details-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;                         /* was 12px – now exactly 6px */
}

.details-head-icon-btn {
  width: 34px;                      /* was 32px – now 34px */
  height: 34px;
  border-radius: 11px;             /* was 12px – now 11px */
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  backdrop-filter: blur(16px) saturate(140%);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  color: #1f2937;                  /* was #2d5444 – now neutral dark */
  padding: 0;
  margin: 0;
  cursor: pointer;
}

.details-head-icon-btn:hover,
.details-head-icon-btn:focus-visible {
  border-color: var(--markit-glass-border-hover);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight),
              var(--markit-glass-shadow-lg);
  outline: none;
}

.details-head-icon-btn:focus-visible .details-head-icon {
  color: var(--ion-color-primary);
}

.details-head-icon {
  width: 21px;                      /* was 22px – now 21px */
  height: 21px;
  color: #1f2937;                  /* was #2d5444 – now neutral dark */
  transition: color 0.2s ease;
}

/* active state – not used here, but kept for consistency */
.details-head-icon--active {
  color: var(--ion-color-primary);
  filter: drop-shadow(
    0 0 0.35rem
      color-mix(in srgb, var(--ion-color-primary) 38%, transparent)
  );
}

/* ----- RESPONSIVE – matches all other topbars ----- */
@media (max-width: 390px) {
  .details-header {
    padding: 10px 0 0;
  }

  .details-topbar-shell {
    padding: 8px 12px;
    margin: 0 10px;
  }

  .details-head-icon-btn {
    width: 28px;
    height: 28px;
  }

  .details-head-icon {
    width: 20px;
    height: 20px;
  }

  .details-head-actions {
    gap: 4px;
  }

  .markit-back-btn {
    --padding-start: 4px;
    --padding-end: 4px;
  }

  .markit-back-btn ion-icon {
    font-size: 20px;
  }
}

/* ----- All other styles (product details, footer) remain unchanged ----- */
/* (keep your existing styles below – they are untouched) */
.details-page {
  --background: var(--markit-bg);
  --padding-bottom: calc(112px + env(safe-area-inset-bottom, 0px));
}

.details-body {
  padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
}

.details-product-title {
  font-size: 1.45rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: var(--markit-text);
}

.details-size-guide {
  font-size: 0.84rem;
  line-height: 1.3;
  color: #2d5444;
}

.details-swiper {
  border-radius: var(--markit-radius-lg);
  overflow: hidden;
  width: 100%;
  height: 480px;
  border: 1px solid var(--markit-border);
  box-shadow: var(--markit-shadow-soft);
  background: var(--markit-surface);
}

.details-sizes-card {
  border-radius: var(--markit-radius-lg);
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
}

.size-chip-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.size-chip-btn {
  min-width: 52px;
}

.size-chip-wrap--oos {
  position: relative;
  opacity: 0.72;
}

.size-chip-wrap--oos::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  top: 50%;
  height: 2px;
  background: #ef4444;
  transform: translateY(-50%);
  border-radius: 99px;
  pointer-events: none;
}

.details-footer {
  background: var(--markit-surface);
  border-top: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl) var(--markit-radius-xl) 0 0;
  box-shadow: var(--markit-shadow-soft);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 4px 0 calc(env(safe-area-inset-bottom, 0px) + 4px);
}

.cart-btn::part(native) {
  min-height: 46px;
  border-radius: var(--markit-radius-pill) !important;
  background: var(--ion-color-primary) !important;
  color: #ffffff !important;
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 70%, #ffffff) !important;
  box-shadow: none !important;
  font-size: 1rem;
  font-weight: 700;
  text-transform: none !important;
}

.wishlist-btn::part(native) {
  min-height: 46px;
  border-radius: var(--markit-radius-pill) !important;
  background-color: var(--markit-surface-muted) !important;
  color: #5f6b7a !important;
  width: 56px;
  font-size: 22px;
  padding: 0;
  border: 1px solid var(--markit-border) !important;
  box-shadow: none !important;
  transition: none !important;
  transform: none !important;
}

.details-action-btn,
.details-icon-action-btn {
  --box-shadow: none;
}

.wishlist-btn {
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;
  --ripple-color: transparent;
  --box-shadow: none;
}

.full-image-modal::part(content) {
  --height: 100%;
  --width: 100%;
  background: black;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  IonPage, IonHeader, IonContent, IonButtons,
  IonButton, IonIcon, IonFooter, IonSpinner, useIonRouter
} from "@ionic/vue";
import { heartOutline, heart, cartOutline, arrowBackOutline } from "ionicons/icons";
import Badge from "@/components/Badge.vue";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useLikeStore } from "@/store/useLikeStore";
import { useCartStore } from "@/store/useCartStore";
import { toastController } from "@ionic/vue";
import { getVariantById } from "@/api/api";
import { closeOutline } from "ionicons/icons";
import { checkmarkCircleOutline, alertCircleOutline } from "ionicons/icons";

type Item = { id: string; size: string | null; qty: number };
type Variant = {
  id: string;
  name: string;
  productName?: string;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  items: Item[];
  companyId: string;
  companyName: string;
};

const route = useRoute();
const router = useRouter();
const ionRouter = useIonRouter();
const selectedVariant = ref<Variant | null>(null);
const product = ref<any>(null);
const selectedSizes = ref<(string | null)[]>([]);
const loading = ref(true);

const likeStore = useLikeStore();
const cartStore = useCartStore();
likeStore.loadLikes();
const isImageViewerOpen = ref(false);
const startIndex = ref(0);

function openImageViewer(i: number) {
  startIndex.value = i;
  isImageViewerOpen.value = true;
}

const totalCartCount = computed(() => {
  if (!Array.isArray(cartStore.groups)) return 0

  return cartStore.groups.reduce((groupSum, group) => {
    const groupTotal = (group.companies ?? []).reduce((companySum, company) => {
      const companyTotal = (company.items ?? []).reduce(
        (itemSum, item) => itemSum + (item.quantity ?? 0),
        0
      )
      return companySum + companyTotal
    }, 0)
    return groupSum + groupTotal
  }, 0)
})

const formatLabel = (value?: string | null) => {
  if (!value) return ''
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
    .join(' ')
}

const detailsTitle = computed(() => {
  if (!selectedVariant.value) return ''
  const base = formatLabel(selectedVariant.value.productName || selectedVariant.value.name)
  const color =
    selectedVariant.value.productName && selectedVariant.value.name
      ? formatLabel(selectedVariant.value.name)
      : ''
  return color ? `${base} (${color})` : base
})

onMounted(async () => {
  try {
    const variantId = route.params.variantId as string;
    const res = await getVariantById(variantId);

    selectedVariant.value = res.data;
    product.value = res.data;

    if (selectedVariant?.value?.items.length === 1 && !selectedVariant.value.items[0].size) {
      selectedSizes.value = [null];
    }
  } catch (err) {
    console.error("Failed to fetch variant", err);
  } finally {
    loading.value = false;
  }
});

watch(selectedVariant, (v) => {
  if (!v) return;
  if (v.items.length === 1 && !v.items[0].size) selectedSizes.value = [null];
  else selectedSizes.value = [];
});

function toggleSize(size: string | null) {
  const idx = selectedSizes.value.indexOf(size);
  if (idx === -1) selectedSizes.value.push(size);
  else selectedSizes.value.splice(idx, 1);
}

function formatSizeLabel(size: string | null) {
  if (!size) return 'NO SIZE'
  return String(size).trim().toUpperCase()
}

async function addToCart() {
  if (!selectedVariant.value) return;

  const onlyNosize =
    selectedVariant.value.items.length === 1 &&
    !selectedVariant.value.items[0].size;

  if (!onlyNosize && selectedSizes.value.length === 0) {
    const toast = await toastController.create({
      header: "Select Size",
      message: "Please select a size",
      icon: alertCircleOutline,
      duration: 1700,
      position: "bottom",
      cssClass: "markit-toast markit-toast-warning",
    });
    toast.present();
    return;
  } else {
    const toast = await toastController.create({
      header: "Added",
      message: "Items added to cart",
      icon: checkmarkCircleOutline,
      duration: 1700,
      position: "bottom",
      cssClass: "markit-toast markit-toast-success",
    });
    toast.present();
  }

  cartStore.addItem(product.value, selectedSizes.value);
}

function toggleLike() {
  likeStore.toggleLike(product.value);
}

function goWishlist() {
  router.push({ name: "wishlist" });
}

function goBack() {
  ionRouter.back({ animated: false });
}

const isLiked = computed(() => likeStore.isLiked(product.value?.id));
</script>
