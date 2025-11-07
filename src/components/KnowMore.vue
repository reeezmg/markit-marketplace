<template>
<IonModal
  :is-open="isOpen"
  @didDismiss="close"
  breakpoints="[0, 0.8]"
  initial-breakpoint="0.8"
  handle-behavior="cycle"
  :can-dismiss="true"
  :backdrop-dismiss="true"
  show-backdrop
  swipe-to-close
>
      <div class="flex flex-col w-full items-center justify-center p-6">
        <!-- Main Title -->
        <div class="text-2xl font-bold text-center mb-5 text-[#097D4C]">
          Trial room at home in 60 mins
        </div>

        <!-- Subheading -->
        <div class="mt-2 text-xl font-bold text-center">
          How Markit Works?
        </div>

        <!-- Steps -->
        <div class="mt-6 flex flex-col space-y-3">
          <!-- Step 1 -->
          <div class="flex items-center space-x-3">
            <div
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
            >
              <ion-icon :icon="cartOutline" class="text-green-700 text-2xl" />
            </div>
            <span class="flex-1 text-gray-900 text-lg font-medium">
              Order up to 10 products
            </span>
          </div>

          <div class="text-center text-gray-500">⋅ ⋅ ⋅</div>

          <!-- Step 2 -->
          <div class="flex items-center space-x-3">
            <div
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
            >
              <ion-icon :icon="homeOutline" class="text-green-700 text-2xl" />
            </div>
            <span class="flex-1 text-gray-900 text-lg font-medium">
              Try items at home
            </span>
          </div>

          <div class="text-center text-gray-500">⋅ ⋅ ⋅</div>

          <!-- Step 3 -->
          <div class="flex items-center space-x-3">
            <div
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
            >
              <ion-icon :icon="cardOutline" class="text-green-700 text-2xl" />
            </div>
            <span class="flex-1 text-gray-900 text-lg font-medium">
              Pay only for what you keep
            </span>
          </div>

          <div class="text-center text-gray-500">⋅ ⋅ ⋅</div>

          <!-- Step 4 -->
          <div class="flex items-center space-x-3">
            <div
              class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"
            >
              <ion-icon :icon="repeatOutline" class="text-green-700 text-2xl" />
            </div>
            <span class="flex-1 text-gray-900 text-lg font-medium">
              Return rest to rider within 30 min
            </span>
          </div>
        </div>
      </div>
  </IonModal>
</template>

<script setup lang="ts">
import { IonModal, IonIcon } from '@ionic/vue'
import { cartOutline, homeOutline, cardOutline, repeatOutline } from 'ionicons/icons'

/** Props from parent */
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: true
  }
})

/** Emitted to parent when the modal should close */
const emit = defineEmits<{
  (e: 'close'): void
}>()

/** Close handler used by @didDismiss and any close buttons */
const close = () => {
  emit('close')
}
</script>


<style scoped>
ion-content {
  --background: #ffffff;
}
</style>
