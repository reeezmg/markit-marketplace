<!-- components/CouponModal.vue -->
<template>
    <ion-modal :is-open="isOpen" @didDismiss="closeModal" :initial-breakpoint="1" :breakpoints="[0, 1]"
        handle-behavior="cycle" :can-dismiss="true" :backdrop-dismiss="true" show-backdrop swipe-to-close
        class="markit-filter-sheet">
        <div class="p-4 text-center">
            <p class="size-title text-gray-700 mb-3">
                {{ title }}
            </p>

            <p v-if="type === 'company'" class="text-sm text-gray-500 mb-3">
                Apply coupon for this store
            </p>
            <p v-else class="text-sm text-gray-500 mb-3">
                Apply app discount coupon
            </p>

            <!-- Available Coupons -->
            <div v-if="filteredCoupons.length" class="size-options flex flex-col gap-2 mb-4">
                <div v-for="coupon in filteredCoupons" :key="coupon.id"
                    class="border border-gray-200 rounded-xl p-3 bg-white">
                    <div class="flex items-center gap-3">
                        <div class="km-icon">
                            <ion-icon :icon="pricetagOutline" />
                        </div>

                        <div class="flex-1">
                            <div class="font-semibold text-gray-900">{{ coupon.code }}</div>
                            <div class="text-xs text-gray-500">{{ coupon.description }}</div>
                            <div class="text-sm font-semibold text-green-600 mt-1">Save ₹ {{ coupon.discount }}</div>
                        </div>

                        <ion-button shape="round" size="small" fill="outline" class="size-chip"
                            @click="selectCoupon(coupon)">
                            Apply
                        </ion-button>
                    </div>
                </div>
            </div>

            <!-- No Coupons Message -->
            <div v-else class="border border-gray-200 rounded-xl p-4 bg-white mb-4">
                <div class="flex items-center gap-3">
                    <div class="km-icon">
                        <ion-icon :icon="alertCircleOutline" />
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">No coupons available</div>
                        <div class="text-xs text-gray-500">Check back later for offers</div>
                    </div>
                </div>
            </div>

            <!-- Manual Coupon Section -->
            <div class="border border-gray-200 rounded-xl p-4 bg-white mb-3">
                <div class="flex items-center gap-3 mb-3">
                    <div class="km-icon">
                        <ion-icon :icon="createOutline" />
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900">Have a coupon code?</div>
                        <div class="text-xs text-gray-500">Enter manually below</div>
                    </div>
                </div>

                <!-- Text Input styled like FilterModal -->
                <input type="text"
                    class="w-full text-center border border-gray-300 rounded-md py-2 text-gray-700 outline-0 mb-2 bg-white"
                    v-model="manualCode" placeholder="Enter coupon code" />
            </div>

            <!-- Actions with CTA button styling from FilterModal -->
            <div class="modal-actions">
                <ion-button fill="outline" shape="round" color="medium" @click="closeModal" class="modal-btn">
                    Close
                </ion-button>

                <ion-button shape="round" color="primary" :disabled="!manualCode" @click="applyManualCoupon"
                    class="modal-btn">
                    Apply Code
                </ion-button>
            </div>
        </div>
    </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
    IonModal,
    IonIcon,
    IonButton
} from '@ionic/vue'
import {
    pricetagOutline,
    alertCircleOutline,
    createOutline
} from 'ionicons/icons'

const props = defineProps<{
    isOpen: boolean
    companyId?: string | null
    type: 'company' | 'app'
    availableCoupons: any[]
}>()

const emit = defineEmits(['update:isOpen', 'apply'])

const manualCode = ref('')

const title = computed(() => {
    return props.type === 'company' ? 'Store Coupons' : 'Markit Coupons'
})

const filteredCoupons = computed(() => {
    if (props.type === 'app') {
        return props.availableCoupons.filter(c => c.type === 'app')
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

    emit('apply', {
        code: manualCode.value.toUpperCase(),
        discount: 50, // This should come from validation
        companyId: props.companyId
    })
    closeModal()
}
</script>

<style scoped>
/* ===== Direct styling from FilterModal.vue ===== */

/* Header Styling */
.size-title {
    font-size: 20px;
    font-weight: 700;
    color: #374151;
}

/* Size Options Container */
.size-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 22px;
}

/* Size Chips Styling - White background when not selected */
.size-chip::part(native) {
    min-width: 42px;
    height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    font-weight: 600;
    border: 1px solid #e5e7eb;
    background: white !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
    color: #374151;
}

/* Selected chip styling - Green background */
.size-chip[fill="solid"]::part(native) {
    background: var(--ion-color-primary) !important;
    border-color: var(--ion-color-primary) !important;
    color: white !important;
    box-shadow: 0 6px 14px rgba(34, 139, 34, 0.15);
}

/* Override Ionic default styles */
.size-chip[fill="outline"]::part(native) {
    background: white !important;
    color: #374151 !important;
}

/* CTA Button */
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

.size-selector-cta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* Input styling from FilterModal */
input[type="text"] {
    padding-right: 16px;
    background: white !important;
    border-radius: 6px;
    padding: 10px;
    color: #374151 !important;
}

input[type="text"]:focus {
    border-color: var(--ion-color-primary);
    outline: none;
}

input[type="text"]::placeholder {
    color: #9ca3af;
}

/* Coupon item styling - light theme */
.border.border-gray-200 {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
    transition: all 0.2s ease;
    background: white !important;
}

.border.border-gray-200:hover {
    border-color: var(--ion-color-primary) !important;
    box-shadow: 0 8px 18px rgba(18, 26, 18, 0.08);
}

/* Icon styling from knowmore-sheet */
.km-icon {
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

/* Text colors - all light theme */
.text-gray-900 {
    color: #111827 !important;
}

.text-gray-700 {
    color: #374151 !important;
}

.text-gray-500 {
    color: #6b7280 !important;
}

.text-green-600 {
    color: #059669 !important;
}


.coupon-apply-btn {
    height: 48px;
    font-weight: 600;
    font-size: 15px;
}

/* ===== Modal Button Container ===== */
.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

/* ===== Buttons ===== */
.modal-btn {
  flex: 1;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
}

/* Remove extra Ionic spacing */
.modal-btn::part(native) {
  margin: 0;
}


/* Remove dark mode overrides */
@media (prefers-color-scheme: dark) {

    /* Keep everything light regardless of system preference */
    .border.border-gray-200,
    .bg-white,
    input[type="text"],
    button.flex-1 {
        background: white !important;
        color: #374151 !important;
        border-color: #e5e7eb !important;
    }

    .size-title,
    .text-gray-900,
    .text-gray-700 {
        color: #374151 !important;
    }

    .text-gray-500 {
        color: #6b7280 !important;
    }

    .km-icon {
        background: rgba(83, 129, 108, 0.1);
        color: #2f6b4a;
    }

    input[type="text"] {
        background: white !important;
        color: #374151 !important;
    }

    input[type="text"]::placeholder {
        color: #9ca3af;
    }
}
</style>