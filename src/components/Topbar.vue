<template>
  <ion-header class="ion-no-border ion-padding bg-white">
  <div class="flex flex-row justify-between">
  <ion-buttons slot="start">
  <ion-back-button default-href="/"  text="Cart"></ion-back-button>
  </ion-buttons>
  <div class="flex flex-row gap-4 justify-center">
  <button @click="router.push('/whishlist')" class="flex flex-col items-center text-green-800">
  <ion-icon :icon="heartOutline" class="w-7 h-7"></ion-icon>
  </button>
  <button @click="router.push('/cart')" class="relative flex flex-col items-center text-green-800">
  <!-- Cart Icon -->
  <ion-icon :icon="cartOutline" class="w-7 h-7"></ion-icon>

  <!-- Badge -->
  <ion-badge
  v-if=" cart.items.length "
  class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
  >
  {{ cart.items.length }}
  </ion-badge>

  </button>
  </div>
  </div>
  </ion-header>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { IonButtons, IonBackButton, IonHeader,IonBadge, IonIcon } from '@ionic/vue';
import { heartOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from '@/store/useCartStore'
import { onMounted } from 'vue';
const router = useRouter();

const cart = useCartStore()
onMounted(async () => {
  await cart.loadCart()

})
</script>
