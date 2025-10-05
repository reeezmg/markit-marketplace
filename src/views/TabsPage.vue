<template>
  <ion-footer>
    <div class="flex justify-around border-t border-gray-200 bg-white py-2">
      <button @click="$router.push('/')" class="flex flex-col items-center text-green-800">
        <ion-icon :icon="storefrontOutline" class="w-6 h-6"></ion-icon>
        <span class="text-sm">Store</span>
      </button>

      <button @click="$router.push('/whishlist')" class="flex flex-col items-center text-green-800">
        <ion-icon :icon="heartOutline" class="w-6 h-6"></ion-icon>
        <span class="text-sm">Whishlist</span>
      </button>

     <button @click="$router.push('/cart')" class="relative flex flex-col items-center text-green-800">
  <!-- Cart Icon -->
  <ion-icon :icon="cartOutline" class="w-6 h-6"></ion-icon>

  <!-- Badge -->
  <ion-badge
  v-if=" cartStore.items.length "
    class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
  >
  {{ cartStore.items.length }}
  </ion-badge>

  <!-- Label -->
  <span class="text-sm">Cart</span>
</button>

    </div>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonFooter, IonIcon, IonBadge } from '@ionic/vue'
import { storefrontOutline, heartOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from "@/store/useCartStore";
import { onMounted,ref } from 'vue';

const cartStore = useCartStore();
const cartLength = ref(0)

onMounted(async () => {
  await cartStore.loadCart()

})
</script>
