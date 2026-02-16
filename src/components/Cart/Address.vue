<template>
  <div class="p-3 cart-address-card my-3">
    <div class="flex items-center justify-between">
      <label class="cart-address-label">
        Delivering to {{ location?.type }}
      </label>
      <ion-button
        fill="solid"
        size="small"
        class="address-change-btn"
        @click.prevent.stop="setLocationPage"
      >
        Change
        <ion-icon slot="end" :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
    </div>

    <div class="cart-address-copy">
      <div class="cart-address-title mb-1">
        {{ location?.houseDetails || location?.name || '' }}
      </div>
      <p class="cart-address-text leading-snug">
        {{ location?.formattedAddress || '' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocationStore } from '@/composables/useLocationStore'
import { useRouter } from 'vue-router'
import { IonIcon, IonButton } from '@ionic/vue'
import { chevronForwardOutline } from 'ionicons/icons'

const { location } = useLocationStore()   // 👈 directly reactive
const router = useRouter()

function setLocationPage() {
  router.push({ name: 'account-address', params: { redirect: 'cart' } })
}
</script>

<style scoped>
.cart-address-card {
  border: 1px solid var(--markit-border);
  background: var(--markit-surface);
  border-radius: var(--markit-radius-xl);
}

.cart-address-label {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--markit-text);
}

.cart-address-copy {
  color: var(--markit-text-muted);
}

.cart-address-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--markit-text);
}

.cart-address-text {
  font-size: 0.83rem;
  color: var(--markit-text-muted);
}

.address-change-btn {
  --background: #53816c;
  --color: #ffffff;
  --border-color: #53816c;
  --border-radius: 999px;
  --padding-start: 10px;
  --padding-end: 10px;
  --padding-top: 6px;
  --padding-bottom: 6px;
  font-weight: 600;
  min-width: 92px;
  text-transform: none;
}
</style>
