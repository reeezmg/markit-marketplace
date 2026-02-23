<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="close"
    :initial-breakpoint="1"
    :breakpoints="[0, 1, 1]"
    handle-behavior="cycle"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
    class="markit-filter-sheet"
  >
    <div class="size-sheet">
      <div class="size-header">
        <p class="size-title text-gray-700">Select Sizes</p>
      </div>

      <div class="size-options">
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

      <button
        class="size-selector-cta"
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

/* ===== Mirror Sheet Container ===== */
.size-sheet {
  width: 100%;
  padding: 24px 20px 28px;
  padding-bottom: calc(28px + var(--markit-bottom-inset));
  color: #374151;
}

/* ===== Header ===== */
.size-header {
  text-align: center;
  margin-bottom: 20px;
}

.size-title {
  font-size: 20px;
  font-weight: 700;
  color: #374151;
}

/* ===== Size Options ===== */
.size-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 22px;
}

/* ===== Size Chips Styling - White background when not selected ===== */
.size-chip::part(native) {
  min-width: 42px;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  border: 1px solid #e5e7eb; /* Light gray border */
  background: white !important; /* Force white background */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.2s ease;
}

/* Selected chip styling - Green background */
.size-chip[fill="solid"]::part(native) {
  background: var(--ion-color-primary) !important;
  border-color: var(--ion-color-primary) !important;
  color: white !important;
  box-shadow: 0 6px 14px rgba(34, 139, 34, 0.15);
}

/* Override for outline chips to ensure white background */
.size-chip[fill="outline"]::part(native) {
  background: white !important;
}

/* ===== CTA Button ===== */
.size-selector-cta {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  font-weight: 600;
  background: var(--ion-color-primary);
  color: var(--ion-color-primary-contrast);
  border: 1px solid transparent;
  box-shadow: 0 10px 22px rgba(18, 26, 18, 0.15);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.size-selector-cta:active {
  transform: translateY(1px);
  box-shadow: 0 6px 14px rgba(18, 26, 18, 0.12);
}

</style>
