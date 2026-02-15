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
          class="size-chip"
          :color="selectedSizes.includes(size) ? 'primary' : 'medium'"
          @click="toggleSize(size)"
        >
          {{ formatSizeLabel(size) }}
        </ion-button>
      </div>
<!-- 
      <ion-button expand="block" @click="confirmSizes">
        Add to Cart
      </ion-button> -->

      <button class="size-selector-cta w-[100%] !py-3 !px-4 !rounded-[8px] !text-white !border !border-transparent" @click="confirmSizes">
        Add to Cart
      </button>

    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { IonModal, IonButton } from '@ionic/vue'
import { toastController } from '@ionic/vue'
import { alertCircleOutline } from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
  sizes: string[]
}>()

const emit = defineEmits(['close', 'select-sizes'])

const selectedSizes = ref<string[]>([]) // ✅ allow multiple

const close = () => emit('close')

const formatSizeLabel = (size: string) => String(size || '').trim().toUpperCase()

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
        header: 'Select Size',
        message: 'Please select a size',
        icon: alertCircleOutline,
        duration: 1700,
        position: 'bottom',
        cssClass: 'markit-toast markit-toast-warning'
      });
        await toast.present();
    return
  }
  emit('select-sizes', [...selectedSizes.value]) // ✅ send array
  close()
  selectedSizes.value = [];
}
</script>

<style scoped>
.size-chip::part(native) {
  min-width: 38px;
  height: 30px;
  padding: 0 10px;
  border-width: 1px;
  font-weight: 600;
  transition: none;
}

.size-selector-cta {
  background: var(--ion-color-primary) !important;
  color: var(--ion-color-primary-contrast) !important;
}
</style>
