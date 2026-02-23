<template>
  <ion-footer class="tabs-shell ">
    <div class="tabs-capsule">
      <button @click="$router.push({ name: 'shops' })" class="tab-btn text-gray-700" :class="{ 'is-active': isStoreActive }">
        <ion-icon :icon="storefrontOutline" class="tab-icon"></ion-icon>
        <span class="tab-label">Store</span>
      </button>

      <button @click="$router.push({ name: 'wishlist' })" class="tab-btn" :class="{ 'is-active': isWishlistActive }">
        <ion-icon :icon="heartOutline" class="tab-icon"></ion-icon>
        <span class="tab-label">Wishlist</span>
      </button>

      <button @click="$router.push({ name: 'cart' })" class="tab-btn" :class="{ 'is-active': isCartActive }">
        <span class="tab-icon-wrap">
          <ion-icon :icon="cartOutline" class="tab-icon"></ion-icon>
          <ion-badge
            v-if="totalCartCount > 0"
            class="tab-badge rounded-full p-[1px] bg-danger w-[18px] h-[18px] text-xs"
          >
            {{ totalCartCount }}
          </ion-badge>
        </span>

        <span class="tab-label">Cart</span>
      </button>
    </div>
  </ion-footer>
</template>

<script setup lang="ts">
import { IonFooter, IonIcon, IonBadge } from '@ionic/vue'
import { storefrontOutline, heartOutline, cartOutline } from 'ionicons/icons'
import { useCartStore } from '@/store/useCartStore'
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const cartStore = useCartStore()
const route = useRoute()

onMounted(async () => {
  await cartStore.loadCart()
})

const totalCartCount = computed(() => {
  if (!Array.isArray(cartStore.groups)) return 0

  return cartStore.groups.reduce((total, group) => {
    const groupTotal = (group.companies ?? []).reduce((sum, company) => {
      const companyTotal = (company.items ?? []).reduce((s, item) => s + (item.quantity ?? 0), 0)
      return sum + companyTotal
    }, 0)
    return total + groupTotal
  }, 0)
})

const isStoreActive = computed(() => route.name === 'shops' || route.name === 'nearby-shops')
const isWishlistActive = computed(() => route.name === 'wishlist')
const isCartActive = computed(() => route.name === 'cart')
</script>

<style scoped>
.tabs-shell {
  --background: transparent;
  background: transparent;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  z-index: 1200;
  pointer-events: auto;
}

.tabs-capsule {
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--markit-border);
  background: var( --markit-glass-surface);
   backdrop-filter: blur(20px) saturate(145%);
     -webkit-backdrop-filter: blur(20px) saturate(145%);
  border-radius: 0;
  min-height: 64px;
  width: 100%;
  padding: 8px 10px calc(var(--markit-bottom-inset) + 8px);
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 72px;
  transition: color 0.2s ease, transform 0.2s ease;
}


.tab-icon {
  width: 26px;
  height: 26px;
}

.tab-icon-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  position: absolute;
  top: -7px;
  right: -11px;
}

.tab-label {
  font-size: 12px;
  font-weight: 600;
}

</style>
