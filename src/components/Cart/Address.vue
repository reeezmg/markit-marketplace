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
import { useIonRouter } from '@ionic/vue'
import { IonIcon, IonButton } from '@ionic/vue'
import { chevronForwardOutline } from 'ionicons/icons'

const { location } = useLocationStore()   // 👈 directly reactive
const router = useIonRouter()

function setLocationPage() {
  router.push({ name: 'account-address', params: { redirect: 'cart' } })
}
</script>

<style scoped>
.cart-address-card {
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  border-radius: var(--markit-radius-xl);
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    var(--markit-glass-shadow);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
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
  --background: color-mix(in srgb, var(--ion-color-primary) 12%, #ffffff);
  --color: var(--ion-color-primary);
  --background-hover: color-mix(in srgb, var(--ion-color-primary) 18%, #ffffff);
  --background-activated: color-mix(in srgb, var(--ion-color-primary) 22%, #ffffff);
  --border-color: color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
  --border-radius: var(--markit-btn-radius);
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 7px;
  --padding-bottom: 7px;
  font-weight: 700;
  min-width: 88px;
  --box-shadow: none;
  text-transform: none;
}

.address-change-btn::part(native) {
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 32%, var(--markit-border));
  font-size: 0.82rem;
  letter-spacing: 0.01em;
}

.address-change-btn ion-icon {
  font-size: 0.9rem;
}
</style>
