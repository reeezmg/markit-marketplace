<!-- components/CouponModal.vue -->
<template>
  <IonModal
    :is-open="isOpen"
    @didDismiss="closeModal"
    breakpoints="[0, 1]"
    initial-breakpoint="1"
    handle-behavior="cycle"
    :can-dismiss="true"
    :backdrop-dismiss="true"
    show-backdrop
    swipe-to-close
    class="markit-filter-sheet"
  >
    <div class="coupon-sheet">
      <!-- Header -->
      <div class="coupon-hero">
        <h2 class="coupon-title text-gray-700">{{ title }}</h2>
        <p class="coupon-sub text-gray-700">
          {{ type === 'company' ? 'Apply coupon for this store' : 'Apply global discount coupon' }}
        </p>
      </div>

      <!-- Available Coupons List -->
      <div v-if="filteredCoupons.length" class="coupon-steps">
        <div
          v-for="coupon in filteredCoupons"
          :key="coupon.id"
          class="coupon-step white-box"
          @click="selectCoupon(coupon)"
        >
          <div class="coupon-icon">
            <ion-icon :icon="pricetagOutline" />
          </div>
          <div class="coupon-text">
            <div class="coupon-label text-gray-700">{{ coupon.code }}</div>
            <div class="coupon-meta">{{ coupon.description }}</div>
            <div class="coupon-discount">Save ₹ {{ coupon.discount }}</div>
          </div>
          <ion-button 
            size="small" 
            fill="outline" 
            color="primary"
            class="apply-btn"
            @click.stop="selectCoupon(coupon)"
          >
            Apply
          </ion-button>
        </div>

        <!-- Connector between coupons (optional) -->
        <div v-if="filteredCoupons.length > 1 && index < filteredCoupons.length - 1" 
             v-for="(_, index) in filteredCoupons.slice(0, -1)" 
             :key="`connector-${index}`" 
             class="coupon-connector">
        </div>
      </div>

      <!-- No Coupons Message -->
      <div v-else class="no-coupons white-box">
        <div class="coupon-icon">
          <ion-icon :icon="alertCircleOutline" />
        </div>
        <div class="coupon-text text-center">
          <div class="coupon-label text-gray-700">No coupons available</div>
          <div class="coupon-meta">Check back later for offers</div>
        </div>
      </div>

      <!-- Manual Coupon Entry -->
      <div class="manual-coupon-section white-box mt-4">
        <div class="coupon-icon">
          <ion-icon :icon="createOutline" />
        </div>
        <div class="coupon-text flex-1">
          <div class="coupon-label text-gray-700">Have a coupon code?</div>
          <div class="coupon-meta">Enter manually below</div>
        </div>
      </div>

      <div class="manual-input">
        <ion-input
          v-model="manualCode"
          placeholder="Enter coupon code"
          fill="outline"
          class="coupon-input"
        ></ion-input>
        <ion-button
          expand="block"
          :disabled="!manualCode"
          @click="applyManualCoupon"
          shape="round"
          class="apply-manual-btn"
        >
          Apply Code
        </ion-button>
      </div>

      <!-- Close button at bottom -->
      <div class="close-section">
        <ion-button 
          expand="block" 
          fill="outline" 
          @click="closeModal"
          shape="round"
        >
          Close
        </ion-button>
      </div>
    </div>
  </IonModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  IonModal, 
  IonIcon, 
  IonButton, 
  IonInput 
} from '@ionic/vue'
import { 
  pricetagOutline, 
  alertCircleOutline, 
  createOutline,
  closeOutline 
} from 'ionicons/icons'

const props = defineProps<{
  isOpen: boolean
  companyId?: string | null
  type: 'company' | 'global'
  availableCoupons: any[]
}>()

const emit = defineEmits(['update:isOpen', 'apply'])

const manualCode = ref('')

const title = computed(() => {
  return props.type === 'company' ? 'Store Coupons' : 'Global Coupons'
})

const filteredCoupons = computed(() => {
  if (props.type === 'global') {
    return props.availableCoupons.filter(c => c.type === 'global')
  }
  return props.availableCoupons.filter(c => c.type === 'company' || !c.type)
})

function closeModal() {
  emit('update:isOpen', false)
  manualCode.value = ''
}

function selectCoupon(coupon: any) {
  emit('apply', {
    code: coupon.code,
    discount: coupon.discount,
    companyId: props.companyId
  })
  closeModal()
}

function applyManualCoupon() {
  if (!manualCode.value) return
  
  // Here you would validate the manual coupon code
  // For now, just emit with a default discount
  emit('apply', {
    code: manualCode.value.toUpperCase(),
    discount: 50, // This should come from validation
    companyId: props.companyId
  })
  closeModal()
}
</script>

<style scoped>
.coupon-sheet {
  width: 100%;
  padding: 24px 20px 28px;
  padding-bottom: calc(28px + var(--markit-bottom-inset));
}

.coupon-hero {
  text-align: center;
  margin-bottom: 24px;
}

.coupon-title {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
}

.coupon-sub {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

.coupon-steps {
  display: flex;
  flex-direction: column;
  gap: 5px;
  position: relative;
  margin-bottom: 20px;
}

.coupon-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 8px 18px rgba(18, 26, 18, 0.08);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.coupon-step:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

.white-box {
  background: white !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.coupon-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(83, 129, 108, 0.1);
  color: #2f6b4a;
  font-size: 22px;
  flex-shrink: 0;
}

.coupon-text {
  flex: 1;
}

.coupon-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 2px;
}

.coupon-meta {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.coupon-discount {
  font-size: 14px;
  font-weight: 600;
  color: #10b981;
}

.apply-btn {
  --padding-start: 12px;
  --padding-end: 12px;
  min-width: 70px;
  margin-left: 8px;
}

.coupon-connector {
  height: 16px;
  margin: 0 auto;
  width: 2px;
  background: linear-gradient(#e5e7eb, rgba(229, 231, 235, 0));
  border-radius: 2px;
}

.no-coupons {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 8px 18px rgba(18, 26, 18, 0.08);
  margin-bottom: 20px;
}

.manual-coupon-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 8px 18px rgba(18, 26, 18, 0.08);
  margin-bottom: 16px;
}

.manual-input {
  margin-bottom: 20px;
}

.coupon-input {
  --background: #f9fafb;
  --border-radius: 12px;
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
}

.apply-manual-btn {
  --background: #2f6b4a;
  --background-hover: #1e4f36;
  --color: white;
  margin: 0;
}

.close-section {
  margin-top: 16px;
}

.close-section ion-button {
  --border-color: #e5e7eb;
  --color: #6b7280;
}

/* Dark mode support if needed */
@media (prefers-color-scheme: dark) {
  .coupon-title,
  .coupon-label {
    color: #f3f4f6 !important;
  }
  
  .white-box {
    background: #1f2937 !important;
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .coupon-meta {
    color: #9ca3af;
  }
  
  .coupon-input {
    --background: #374151;
    --color: #f3f4f6;
    border-color: #4b5563;
  }
}
</style>