<template>
  <ion-modal
    class="address-details-modal"
    :is-open="isOpen"
    @didDismiss="close"
    breakpoints="[0, 1]"
    initialBreakpoint="1"
    :handle-behavior="'cycle'"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
  >
    <div class="details-shell">
      <header class="details-header">
        <div class="details-title-row">
          <span class="details-title-icon">
            <IonIcon :icon="locationOutline" />
          </span>
          <h2 class="details-title">Save Address</h2>
        </div>
        <p class="details-subtitle">Add house &amp; landmark for accurate delivery</p>
      </header>

      <div class="details-note">Note: Orders cannot be delivered to public spaces</div>

      <section class="details-address">
        <div class="details-addr-header">
          
          <span class="details-addr-label">Selected Location</span>
        </div>
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

      <div class="details-action">
        <ion-button expand="block" class="details-save-btn" @click="submitForm">Save Address</ion-button>
      </div>
    </div>
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, toRef } from 'vue'
import {
  IonItem,
  IonInput,
  IonButton,
  IonModal,
  IonIcon,
} from '@ionic/vue'
import { locationOutline } from 'ionicons/icons'
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
ion-modal {
  --height: auto;
  --backdrop-opacity: 0.28;
}

ion-modal::part(content) {
  background: transparent;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

ion-modal::part(handle) {
  width: 42px;
  height: 5px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.35);
}

.details-shell {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 249, 0.96) 100%);
  border-top-left-radius: var(--markit-radius-xl);
  border-top-right-radius: var(--markit-radius-xl);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border: 1px solid var(--markit-glass-border);
  border-bottom: 0;
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    0 -10px 32px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  color: var(--markit-text);
  padding: 18px 18px calc(var(--markit-bottom-inset) + 18px);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.details-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--markit-border);
}

.details-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.details-title-icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.details-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--markit-text);
  letter-spacing: -0.1px;
  margin: 0;
}

.details-subtitle {
  margin: 0;
  font-size: 0.82rem;
  color: var(--markit-text-muted);
}

.details-action {
  margin-top: 4px;
}

.details-note {
  border-radius: 12px;
  padding: 8px 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
}

.details-address {
  margin-top: 12px;
  padding: 14px 14px 12px;
  border-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  background: var(--markit-glass-surface);
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    var(--markit-glass-shadow);
}

.details-addr-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.details-addr-icon {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.details-addr-label {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--markit-text-muted);
}

.details-name {
  font-size: 1.05rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
  margin-bottom: 4px;
}

.details-line {
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
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
  --border-radius: var(--markit-btn-radius);
  --padding-start: 14px;
  --padding-end: 14px;
  min-width: 74px;
  min-height: 38px;
  margin: 0;
  font-weight: 700;
}

.type-chip::part(native) {
  border-radius: var(--markit-btn-radius) !important;
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

.details-save-btn {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --color: #ffffff;
  --border-radius: var(--markit-btn-radius);
  --box-shadow: none;
  width: 100%;
  max-width: none;
  min-height: 44px;
  font-weight: 700;
  letter-spacing: 0.1px;
  margin: 0;
}

.details-save-btn::part(native) {
  width: 100%;
}
</style>
