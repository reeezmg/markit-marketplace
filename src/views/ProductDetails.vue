<template>
  <ion-page>
    <!-- HEADER -->
    <ion-header class="ion-no-border bg-white px-4 py-2 shadow-sm">
      <div class="flex justify-between items-center">
        <ion-buttons slot="start">
          <ion-back-button default-href="/" text="" class="text-green-700"></ion-back-button>
        </ion-buttons>

        <div class="flex gap-4 items-center bg-white px-3 py-1">
          <button @click="$router.push('/whishlist')" class="text-green-800">
            <ion-icon :icon="heartOutline" class="w-7 h-7"></ion-icon>
          </button>

                  <!-- Cart Button -->
        <button
          @click="$router.push('/cart')"
          class="relative flex flex-col items-center text-green-800"
        >
          <ion-icon :icon="cartOutline" class="w-7 h-7"></ion-icon>

          <!-- Cart Badge -->
          <ion-badge
            v-if="totalCartCount > 0"
            class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
          >
            {{ totalCartCount }}
          </ion-badge>
        </button>
        </div>
      </div>
    </ion-header>

    <!-- MAIN CONTENT -->
    <ion-content>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center items-center h-[70vh]">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Content -->
      <div v-else class="p-4">

        <!-- IMAGE CAROUSEL -->
        <swiper
          :slides-per-view="1"
          :loop="true"
          :pagination="{ clickable: true }"
          class="rounded-2xl overflow-hidden w-full h-[480px] shadow"
        >
          <swiper-slide
            v-for="(img, index) in selectedVariant?.images"
            :key="index"
          >
            <img
              :src="`https://images.markit.co.in/${img}`"
              alt="Product Image"
              class="w-full h-full object-cover"
              @click="openImageViewer(index)"
            />
          </swiper-slide>
        </swiper>

        <!-- PRODUCT INFO -->
        <div class="mt-4 space-y-3">
          <h3 class="text-[22px] font-semibold text-gray-900">
            {{ selectedVariant?.name }} 
          </h3>

          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold text-gray-900">
              ₹{{ selectedVariant?.dprice }}
            </span>

            <span
              v-if="selectedVariant?.discount > 0"
              class="line-through text-gray-400 text-lg"
            >
              ₹{{ selectedVariant?.sprice }}
            </span>

            <Badge
              v-if="selectedVariant?.discount > 0"
              color="danger"
              variant="subtle"
              size="md"
            >
              {{ selectedVariant?.discount }}% OFF
            </Badge>
          </div>
        </div>

        <!-- SIZE SECTION -->
        <div v-if="selectedVariant?.items?.length" class="mt-6">
          <div class="flex justify-between items-center">
            <div class="text-[17px] font-medium text-gray-800">Select Sizes</div>
            <button class="text-green-700 text-sm">Size Guide</button>
          </div>

          <div class="p-3 rounded-xl bg-white shadow-sm">
            <div class="flex flex-wrap gap-3">
              <div
                v-for="item in selectedVariant.items"
                :key="item.id"
                class="relative"
              >
                <ion-button
                  shape="round"
                  size="small"
                  :color="selectedSizes.includes(item.size) ? 'primary' : 'medium'"
                  :fill="selectedSizes.includes(item.size) ? 'solid' : 'outline'"
                  @click="toggleSize(item.size)"
                  :disabled="item.qty === 0"
                >
                  {{ item.size ?? 'NOSIZE' }}
                </ion-button>

                <!-- Out of Stock Overlay -->
                <div
                  v-if="item.qty === 0"
                  class="absolute inset-0 flex items-center justify-center bg-white/70 rounded-md"
                >
                  <span class="text-xs text-red-500 font-semibold">
                    OUT OF STOCK
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- TRUST BADGES -->
          <!-- <ul class="mt-4 text-sm text-gray-600 space-y-1">
            <li>✓ Free Delivery</li>
            <li>✓ Easy Returns</li>
            <li>✓ Cash on Delivery Available</li>
          </ul> -->
        </div>
      </div>
    </ion-content>

    <!-- FULL SCREEN IMAGE VIEWER -->
<ion-modal
  :is-open="isImageViewerOpen"
  @didDismiss="isImageViewerOpen = false"
  class="full-image-modal"
>
  <div class="relative w-full h-full bg-black flex items-center justify-center">

    <!-- Close button -->
    <button
      class="absolute top-5 right-5 z-50 backdrop-blur-md p-2 rounded-full"
      @click="isImageViewerOpen = false"
    >
      <ion-icon :icon="closeOutline" class="text-white text-3xl"></ion-icon>
    </button>

    <!-- Fullscreen Swiper -->
    <swiper
      :slides-per-view="1"
      :loop="true"
      class="w-full h-full"
    >
      <swiper-slide
        v-for="(img, index) in selectedVariant?.images"
        :key="index"
      >
        <img
          :src="`https://images.markit.co.in/${img}`"
          class="w-full h-full object-contain"
        />
      </swiper-slide>
    </swiper>
  </div>
</ion-modal>

    <!-- FOOTER CTA -->
    <ion-footer v-if="!loading" class="bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
      <div class="grid grid-cols-[5fr_1fr] gap-3 p-3 w-full">
        <ion-button class="flex-1 h-[50px] text-[16px] cart-btn" @click="addToCart">
          <ion-icon class="me-2" slot="start" :icon="cartOutline"></ion-icon>
          Add to Cart
        </ion-button>

        <ion-button
          class="flex-1 h-[50px] text-[16px] wishlist-btn"
          @click="toggleLike"
        >
          <ion-icon class="p-0" slot="start" :icon="isLiked ? heart : heartOutline"></ion-icon>
          <!-- {{ isLiked ? "Liked" : "Add to Wishlist" }} -->
        </ion-button>
      </div>
    </ion-footer>

  </ion-page>
</template>

<style>
.cart-btn::part(native) {
  border-radius: 100px !important;
  text-transform: none !important;
}

.wishlist-btn::part(native) {
  border-radius: 50% !important;
  background-color: #f5f5f5 !important;
  color: #292525 !important;
  width: 60px;
  font-size: 24px;
  padding: 0;
}

.full-image-modal::part(content) {
  --height: 100%;
  --width: 100%;
  background: black;
}

</style>
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  IonPage, IonHeader, IonContent, IonButtons, IonBackButton,
  IonButton, IonIcon, IonFooter, IonSpinner
} from "@ionic/vue";
import { heartOutline, heart, cartOutline } from "ionicons/icons";
import Badge from "@/components/Badge.vue";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useLikeStore } from "@/store/useLikeStore";
import { useCartStore } from "@/store/useCartStore";
import { toastController } from "@ionic/vue";
import { getVariantById } from "@/api/api";
import { closeOutline } from "ionicons/icons";

type Item = { id: string; size: string | null; qty: number };
type Variant = {
  id: string;
  name: string;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  items: Item[];
  companyId: string;
  companyName: string;
};

const route = useRoute();
const selectedVariant = ref<Variant | null>(null);
const product = ref<any>(null); // used only for likes/cart
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

// ✅ Correct total item count for nested cartGroups -> companies -> items
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

onMounted(async () => {
  try {
    const variantId = route.params.variantId as string;
    const res = await getVariantById(variantId);

    selectedVariant.value = res.data;
    product.value = res.data;

    // If single NOSIZE item auto-select it
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

async function addToCart() {
  if (!selectedVariant.value) return;

  const onlyNosize =
    selectedVariant.value.items.length === 1 &&
    !selectedVariant.value.items[0].size;

  if (!onlyNosize && selectedSizes.value.length === 0) {
    const toast = await toastController.create({
      message: "Please select a size",
      duration: 2000,
      color: "danger",
      position: "bottom",
    });
    toast.present();
    return;
  } else {
    const toast = await toastController.create({
      message: "Item added to cart",
      duration: 2000,
      color: "success",
      position: "bottom",
    });
    toast.present();
  }

  cartStore.addItem(product.value, selectedSizes.value);
}

function toggleLike() {
  likeStore.toggleLike(product.value);
}

const isLiked = computed(() => likeStore.isLiked(product.value?.id));
</script>
