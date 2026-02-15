<template>
  <ion-modal
    class="address-details-modal markit-filter-sheet"
    :is-open="isOpen"
    @didDismiss="close"
    :breakpoints="[0, 0.75, 0.9]"
    :initial-breakpoint="0.9"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <ion-content class="details-content">
      <div class="details-note">Note: Orders cannot be delivered to public spaces</div>

      <section class="details-address glass-card">
        <div class="details-name">{{ name }}</div>
        <div class="details-line">{{ formattedAddress }}</div>
      </section>

      <section class="details-section">
        <label class="details-label">Address Type</label>
        <div class="type-chip-row">
          <ion-button
            v-for="t in types"
            :key="t"
            fill="clear"
            class="type-chip"
            :class="{ 'type-chip--active': type === t }"
            @click="type = t"
          >
            {{ t }}
          </ion-button>
        </div>
      </section>

      <section class="details-section">
        <ion-item class="details-input-item">
          <ion-input
            label="Flat / Floor / House number"
            label-placement="stacked"
            placeholder="e.g., 101, 1st Floor"
            v-model="houseDetails"
          ></ion-input>
        </ion-item>

        <ion-item class="details-input-item">
          <ion-input
            label="Nearby Landmark (Optional)"
            label-placement="stacked"
            placeholder="e.g., Near SBI ATM"
            v-model="landmark"
          ></ion-input>
        </ion-item>
      </section>

      <div class="details-save-wrap">
        <ion-button expand="block" class="details-save-btn" @click="submitForm">Save Address</ion-button>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import {
  IonItem,
  IonContent,
  IonInput,
  IonButton,
  IonModal,
} from '@ionic/vue'
import { useAddressStore } from '@/store/useAddressStore'

const addressStore = useAddressStore()

const types = ['Home', 'Work', 'Friends', 'Other']

const props = defineProps({
  isOpen: Boolean,
  name: String,
  formattedAddress: String,
  addressId: String,
})

const emit = defineEmits(['close', 'save'])

const close = () => {
  emit('close')
}

const name = toRef(props, 'name')
const formattedAddress = toRef(props, 'formattedAddress')
const type = ref('')
const houseDetails = ref('')
const landmark = ref('')

watch(
  () => props.isOpen,
  async (open) => {
    if (open && props.addressId) {
      const addr = addressStore.addresses.find((a) => a.id === props.addressId)
      if (addr) {
        type.value = addr.type || ''
        houseDetails.value = addr.houseDetails || ''
        landmark.value = addr.landmark || ''
      }
    } else {
      type.value = ''
      houseDetails.value = ''
      landmark.value = ''
    }
  },
  { immediate: true }
)

function submitForm() {
  const data = {
    id: props.addressId,
    name: name.value,
    formattedAddress: formattedAddress.value,
    type: type.value,
    houseDetails: houseDetails.value,
    landmark: landmark.value,
  }
  emit('save', data)
  close()
}
</script>

<style scoped>
.details-content {
  --padding-top: 12px;
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-bottom: calc(18px + env(safe-area-inset-bottom, 0px));
}

.details-note {
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  background: var(--ion-color-primary);
}

.details-address {
  margin-top: 12px;
  padding: 14px;
}

.details-name {
  font-size: 22px;
  line-height: 1.2;
  font-weight: 800;
  color: var(--markit-text);
}

.details-line {
  margin-top: 8px;
  font-size: 15px;
  color: var(--markit-text);
  line-height: 1.45;
}

.details-section {
  margin-top: 14px;
}

.details-label {
  display: block;
  margin-bottom: 8px;
  color: var(--markit-text);
  font-size: 16px;
  font-weight: 700;
}

.type-chip-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-chip {
  --color: var(--markit-text);
  --border-radius: 999px;
  --padding-start: 14px;
  --padding-end: 14px;
  min-width: 74px;
  min-height: 38px;
  margin: 0;
  font-weight: 700;
}

.type-chip::part(native) {
  border-radius: 999px !important;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
  min-height: 38px;
  transition: border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.type-chip--active {
  --color: #ffffff;
}

.type-chip--active::part(native) {
  border-color: var(--ion-color-primary);
  background: var(--ion-color-primary);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.details-input-item {
  --min-height: 62px;
  --padding-start: 14px;
  --padding-end: 14px;
  margin-bottom: 10px;
  border-radius: 16px;
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface-strong);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), var(--markit-glass-shadow);
}

.details-input-item ion-input {
  --placeholder-color: var(--markit-text-muted);
  --color: var(--markit-text);
}

.details-save-wrap {
  padding-top: 4px;
}

.details-save-btn {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --color: #ffffff;
  font-weight: 800;
  letter-spacing: 0.01em;
}
</style>
