<template>
  <ion-footer>
    <div class="flex justify-around border-t border-gray-200 bg-white py-2">
      <!-- 🏬 Store -->
      <button @click="$router.push('/')" class="flex flex-col items-center text-green-800">
        <ion-icon :icon="storefrontOutline" class="w-6 h-6"></ion-icon>
        <span class="text-sm">Store</span>
      </button>

      <!-- ❤️ Wishlist -->
      <button @click="$router.push('/whishlist')" class="flex flex-col items-center text-green-800">
        <ion-icon :icon="heartOutline" class="w-6 h-6"></ion-icon>
        <span class="text-sm">Wishlist</span>
      </button>

      <!-- 🛒 Cart -->
      <button @click="$router.push('/cart')" class="relative flex flex-col items-center text-green-800">
        <ion-icon :icon="cartOutline" class="w-6 h-6"></ion-icon>

        <!-- 🔢 Badge -->
        <ion-badge
          v-if="totalCartCount > 0"
          class="absolute -top-1 -right-2 rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
        >
          {{ totalCartCount }}
        </ion-badge>

        <span class="text-sm">Cart</span>
      </button>
    </div>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonFooter, IonIcon, IonBadge } from '@ionic/vue'
import { storefrontOutline, heartOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from '@/store/useCartStore'
import { onMounted, computed } from 'vue'

const cartStore = useCartStore()

onMounted(async () => {
  await cartStore.loadCart()
})

// ✅ Correct total count for nested cartGroup → companies → items
const totalCartCount = computed(() => {
  if (!Array.isArray(cartStore.groups)) return 0

  return cartStore.groups.reduce((total, group) => {
    const groupTotal = (group.companies ?? []).reduce((sum, company) => {
      const companyTotal = (company.items ?? []).reduce(
        (s, item) => s + (item.quantity ?? 0),
        0
      )
      return sum + companyTotal
    }, 0)
    return total + groupTotal
  }, 0)
})
</script>
