<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="close"
    :initial-breakpoint="0.4"
    :breakpoints="[0, 0.4, 0.5]"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <div class="p-4">
      <div class="flex items-center justify-between mb-6">
        <p class="text-[18px] font-semibold  text-gray-700">Select Sizes</p>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <ion-button
          v-for="size in sizes"
          :key="size"
          :fill="selectedSizes.includes(size) ? 'solid' : 'outline'"
          shape="round"
          size="small"
          :color="selectedSizes.includes(size) ? 'primary' : 'medium'"
          @click="toggleSize(size)"
        >
          {{ size }}
        </ion-button>
      </div>
<!-- 
      <ion-button expand="block" @click="confirmSizes">
        Add to Cart
      </ion-button> -->

      <button
        class="w-[100%] !py-3 !px-4 !rounded-[8px] !bg-[#097D4C] !text-white !border !border-transparent"
        @click="confirmSizes"
      >
        Add to Cart
      </button>

    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonModal, IonButton } from '@ionic/vue'
import { toastController } from '@ionic/vue'

const props = defineProps<{
  isOpen: boolean
  sizes: string[]
}>()

const emit = defineEmits(['close', 'select-sizes'])

const selectedSizes = ref<string[]>([]) // ✅ allow multiple

const close = () => emit('close')

const toggleSize = (size: string) => {
  const idx = selectedSizes.value.indexOf(size)
  if (idx === -1) {
    selectedSizes.value.push(size)
  } else {
    selectedSizes.value.splice(idx, 1)
  }
}

const confirmSizes = async() => {
  if (!selectedSizes.value.length) {
     const toast = await toastController.create({
        message: 'Please select a size',
        duration: 2000,
        color: 'danger',
        position: 'bottom'
      });
        await toast.present();
    return
  }
  emit('select-sizes', [...selectedSizes.value]) // ✅ send array
  close()
  selectedSizes.value = [];
}
</script>
