<template>
  <ion-page class="">

   <ion-content class="ion-padding">
    <div class="flex flex-col w-full h-full items-center justify-center p-6">
      <div class="text-2xl font-bold text-center mb-5 text-[#097D4C]">
        Trial room at home in 60 mins
      </div>
      <!-- Subheading -->
      <div class="mt-2 text-xl font-bold  text-center">
        How Markit Works?
      </div>

      <!-- Steps -->
      <div class="mt-6 flex flex-col">
        <!-- Step 1 -->
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            <ion-icon :icon="cartOutline" class="text-green-700 text-2xl"></ion-icon>
          </div>
         
          <span class="flex-1 text-gray-900 text-lg font-medium">
            Order upto 10 products
          </span>
        </div>

           <div class="text-center -mt-3">&middot</div>
         <div class="text-center -mt-3">&middot</div>
        <div class="text-center -mt-3 -mb-3">&middot</div>

        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            <ion-icon :icon="homeOutline" class="text-green-700 text-2xl"></ion-icon>
          </div>
         
          <span class="flex-1 text-gray-900 text-lg font-medium">
            Try Items at home
          </span>
        </div>

         <div class="text-center -mt-3">&middot</div>
         <div class="text-center -mt-3">&middot</div>
        <div class="text-center -mt-3 -mb-3">&middot</div>

        <!-- Step 2 -->
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            <ion-icon :icon="cardOutline" class="text-green-700 text-2xl"></ion-icon>
          </div>
          <span class="flex-1 text-gray-900 text-lg font-medium">
            Pay for what you keep
          </span>
        </div>
        <div class="text-center -mt-3">&middot</div>
        <div class="text-center -mt-3">&middot</div>
        <div class="text-center -mt-3  -mb-3">&middot</div>

        <!-- Step 3 -->
        <div class="flex items-center space-x-3">
          <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
            <ion-icon :icon="repeatOutline" class="text-green-700 text-2xl"></ion-icon>
          </div>
          <span class="flex-1 text-gray-900 text-lg font-medium">
            Return to rider in 30 min
          </span>
        </div>
      </div>
      </div>
    </ion-content>
    <ion-footer class="bg-white">
      <div class="p-4">
        <ion-button expand="block" @click="handleClose">
          Close
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonFooter, IonContent, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/useCartStore'
import { IonIcon, onIonViewWillEnter } from '@ionic/vue'
import { cartOutline, homeOutline, cardOutline, repeatOutline } from 'ionicons/icons'

const cart = useCartStore()
const router = useRouter();

// --- Load cart ---
onIonViewWillEnter(async () => {
  try {
    await cart.loadCart()
  } catch (error) {
    console.error('Failed to load cart items:', error)
  }
})

const handleClose = async() => {
await cart.loadCart()
if(cart.items.length > 0){
    router.push('/cart');
}else{
     router.push('/');
}

}

</script>
