<template>
  <ion-page>
    <Topbar title="Wishlist"/>

    <ion-content :fullscreen="true" class="ion-padding wishlist-page">
      <!-- Show variants if available -->
      <TransitionGroup
        v-if="variants.length > 0"
        tag="ul"
        name="fade-slide"
        class="grid grid-cols-2 gap-3"
      >
        <VariantCard
          v-for="(variant, index) in variants"
          :key="variant.id"
          :variant="variant"
          @click="toProductDetailsPage(variant)"
        />    
      </TransitionGroup>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center min-h-full text-center empty-panel">
        <div class="empty-icon">
          <ion-icon :icon="heartOutline" class="text-[#53816C] text-3xl" />
        </div>
        <h2 class="empty-title mt-4">Your wishlist is empty</h2>
        <p class="text-gray-600 mt-2 max-w-[16rem]">
          Add products you love and they’ll show up here.
        </p>
        <ion-button
          fill="solid"
          color="primary"
          class="markit-cta mt-5"
          @click="router.push({ name: 'shops' })"
        >
          Browse Products
        </ion-button>
      </div>
</ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonFooter, IonIcon } from '@ionic/vue'
import VariantCard from '@/components/Store/VariantCard.vue';
import Topbar from '@/components/Topbar.vue'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue';
import { onIonViewWillEnter } from '@ionic/vue';
import { useIonRouter } from '@ionic/vue';
import { heartOutline } from 'ionicons/icons'
import { useLikeStore } from '@/store/useLikeStore'
import TabsPage from './TabsPage.vue';

const likeStore = useLikeStore()

type CompanyVariant = {
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


const route = useRoute();
const router = useIonRouter();
const loading = ref(true);
const variants = computed<CompanyVariant[]>(() => likeStore.liked as CompanyVariant[]);

const parseSizes = (items: Array<{ size: string; qty: number }>) => items

// Dummy like store logic (replace with Pinia or Vuex if needed)


onIonViewWillEnter(async () => {
  loading.value = true
  try {
    // Load persisted likes first
    await likeStore.loadLikes()
    
    // Use liked variants as the data source
    console.log('Loaded variants from likeStore:', variants.value)
  } catch (error) {
    console.error('Failed to load variants from likeStore:', error)
  } finally {
    loading.value = false
  }
})

const toProductDetailsPage = (variant: any) => {
   localStorage.setItem('product', JSON.stringify(variant));
  router.push({ name: 'product', params: { variantId: variant.id } })
};
</script>

<style scoped>
.wishlist-page {
  --background: var(--markit-bg);
}



.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--markit-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  box-shadow: var(--markit-shadow-soft);
}

.empty-panel {
  width: 100%;
  background: var(--markit-bg);
  border-radius: var(--markit-radius-lg);
  padding: 48px 16px 56px;
  margin: 0 4px;
}

.empty-title {
  font-size: 1.5rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0.1px;
  color: var(--markit-text);
}

.empty-copy {
  font-size: 0.96rem;
  line-height: 1.45;
  color: var(--markit-text-muted);
}
</style>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
