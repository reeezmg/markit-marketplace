<template>
  <div class="bg-white p-3 mx-2 my-3 rounded-lg">
    <div class="flex items-center justify-between">
      <label class="text-md font-semibold">
        Delivering to {{ location?.type }}
      </label>
      <ion-button
        fill="clear"
        slot="end"
        size="small"
        @click.prevent.stop="setLocationPage"
        style="--padding-end: 0; --padding-start: 0;"
      >
        Change
        <ion-icon slot="end" :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
    </div>

    <div class="text-gray-500">
      <div class="text-lg font-semibold mb-1">
        {{ location?.houseDetails || location?.name || '' }}
      </div>
      <p class="text-sm text-gray-600 leading-snug">
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
  router.push('/account/address/cart')
}
</script>
