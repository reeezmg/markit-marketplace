<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="flex flex-col w-full h-full items-center justify-center p-6">
        <!-- Success Icon -->
        <div class="w-20 h-20 flex items-center justify-center rounded-full bg-green-500">
          <ion-icon :icon="checkmarkOutline" class="text-white font-bold text-4xl"></ion-icon>
        </div>

        <!-- Heading -->
        <div class="mt-6 mb-10 text-2xl font-semibold text-center">
          Order Confirmed!
        </div>

        <!-- Subheading -->
        <div class="mt-2 text-xl font-bold text-center">
          What’s Next?
        </div>

        <!-- Steps -->
        <div class="mt-6 flex flex-col">
          <!-- Step 1 -->
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
          <div class="text-center -mt-3 -mb-3">&middot</div>

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
import { IonPage, IonFooter, IonContent, IonButton, IonIcon, onIonViewWillEnter } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/useCartStore'
import { checkmarkOutline, homeOutline, cardOutline, repeatOutline } from 'ionicons/icons'

const cart = useCartStore()
const router = useRouter()

// --- Load cart ---
onIonViewWillEnter(async () => {
  try {
    await cart.loadCart()
  } catch (error) {
    console.error('Failed to load cart items:', error)
  }
})

// ✅ Helper: compute total item count from nested structure
const getCartItemCount = () => {
  return cart.groups.reduce((total, group) => {
    const groupTotal = group.companies.reduce((sum, company) => {
      return sum + (company.items?.length || 0)
    }, 0)
    return total + groupTotal
  }, 0)
}

// ✅ Handle close logic
const handleClose = async () => {
  await cart.loadCart()
  const totalItems = getCartItemCount()

  if (totalItems > 0) {
    router.push('/cart')
  } else {
    router.push('/')
  }
}
</script>
