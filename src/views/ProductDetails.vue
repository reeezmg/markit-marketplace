<template>
  <ion-page>
      <ion-header class="ion-no-border ion-padding ">
      <div class="flex flex-row justify-between">
      <ion-buttons slot="start">
      <ion-back-button default-href="/"  text=""></ion-back-button>
      </ion-buttons>
      <div class="flex flex-row gap-4 justify-center">
      <button @click="$router.push('/whishlist')" class="flex flex-col items-center text-green-800">
      <ion-icon :icon="heartOutline" class="w-8 h-8"></ion-icon>
      </button>

      <button @click="$router.push('/cart')" class="flex flex-col items-center text-green-800">
      <ion-icon :icon="cartOutline" class="w-8 h-8"></ion-icon>
      </button>
      </div>
      </div>
      </ion-header>

    <ion-content class="ion-padding-bottom">
      <!-- Spinner while loading -->
      <div v-if="loading" class="flex justify-center items-center h-[80vh]">
        <ion-spinner name="crescent"></ion-spinner>
      </div>

      <!-- Actual content -->
      <div v-else class="p-4">
        <!-- Image Carousel -->
        <swiper
          :slides-per-view="1"
          :loop="true"
          class="rounded-lg overflow-hidden w-full h-[450px]"
        >
          <swiper-slide
            v-for="(img, index) in selectedVariant?.images"
            :key="index"
          >
            <img
              :src="`https://images.markit.co.in/${img}`"
              alt="Product Image"
              class="w-full h-full object-cover"
            />
          </swiper-slide>
        </swiper>

        <!-- Product Info -->
        <div class="mt-4 space-y-2">
          <h3 class="text-xl font-semibold">
            {{ selectedVariant?.name }}
          </h3>

          <div class="flex items-center space-x-2">
            <span class="text-xl font-bold text-black">
              ₹{{ selectedVariant?.dprice }}
            </span>
            <span
              v-if="selectedVariant?.discount > 0"
              class="line-through text-md text-gray-400"
              >₹{{ selectedVariant?.sprice }}</span
            >
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
      </div>

      <!-- Sizes -->
      <div
        class="ion-padding"
        v-if="!loading && !(selectedVariant?.items.length === 1 && !selectedVariant.items[0].size)"
      >
        <div class="text-lg mb-2 font-semibold">Select Sizes</div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="item in selectedVariant?.items"
            :key="item.size ?? `nosize`"
            class="relative inline-block"
          >
            <ion-button
              shape="round"
              size="small"
              :color="selectedSizes.includes(item.size) ? 'primary' : 'medium'"
              :fill="selectedSizes.includes(item.size) ? 'solid' : 'outline'"
              @click="toggleSize(item.size)"
              :disabled="item.qty === 0"
            >
              {{ item.size }}
            </ion-button>

            <div
              v-if="item.qty === 0"
              class="absolute top-1 left-1 w-[90%] h-[90%] pointer-events-none"
            >
              <div class="w-full h-full relative">
                <div
                  class="absolute w-[2px] h-full bg-red-500 rotate-45 origin-center left-1/2 top-0"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Variants -->
      <div class="ion-padding" v-if="!loading && product?.variants.length">
        <div class="text-lg font-semibold">Variants</div>
        <div class="flex space-x-3 my-4">
          <div
            v-for="variant in product?.variants"
            :key="variant.id"
            @click="selectVariant(variant)"
            class="flex flex-col items-center p-2 rounded-lg cursor-pointer transition-transform duration-200"
            :class="{
              'ring-2 ring-[#097D4C] bg-[#F8FDF3]': selectedVariant?.id === variant.id
            }"
          >
            <div
              class="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center"
            >
              <img
                v-if="variant.images[0]"
                :src="`https://images.markit.co.in/${variant.images[0]}`"
                alt=""
                class="object-cover w-full h-full"
              />
            </div>
            <span class="text-sm mt-1">{{ variant.name }}</span>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer v-if="!loading">
      <div class="flex flex-row gap-2 p-2 w-full">
        <ion-button class="flex-1" @click="addToCart">
          <ion-icon class="me-2" slot="start" :icon="cartOutline"></ion-icon>
          Add to Cart
        </ion-button>

        <ion-button class="flex-1" color="primary" @click="toggleLike">
          <ion-icon
            class="me-2"
            slot="start"
            :icon="isLiked ? heart : heartOutline"
          ></ion-icon>
          {{ isLiked ? "Liked" : "Add to Like" }}
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonFooter,
  IonSpinner,
} from "@ionic/vue";
import { heartOutline, heart, cartOutline } from "ionicons/icons";
import Badge from "@/components/Badge.vue";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/vue";
import { useLikeStore } from "@/store/useLikeStore";
import { useCartStore } from "@/store/useCartStore";
import { toastController } from "@ionic/vue";
import { getVariantById } from "@/api/api";

type Item = { size: string | null; qty: number };

type Variant = {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  images: string[];
  discount: number;
  sprice: number;
  dprice: number;
  items: Item[];
};

type Product = {
  id: string;
  name: string;
  productName: string | null;
  images: string[];
  sprice: number;
  dprice: number;
  discount: number;
  isNew: boolean;
  outOfStock: boolean;
  items: Item[];
  variants: Variant[];
};

// Route
const route = useRoute();
const product = ref<Product | null>(null);
const selectedVariant = ref<Variant | null>(null);
const loading = ref(true); // <-- spinner state

// Selected sizes
const selectedSizes = ref<(string | null)[]>([]);

// Pinia stores
const likeStore = useLikeStore();
const cartStore = useCartStore();
likeStore.loadLikes();

// Fetch product by variantId
onMounted(async () => {
  try {
    const variantId = route.params.variantId as string;
    const res = await getVariantById(variantId);

    product.value = res.data;

    // ✅ Select the variant matching the route param
    selectedVariant.value =
      product.value.variants.find((v) => v.id === variantId) ||
      product.value.variants[0] || 
      null;

    // Initialize selectedSizes for single no-size item
    if (
      selectedVariant.value?.items.length === 1 &&
      !selectedVariant.value.items[0].size
    ) {
      selectedSizes.value = [null];
    }
  } catch (err) {
    console.error("Failed to fetch variant", err);
  } finally {
    loading.value = false;
  }
});


// Watch variant change to reset selectedSizes
watch(selectedVariant, (newVariant) => {
  if (!newVariant) return;

  if (newVariant.items.length === 1 && !newVariant.items[0].size) {
    selectedSizes.value = [null];
  } else {
    selectedSizes.value = [];
  }
});

// Toggle size selection
function toggleSize(size: string | null) {
  const idx = selectedSizes.value.indexOf(size);
  if (idx === -1) selectedSizes.value.push(size);
  else selectedSizes.value.splice(idx, 1);
}

// Select variant
function selectVariant(variant: Variant) {
  selectedVariant.value = variant;
}

// Add to cart
async function addToCart() {
  if (!selectedVariant.value) return;

  // Check size selection
  if (
    !(
      selectedVariant.value.items.length === 1 &&
      !selectedVariant.value.items[0].size
    )
  ) {
    if (
      selectedSizes.value.length === 0 ||
      (selectedSizes.value.length === 1 && selectedSizes.value[0] === null)
    ) {
      const toast = await toastController.create({
        message: "Please select a size",
        duration: 2000,
        color: "danger",
        position: "bottom",
      });
      await toast.present();
      return;
    }
  }

  cartStore.addItem(product.value, selectedSizes.value);
}

// Toggle like
function toggleLike() {
  likeStore.toggleLike(product.value);
}

// Is product liked?
const isLiked = computed(() => likeStore.isLiked(product.value?.id));

// Discount percentage
const discountPercentage = computed(() => {
  if (!selectedVariant.value) return 0;
  const { sprice, dprice } = selectedVariant.value;
  if (sprice === 0) return 0;
  return Math.round(((sprice - dprice) / sprice) * 100);
});
</script>
