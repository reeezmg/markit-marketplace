<template>
 <div>
     <div class="mx-3 mt-4 border border-gray-300 rounded-xl text-center p-4">
      <h3 class="text-lg font-medium mb-2">Account</h3>
      <p class="text-sm text-gray-500 mb-4">
        Login/Create Account to manage orders
      </p>
      <ion-button expand="block" color="primary" @click="$emit('loginClicked')">LOGIN</ion-button>

      <p class="text-xs text-gray-400 mt-3 px-2">
        By clicking in, I accept the
        <a href="#" class="underline">terms of service</a> &
        <a href="#" class="underline">privacy policy</a>
      </p>
    </div>


          <!-- Offers and Feedback -->
          <div class="mt-4 mx-3 border border-gray-300 rounded-xl overflow-hidden">
      <!-- Offers -->
      <ion-item button lines="none" class="my-1">
        <ion-icon class="me-3" slot="start" :icon="chatboxEllipsesOutline" />
        <ion-label>Offers</ion-label>
      </ion-item>

      <!-- Divider -->
      <div class="border-t border-gray-300 mx-4" />

      <!-- Feedback -->
      <ion-item button lines="none" class="my-1">
        <ion-icon class="me-3" slot="start" :icon="pricetagOutline" />
        <ion-label>Feedback</ion-label>
      </ion-item>
      
    </div>
    </div>
</template>

<script setup lang="ts">
import {
  pricetagOutline,
  chatboxEllipsesOutline
} from 'ionicons/icons'
defineEmits(['loginClicked'])
import { IonButton, IonItem, IonIcon, IonLabel } from '@ionic/vue';
</script>