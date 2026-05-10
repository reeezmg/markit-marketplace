<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { IonModal, IonButton, IonIcon } from '@ionic/vue'
import { cashOutline, qrCodeOutline, checkmark } from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
  amount?: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', method: 'CASH' | 'UPI'): void
}>()

const selected = ref<'CASH' | 'UPI' | ''>('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) selected.value = ''
  }
)

const buttonDisabled = computed(() => selected.value === '')
const buttonText = computed(() =>
  !selected.value ? 'Choose a method' : `Confirm ${selected.value === 'CASH' ? 'Cash' : 'UPI'}`
)

const close = () => emit('close')

const onConfirm = () => {
  if (!selected.value) return
  emit('select', selected.value)
}
</script>

<template>
  <IonModal
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
    <div class="pay-shell">
      <header class="pay-header">
        <h2 class="pay-title">How will the customer pay?</h2>
        <p class="pay-subtitle">
          <template v-if="amount && amount > 0">
            Collecting &#8377; {{ amount }} for the kept items
          </template>
          <template v-else>
            Pick a method to record this payment
          </template>
        </p>
      </header>

      <div class="pay-options">
        <button
          type="button"
          class="pay-option"
          :class="{ 'is-active': selected === 'CASH' }"
          @click="selected = 'CASH'"
        >
          <span class="pay-icon">
            <IonIcon :icon="cashOutline" />
          </span>

          <span class="pay-body">
            <span class="pay-option-title">Cash</span>
            <span class="pay-option-subtitle">Collect physical cash on hand</span>
          </span>

          <span class="pay-check" aria-hidden="true">
            <IonIcon :icon="checkmark" class="pay-check-icon" />
          </span>
        </button>

        <button
          type="button"
          class="pay-option"
          :class="{ 'is-active': selected === 'UPI' }"
          @click="selected = 'UPI'"
        >
          <span class="pay-icon">
            <IonIcon :icon="qrCodeOutline" />
          </span>

          <span class="pay-body">
            <span class="pay-option-title">UPI</span>
            <span class="pay-option-subtitle">Show the QR / UPI ID and confirm</span>
          </span>

          <span class="pay-check" aria-hidden="true">
            <IonIcon :icon="checkmark" class="pay-check-icon" />
          </span>
        </button>
      </div>

      <div class="pay-action">
        <IonButton
          :disabled="buttonDisabled"
          expand="block"
          class="pay-button"
          @click="onConfirm"
        >
          {{ buttonText }}
        </IonButton>
      </div>
    </div>
  </IonModal>
</template>

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

.pay-shell {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 249, 0.96) 100%);
  border-top-left-radius: var(--markit-radius-xl);
  border-top-right-radius: var(--markit-radius-xl);
  border: 1px solid var(--markit-glass-border);
  border-bottom: 0;
  box-shadow:
    inset 0 1px 0 var(--markit-glass-highlight),
    0 -10px 32px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  color: var(--markit-text);
  padding: 20px 18px calc(var(--markit-bottom-inset) + 18px);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pay-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 4px;
}

.pay-title {
  font-size: 1.15rem;
  line-height: 1.3;
  font-weight: 800;
  color: var(--markit-text);
  margin: 0;
  letter-spacing: -0.1px;
}

.pay-subtitle {
  font-size: 0.86rem;
  line-height: 1.4;
  color: var(--markit-text-muted);
  margin: 0;
}

.pay-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pay-option {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 14px;
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-lg);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 249, 0.94) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.82),
    0 1px 2px rgba(15, 23, 42, 0.04);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  cursor: pointer;
  appearance: none;
  font: inherit;
  color: inherit;
}

.pay-option:active {
  transform: scale(0.995);
}

.pay-option.is-active {
  border-color: var(--ion-color-primary);
  background: linear-gradient(180deg, color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff) 0%, #ffffff 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 8px 20px rgba(83, 129, 108, 0.14);
}

.pay-icon {
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  font-size: 22px;
  transition: background 0.2s ease, color 0.2s ease;
}

.pay-option.is-active .pay-icon {
  background: color-mix(in srgb, var(--ion-color-primary) 18%, #ffffff);
}

.pay-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.pay-option-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--markit-text);
  line-height: 1.25;
}

.pay-option-subtitle {
  font-size: 0.84rem;
  line-height: 1.35;
  color: var(--markit-text-muted);
}

.pay-check {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 1.5px solid var(--markit-border-strong);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.pay-check-icon {
  font-size: 14px;
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.pay-option.is-active .pay-check {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
}

.pay-option.is-active .pay-check-icon {
  opacity: 1;
}

.pay-action {
  margin-top: 6px;
}

.pay-button {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --color: #ffffff;
  --border-radius: var(--markit-btn-radius);
  --box-shadow: none;
  width: 100%;
  max-width: none;
  min-height: 50px;
  font-weight: 700;
  letter-spacing: 0.1px;
}

.pay-button::part(native) {
  width: 100%;
}

.pay-button[disabled] {
  --background: var(--markit-surface-muted);
  --color: var(--markit-text-muted);
  opacity: 1 !important;
}
</style>
