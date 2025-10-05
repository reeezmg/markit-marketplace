<template>
  <ion-page>
    <ion-header>
      <Topbar/>
    </ion-header>

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Show variants if available -->
      <ul v-if="variants.length > 0" class="grid grid-cols-2 gap-4">
        <VariantCard
          v-for="(variant, index) in variants"
          :key="variant.id"
          :variant="variant"
          @click="toProductDetailsPage(variant)"
        />    
      </ul>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center h-full text-center">
        <p class="text-gray-600 mb-4">No liked products yet.</p>
        <ion-button
        fill="solid"
        color="primary"
        shape="round"
        size="small"
        @click="router.push('/')"
        >
          Go to Home
        </ion-button>
      </div>
</ion-content>
    <ion-footer class="ion-no-border ">
       <TabsPage/>
      </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonContent, IonFooter } from '@ionic/vue'
import VariantCard from '@/components/Store/VariantCard.vue';
import Topbar from '@/components/Topbar.vue'
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { onIonViewWillEnter } from '@ionic/vue';
import { useRouter } from 'vue-router';
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
const router = useRouter();
const loading = ref(true);
const variants = ref<CompanyVariant[]>([]);

const parseSizes = (items: Array<{ size: string; qty: number }>) => items

// Dummy like store logic (replace with Pinia or Vuex if needed)


onIonViewWillEnter(async () => {
  loading.value = true
  try {
    // Load persisted likes first
    await likeStore.loadLikes()
    
    // Use liked variants as the data source
    variants.value = likeStore.liked
    console.log('Loaded variants from likeStore:', variants.value)
  } catch (error) {
    console.error('Failed to load variants from likeStore:', error)
  } finally {
    loading.value = false
  }
})

const toProductDetailsPage = (variant: any) => {
   localStorage.setItem('product', JSON.stringify(variant));
  router.push(`/product/${variant.id}`)
};
</script>
