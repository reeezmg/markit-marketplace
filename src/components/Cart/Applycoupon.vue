<template>
  <div
    class="bg-white p-3 mx-2 my-3 rounded-lg "
  >
  <div class="flex items-center justify-between">
    <div class="text-md font-semibold ">
      Apply Coupon After Trial
    </div>
      <ion-button
        fill="clear"
        size="small"
        style="--padding-end: 0; --padding-start: 0;"
      >
        Know More
        <ion-icon slot="end" :icon="chevronForwardOutline"></ion-icon>
      </ion-button>
  </div>

  </div>
</template>

<script setup lang="ts">
import { chevronForwardOutline } from 'ionicons/icons'
import {
  IonIcon,
  IonButton
} from '@ionic/vue';
</script>
