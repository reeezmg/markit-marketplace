<template>
  <ion-header class="ion-no-border ion-padding bg-white">
    <div class="flex flex-row justify-between">
      <ion-buttons slot="start">
        <ion-back-button default-href="/" text="Cart"></ion-back-button>
      </ion-buttons>

      <div class="flex flex-row gap-4 justify-center">
        <!-- Wishlist Button -->
        <button
          @click="router.push('/whishlist')"
          class="flex flex-col items-center text-green-800"
        >
          <ion-icon :icon="heartOutline" class="w-7 h-7"></ion-icon>
        </button>

        <!-- Cart Button -->
        <button
          @click="router.push('/cart')"
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
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  IonButtons,
  IonBackButton,
  IonHeader,
  IonBadge,
  IonIcon,
} from '@ionic/vue'
import { heartOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from '@/store/useCartStore'
import { onMounted, computed } from 'vue'

const router = useRouter()
const cartStore = useCartStore()

onMounted(async () => {
  await cartStore.loadCart()
})

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
</script>
