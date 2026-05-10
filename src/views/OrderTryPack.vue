<template>
  <ion-page>
    <Topbar title="Order Details" />

    <ion-content class="pack-content ion-padding" :fullscreen="true">
      <div v-if="order">
        <!-- Delivery step tracker -->
        <DeliveryTracker
          :events="stepEvents"
          :storeCount="order.companies?.length ?? 1"
          :stores="order.companies ?? []"
          :packed="['PACKED', 'PICKED', 'DELIVERED', 'DECISION_DONE', 'RETURNED', 'COMPLETED'].includes(String(order.order_status || '').toUpperCase())"
        />

        <!-- Delivery OTP card -->
        <div v-if="order.delivery_otp" class="otp-card mb-4">
          <div class="otp-card-label">Your Delivery OTP</div>
          <div class="otp-card-code">{{ order.delivery_otp }}</div>
          <div class="otp-card-hint">Share this with the delivery person to confirm delivery</div>
        </div>

        <!-- Customer waiting timer (mirrors delivery's TrynbuyWaitingPage) -->
        <div v-if="deliveryConfirmed" class="waiting-timer-card mb-4" :class="{ 'is-overflow': isPastCap }">
          <div class="waiting-timer-title">
            {{ customerWaitingDone ? 'Trial complete' : (isPastCap ? 'Overtime — extra charges apply' : 'Trial in progress') }}
          </div>
          <div class="waiting-timer-display">
            {{ timerMinutes.toString().padStart(2, '0') }}:{{ timerSeconds.toString().padStart(2, '0') }}
          </div>
          <div class="waiting-timer-cap">
            Capped at {{ order.waiting_time || 0 }} mins
          </div>
          <div class="waiting-timer-note">
            &#8377;1 added every minute past the cap
          </div>
        </div>

        <!-- ================= PER COMPANY CARDS ================= -->
        <div
          v-for="company in order.companies"
          :key="company.id"
          class="company-card mb-4"
          :class="{ 'company-card-cancelled': isCompanyCancelled(company.id) }"
        >
          <!-- Company Header -->
          <div class="company-header">
            <div class="company-title-wrap">
              <div class="company-title">{{ formatCompanyName(company.name) }}</div>
              <div class="company-meta">
                {{ company.cartitems.length }} trial {{ company.cartitems.length === 1 ? 'item' : 'items' }}
              </div>
              <div v-if="isCompanyCancelled(company.id)" class="company-cancelled-banner">
                This store cancelled its part of the order. These items are no longer available.
              </div>
            </div>
            <ion-button size="small" fill="outline" color="primary" @click="openCompanyCouponModal(company)"
              class="coupon-btn" :disabled="isCompanyCancelled(company.id)">
              <ion-icon :icon="pricetagOutline" slot="start"></ion-icon>
              Apply Coupon
            </ion-button>
          </div>
          <!-- Company Items -->
          <div v-for="(item, itemIndex) in company.cartitems" :key="getItemKey(item)" class="flex mb-5 item-row">
            <!-- Image -->
            <div class="w-24 h-28 rounded-xl overflow-hidden bg-gray-100">
              <img :src="`https://images.markit.co.in/${item.images[0]}`" class="w-full h-full object-cover" />
            </div>

            <!-- Info -->
            <div class="ml-4 flex-1">
              <div class="text-sm font-medium text-gray-900">
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-500">Size: {{ item.size }}</div>
              <div class="text-xs text-gray-500">{{ itemLineLabel(itemIndex) }}</div>

              <div class="mt-2 flex gap-2">
                <ion-button size="small" color="danger" :fill="decisions[getItemKey(item)] === 'return' ? 'solid' : 'outline'"
                  :disabled="isCompanyCancelled(company.id)"
                  @click="toggleDecision(getItemKey(item), 'return')">
                  Return
                </ion-button>

                <ion-button size="small" color="primary" :fill="decisions[getItemKey(item)] === 'keep' ? 'solid' : 'outline'"
                  :disabled="isCompanyCancelled(company.id)"
                  @click="toggleDecision(getItemKey(item), 'keep')">
                  Keep
                </ion-button>
              </div>
            </div>

            <!-- Price -->
            <div class="text-right">
              <div class="font-semibold text-gray-900">
                ₹ {{ item.d_price }}
              </div>
              <div v-if="item.s_price && item.s_price > item.d_price" class="text-xs text-gray-400 line-through">
                ₹ {{ item.s_price }}
              </div>
            </div>
          </div>

          <!-- Company Summary -->
          <div class="company-summary">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Subtotal (Kept items):</span>
              <span class="font-semibold text-gray-900">₹ {{ companySummary(company.id).subtotal }}</span>
            </div>

            <!-- Applied Coupon Display -->
            <div v-if="companyCoupons[company.id] && !isCompanyCancelled(company.id)" class="applied-coupon mt-2">
              <div class="coupon-left">
                <span class="text-xs text-green-600 flex items-center">
                  <ion-icon :icon="checkmarkCircleOutline" class="mr-1"></ion-icon>
                  Coupon {{ companyCoupons[company.id].code }} applied
                  (-₹ {{ calculateCompanyDiscount(company.id) }})
                </span>
              </div>

              <ion-button size="small" fill="clear" @click="removeCompanyCoupon(company.id)" class="remove-coupon">
                <ion-icon :icon="closeOutline"></ion-icon>
              </ion-button>
            </div>


            <div class="company-total mt-2 pt-2">
              <div class="flex justify-between">
                <span class="font-bold">Company Total:</span>
                <span class="font-bold text-primary">₹ {{ companySummary(company.id).total }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= ORDER SUMMARY CARD ================= -->
        <div class="card">
          <div class="card-header">
            <div class="card-title mb-2 font-bold text-lg">Order Summary</div>
            <ion-button size="small" fill="outline" color="primary" @click="openMarkitCouponModal" class="coupon-btn">
              <ion-icon :icon="pricetagOutline" slot="start"></ion-icon>
              Apply Coupon
            </ion-button>
          </div>

          <!-- Applied Markit Coupon Display -->
          <div v-if="MarkitCoupon" class="applied-coupon mb-3">
            <span class="text-xs text-green-600 flex items-center">
              <ion-icon :icon="checkmarkCircleOutline" class="mr-1"></ion-icon>
              Markit Coupon {{ MarkitCoupon.code }} applied (-₹ {{ calculateMarkitDiscount() }})
            </span>
            <ion-button size="small" fill="clear" color="medium" @click="removeMarkitCoupon" class="remove-coupon">
              <ion-icon :icon="closeOutline"></ion-icon>
            </ion-button>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Subtotal (All Companies)</span>
            <span>₹ {{ summary.subtotal }}</span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Company Discounts</span>
            <span>- ₹ {{ summary.companyDiscounts }}</span>
          </div>

          <div v-if="MarkitCoupon" class="flex justify-between text-sm mb-2 text-green-600">
            <span>Markit Discount</span>
            <span>- ₹ {{ calculateMarkitDiscount() }}</span>
          </div>

          <div v-if="customerDeliveryFee > 0" class="flex flex-col mb-2">
            <div class="flex justify-between text-sm">
              <span>Delivery Fees</span>
              <span>
                <span v-if="deliveryDeduction > 0" class="line-through text-gray-400 mr-1">
                  &#8377; {{ customerDeliveryFee.toFixed(2) }}
                </span>
                <span class="font-semibold text-primary">&#8377; {{ deliveryFeeNet.toFixed(2) }}</span>
              </span>
            </div>
            <div v-if="deliveryDeduction > 0" class="text-xs text-green-600 ml-1">
              &minus;&#8377; {{ deliveryDeduction.toFixed(2) }} (&#8377;4 off per &#8377;100 kept)
            </div>
            <div v-else class="text-xs text-gray-500 ml-1">
              &#8377;4 off per &#8377;100 of items kept
            </div>
          </div>

          <div v-if="waitingFeeGross > 0" class="flex flex-col mb-2">
            <div class="flex justify-between text-sm">
              <span>Waiting Fees</span>
              <span>
                <span v-if="waitingDeduction > 0" class="line-through text-gray-400 mr-1">
                  &#8377; {{ waitingFeeGross.toFixed(2) }}
                </span>
                <span class="font-semibold text-primary">&#8377; {{ waitingFeeNet.toFixed(2) }}</span>
              </span>
            </div>
            <div v-if="waitingDeduction > 0" class="text-xs text-green-600 ml-1">
              &minus;&#8377; {{ waitingDeduction.toFixed(2) }} (&#8377;15 off per item kept)
            </div>
            <div v-else class="text-xs text-gray-500 ml-1">
              &#8377;15 off per item kept after trial
            </div>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Max Waiting Time</span>
            <span>{{ order.waiting_time || 0 }} mins</span>
          </div>

          <div v-if="pendingCancellationFees > 0" class="flex justify-between text-sm mb-2 text-orange-700">
            <span>Previous Cancellation Fees</span>
            <span>&#8377; {{ pendingCancellationFees.toFixed(2) }}</span>
          </div>

          <div class="border-t mt-3 pt-3 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>₹ {{ summary.total }}</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500">
        Loading order...
      </div>

      <!-- Coupon Modal Component -->
      <CouponModal v-model:isOpen="showCouponModal" :companyId="selectedCompanyId" :type="couponModalType"
        :availableCoupons="availableCoupons" :companySubtotal="selectedCompanyKeptSubtotal"
        :overallSubtotal="summary.subtotal" @apply="handleApplyCoupon" />
    </ion-content>

    <ion-toast :is-open="toast.isOpen" :message="toast.message" :duration="toast.duration" :position="toast.position"
      :color="toast.color" :icon="toast.icon" :css-class="toast.cssClass"
      @didDismiss="toast.isOpen = false"></ion-toast>

    <!-- Payment Method Modal -->
    <PayMethodModal
      :is-open="showPaymentSheet"
      :amount="summary.total"
      @close="showPaymentSheet = false"
      @select="onPaymentMethodSelected"
    />
    <!-- Footer -->
    <ion-footer class="pack-footer">
      <div class="pack-footer-bg">
        <div v-if="allDecided && !canPay" class="pack-footer-hint">
          <ion-icon :icon="timeOutline" class="pack-footer-hint-icon"></ion-icon>
          Waiting for delivery confirmation
        </div>
        <div class="pack-footer-row">
          <div class="pack-footer-value">&#8377; {{ summary.total }}</div>
          <ion-button class="pack-cancel-btn"
            fill="outline"
            color="danger"
            :disabled="isCancelling"
            @click="cancelOrder">
            Cancel
          </ion-button>
          <ion-button class="pack-pay-btn"
            :disabled="!allDecided || !canPay"
            @click="proceed">
            Proceed to Payment
          </ion-button>
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonButton, IonFooter, IonIcon, IonToast } from '@ionic/vue'
import { pricetagOutline, checkmarkCircleOutline, closeOutline, timeOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import CouponModal from '@/components/CouponModal.vue'
import PayMethodModal from '@/components/Pack/PayMethodModal.vue'
import DeliveryTracker from '@/components/DeliveryTracker.vue'
import { usePackStore } from '@/store/usePackStore'
import { cancelTrynBuyOrder, completeTrynBuyCheckout, fetchCoupons, validateCoupon, fetchDeliveryStepEvents, getProfile, getWaitingElapsed } from '@/api/api'
import { Preferences } from '@capacitor/preferences'
import socket from '@/services/socket'

const route = useRoute()
const router = useIonRouter()
const id = route.params.id as string
const packStore = usePackStore()
const order = ref<any | null>(null)
const decisions = ref<Record<string, 'keep' | 'return' | null>>({})
const showPaymentSheet = ref(false)
const isCancelling = ref(false)
const pendingCancellationFees = ref(0)

const toast = ref({
  isOpen: false,
  message: '',
  duration: 3000,
  position: 'bottom' as 'bottom' | 'top' | 'middle',
  color: '',
  icon: '',
  cssClass: 'markit-toast'
})

const showToast = (options: {
  message: string,
  color?: 'success' | 'warning' | 'danger' | 'primary',
  icon?: string,
  duration?: number,
  position?: 'bottom' | 'top' | 'middle'
}) => {
  toast.value = {
    isOpen: true,
    message: options.message,
    duration: options.duration || 3000,
    position: options.position || 'bottom',
    color: options.color || '',
    icon: options.icon || '',
    cssClass: `markit-toast ${options.color === 'success' ? 'markit-toast-success' : options.color === 'warning' ? 'markit-toast-warning' : ''}`
  }
}

// Coupon related state
const showCouponModal = ref(false)
const selectedCompanyId = ref<string | null>(null)
const couponModalType = ref<'company' | 'app'>('company')
const availableCoupons = ref<any[]>([])
const companyCoupons = ref<Record<string, {
  code: string;
  couponId: string;
  type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
}>>({})
const MarkitCoupon = ref<{
  code: string;
  couponId: string;
  type: string;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  discount?: number;
} | null>(null)
const clientId = ref<string>('')

const deliveryConfirmed = ref(false)
const stepEvents = ref<Array<{ step: string; action: string; meta?: any; created_at: string }>>([])
const canPay = computed(() => deliveryConfirmed.value)
const orderStatus = computed(() => String(order.value?.order_status || '').toUpperCase())
const isCompanyCancelled = (companyId: string) =>
  !!order.value?.store_statuses?.[companyId]?.cancelled
const activeCompanies = computed(() =>
  (order.value?.companies || []).filter((company: any) => !isCompanyCancelled(company.id))
)
const hasAnyStorePicked = computed(() => {
  const storeStatuses = order.value?.store_statuses || {}
  return Object.values(storeStatuses).some((store: any) => !!store?.picked)
})
const isPickedOrLater = computed(() =>
  hasAnyStorePicked.value || ['PICKED', 'DELIVERED'].includes(orderStatus.value)
)
const isDriverAssigned = computed(() => !!order.value?.delivery_partner_id)
const cancellationPreviewFee = computed(() => {
  if (!order.value) return 0
  if (isPickedOrLater.value) return Math.max(0, Number(order.value.shipping || 0))
  if (isDriverAssigned.value) return 15
  return 0
})

/* ----- Customer waiting timer -----
   Source of truth = OrderStatusEvent table (server endpoint). Server returns
   elapsed = (DecisionDone.created_at OR NOW()) - Delivered.created_at, and
   customer_done = whether the DecisionDone/complete event exists. The client
   reconciles every 15s so refresh / long sessions stay consistent. */
const waitingElapsed = ref(0)
const customerWaitingDone = ref(false)
let waitingTickHandle: ReturnType<typeof setInterval> | null = null
let waitingResyncHandle: ReturnType<typeof setInterval> | null = null

const timerMinutes = computed(() => Math.floor(waitingElapsed.value / 60))
const timerSeconds = computed(() => waitingElapsed.value % 60)

const startWaitingTicker = () => {
  if (waitingTickHandle) return
  waitingTickHandle = setInterval(() => {
    if (customerWaitingDone.value) return
    waitingElapsed.value += 1
  }, 1000)
}

const stopWaitingTicker = () => {
  if (waitingTickHandle) {
    clearInterval(waitingTickHandle)
    waitingTickHandle = null
  }
  if (waitingResyncHandle) {
    clearInterval(waitingResyncHandle)
    waitingResyncHandle = null
  }
}

const reconcileWaitingElapsed = async () => {
  try {
    const res = await getWaitingElapsed(id)
    const data = res.data || {}
    const secs = Math.max(0, Math.floor(Number(data.elapsed_seconds || 0)))
    // Server is authoritative — overwrite local tick value on every reconcile.
    waitingElapsed.value = secs
    if (data.customer_done) {
      customerWaitingDone.value = true
      stopWaitingTicker()
    }
  } catch {
    // best-effort: keep ticking locally if endpoint fails
  }
}

watch(deliveryConfirmed, (val) => {
  if (val) {
    // Reconcile first so the timer renders the correct value before the first tick
    reconcileWaitingElapsed().finally(() => {
      if (!customerWaitingDone.value) {
        startWaitingTicker()
        if (!waitingResyncHandle) {
          waitingResyncHandle = setInterval(reconcileWaitingElapsed, 15000)
        }
      }
    })
  } else {
    stopWaitingTicker()
  }
})

// Stop ticking the moment the DecisionDone signal arrives via socket
watch(customerWaitingDone, (val) => {
  if (val) stopWaitingTicker()
})

const roundMoney = (value: number) => Math.round((Number(value) || 0) * 100) / 100
const getItemKey = (item: any) =>
  String(item?.cartItemId || `${item?.itemId || 'item'}:${item?.id || 'variant'}:${item?.size || 'nosize'}`)
const itemQty = (item: any) => Math.max(1, Number(item?.quantity || 1))
const itemLineLabel = (index: number) => `Trial piece ${index + 1}`
const isKept = (item: any) => decisions.value[getItemKey(item)] === 'keep'
const isReturned = (item: any) => decisions.value[getItemKey(item)] === 'return'
const itemValue = (item: any, field: 'd_price' | 's_price' = 'd_price') =>
  Number(item?.[field] || 0) * itemQty(item)

const calculateDiscountAmount = (
  coupon: {
    type: string
    discount_value: number
    max_discount_amount?: number
  } | null | undefined,
  subtotal: number
) => {
  if (!coupon || subtotal <= 0) return 0

  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = (subtotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
  } else if (coupon.type === 'FLAT') {
    discount = coupon.discount_value
  }

  return roundMoney(Math.min(discount, subtotal))
}

const calculateCompanyDiscount = (companyId: string) => {
  if (isCompanyCancelled(companyId)) return 0
  const coupon = companyCoupons.value[companyId]
  if (!coupon) return 0

  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return 0

  // Calculate kept items subtotal for this company
  const keptSubtotal = company.cartitems.reduce((sum: number, i: any) =>
    isKept(i) ? sum + itemValue(i) : sum, 0)

  if (keptSubtotal <= 0) return 0

  return calculateDiscountAmount(coupon, keptSubtotal)
}

// Function to calculate dynamic Markit discount
const calculateMarkitDiscount = () => {
  const coupon = MarkitCoupon.value
  if (!coupon) return 0

  // Calculate total kept items across all companies
  const totalKeptSubtotal = activeCompanies.value.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) =>
      isKept(i) ? sum + itemValue(i) : sum, 0)
  }, 0) || 0

  if (totalKeptSubtotal <= 0) return 0

  return calculateDiscountAmount(coupon, totalKeptSubtotal)
}

const getCompanyKeptSubtotal = (companyId: string) => {
  if (isCompanyCancelled(companyId)) return 0
  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return 0

  return company.cartitems.reduce((sum: number, i: any) =>
    isKept(i) ? sum + itemValue(i) : sum, 0)
}

const getOverallKeptSubtotal = () => {
  return activeCompanies.value.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) =>
      isKept(i) ? sum + itemValue(i) : sum, 0)
  }, 0) || 0
}
// ------------------- Computed -------------------
const allItems = computed(() => {
  if (!order.value) return []
  return activeCompanies.value.flatMap((c: any) => c.cartitems)
})

const allDecided = computed(() => {
  if (!allItems.value.length) return false
  return allItems.value.every((item: any) => decisions.value[getItemKey(item)])
})

const selectedCompanyKeptSubtotal = computed(() => {
  if (!selectedCompanyId.value || !order.value) return 0

  const company = activeCompanies.value.find((c: any) => c.id === selectedCompanyId.value)
  if (!company) return 0

  // Only sum the kept items in this company
  return company.cartitems.reduce((sum: number, i: any) =>
    isKept(i) ? sum + itemValue(i) : sum, 0)
})

// Watch for decisions changes and remove coupons if kept items become 0
watch(decisions, () => {
  if (!order.value) return

  // Check each company
  order.value.companies.forEach((company: any) => {
    if (isCompanyCancelled(company.id)) {
      if (companyCoupons.value[company.id]) {
        removeCompanyCoupon(company.id)
      }
      return
    }

    const keptItemsValue = company.cartitems.reduce((sum: number, i: any) =>
      isKept(i) ? sum + itemValue(i) : sum, 0)

    // If kept items value is 0 and company has a coupon, remove it
    const companyCoupon = companyCoupons.value[company.id]
    const minOrder = Number(companyCoupon?.min_order_value || 0)
    if (companyCoupon && (keptItemsValue === 0 || keptItemsValue < minOrder)) {
      removeCompanyCoupon(company.id)
    }
  })

  // Check Markit coupon
  const totalKeptValue = activeCompanies.value.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) =>
      isKept(i) ? sum + itemValue(i) : sum, 0)
  }, 0)

  const markitMinOrder = Number(MarkitCoupon.value?.min_order_value || 0)
  if (MarkitCoupon.value && (totalKeptValue === 0 || totalKeptValue < markitMinOrder)) {
    removeMarkitCoupon()
  }
}, { deep: true })

// Company-specific summary
const companySummary = (companyId: string) => {
  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return { subtotal: 0, discount: 0, total: 0 }
  if (isCompanyCancelled(companyId)) return { subtotal: 0, discount: 0, total: 0 }

  const keptItems = company.cartitems.filter(isKept)
  const subtotal = keptItems.reduce((sum: number, i: any) => sum + itemValue(i), 0)

  // Calculate dynamic coupon discount
  const couponDiscount = calculateCompanyDiscount(companyId)

  return {
    subtotal: roundMoney(subtotal),
    discount: couponDiscount,
    total: roundMoney(Math.max(0, subtotal - couponDiscount))
  }
}

/* Customer's total share of the waiting fee = max − sum(store shares).
   Stays constant for the order. */
const customerMaxWaitingFee = computed(() => {
  if (!order.value) return 0
  const max = Number(order.value.waiting_fee || 0)
  const storeMap = (order.value.waiting_fees_store || {}) as Record<string, any>
  const storeTotal = Object.values(storeMap).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
  return Math.max(0, max - storeTotal)
})

/* Customer's share of the delivery fee = shipping − sum(store shares). */
const customerDeliveryFee = computed(() => {
  if (!order.value) return 0
  const shipping = Number(order.value.shipping || 0)
  const storeMap = (order.value.delivery_fees_store || {}) as Record<string, any>
  const storeTotal = Object.values(storeMap).reduce((s: number, v: any) => s + (Number(v) || 0), 0)
  return Math.max(0, Math.round((shipping - storeTotal) * 100) / 100)
})

/* Live customer share — divide the customer's total by max minutes,
   multiply by elapsed minutes, cap at the customer's total. */
const liveWaitingFeeCustomer = computed(() => {
  const customerMax = customerMaxWaitingFee.value
  const maxMinutes = Number(order.value?.waiting_time || 0)
  if (customerMax <= 0 || maxMinutes <= 0) return 0
  const elapsedMin = waitingElapsed.value / 60
  const live = Math.min(customerMax, (customerMax / maxMinutes) * elapsedMin)
  return Math.round(live * 100) / 100
})

/* Overflow billing — once the timer crosses the max budgeted minutes,
   stop the share-based math and just charge ₹0.5 per extra minute. */
const overflowMinutes = computed(() => {
  const maxMinutes = Number(order.value?.waiting_time || 0)
  if (maxMinutes <= 0) return 0
  return Math.max(0, Math.floor(waitingElapsed.value / 60 - maxMinutes))
})

const overflowFee = computed(() => overflowMinutes.value * 1)
const isPastCap = computed(() => overflowMinutes.value > 0)

/* ---- Trial-based deductions ----
   Reward customers for keeping items: ₹4 off delivery per ₹100 kept,
   ₹15 off waiting fee per kept item. Both capped at the customer fee. */
const keptItemCount = computed(() => {
  if (!order.value) return 0
  return activeCompanies.value.reduce((sum: number, company: any) =>
    sum + company.cartitems
      .filter(isKept)
      .reduce((s: number, i: any) => s + itemQty(i), 0), 0)
})

const keptSubtotal = computed(() => {
  if (!order.value) return 0
  return activeCompanies.value.reduce((sum: number, company: any) =>
    sum + company.cartitems
      .filter(isKept)
      .reduce((s: number, i: any) => s + itemValue(i), 0), 0)
})

const deliveryDeductionRaw = computed(() => Math.floor(keptSubtotal.value / 100) * 4)
const waitingDeductionRaw = computed(() => keptItemCount.value * 15)

const deliveryDeduction = computed(() =>
  Math.min(customerDeliveryFee.value, deliveryDeductionRaw.value)
)

const waitingFeeGross = computed(() =>
  Math.round((liveWaitingFeeCustomer.value + overflowFee.value) * 100) / 100
)
const waitingDeduction = computed(() =>
  Math.min(waitingFeeGross.value, waitingDeductionRaw.value)
)

const deliveryFeeNet = computed(() =>
  Math.max(0, Math.round((customerDeliveryFee.value - deliveryDeduction.value) * 100) / 100)
)
const waitingFeeNet = computed(() =>
  Math.max(0, Math.round((waitingFeeGross.value - waitingDeduction.value) * 100) / 100)
)

const summary = computed(() => {
  if (!order.value) return {
    subtotal: 0, delivery: 0, deliveryCustomer: 0,
    waitingFees: 0, waitingFeesCustomer: 0,
    cancellationFees: 0, discount: 0, companyDiscounts: 0, total: 0,
  }

  let subtotal = 0
  let companyDiscounts = 0

  activeCompanies.value.forEach((company: any) => {
    // Only sum kept items for actual total
    const keptItems = company.cartitems.filter(isKept)
    subtotal += keptItems.reduce((sum: number, i: any) => sum + itemValue(i), 0)
    companyDiscounts += calculateCompanyDiscount(company.id)
  })

  const delivery = Number(order.value.shipping || 0)
  const waitingFees = Number(order.value.waiting_fee || 0)
  const MarkitDiscount = calculateMarkitDiscount()

  // Customer-payable amount uses the customer's *net* fee (after trial deductions)
  const total = roundMoney(
    Math.max(0, subtotal + deliveryFeeNet.value + waitingFeeNet.value + pendingCancellationFees.value - MarkitDiscount - companyDiscounts)
  )

  return {
    subtotal: roundMoney(subtotal),
    delivery: roundMoney(delivery),
    deliveryCustomer: roundMoney(deliveryFeeNet.value),
    waitingFees: roundMoney(waitingFees),
    waitingFeesCustomer: roundMoney(waitingFeeNet.value),
    cancellationFees: roundMoney(pendingCancellationFees.value),
    discount: MarkitDiscount,
    companyDiscounts: roundMoney(companyDiscounts),
    total,
  }
})

// ------------------- Lifecycle -------------------
onIonViewWillEnter(async () => {
  await packStore.loadFromStorage()
  await packStore.fetchFromApi()
  order.value = packStore.getById(id)

  // Get client ID from storage
  const clientData = await Preferences.get({ key: 'client' })
  if (clientData.value) {
    const client = JSON.parse(clientData.value)
    clientId.value = client.id
  }

  if (clientId.value) {
    try {
      const profileRes = await getProfile()
      pendingCancellationFees.value = roundMoney(Number(profileRes.data?.cancellationFees || 0))
    } catch {
      pendingCancellationFees.value = 0
    }
  }

  if (order.value) {
    order.value.companies.forEach((company: any) => {
      company.cartitems.forEach((item: any) => {
        decisions.value[getItemKey(item)] = null
      })
    })
  }

  // Ensure this page is in the client socket room for real-time updates
  if (clientId.value) {
    socket.emit('joinClient', clientId.value)
  }

  // Fetch delivery step events (also determines timer start/freeze state)
  fetchDeliveryStepEvents(id)
    .then((res) => {
      const events = res.data?.events || []
      stepEvents.value = events
      deliveryConfirmed.value = events.some(
        (e: any) => e.step === 'Delivered' && e.action === 'complete'
      )
      if (events.some((e: any) => e.step === 'DecisionDone' && e.action === 'complete')) {
        customerWaitingDone.value = true
      }
    })
    .catch(() => {})

  // Fetch available coupons
  await loadCoupons()
})

watch(
  () => packStore.packList,
  () => {
    order.value = packStore.getById(id)
  },
  { deep: true }
)

// Real-time: delivery step updates from delivery partner
const onDeliveryStep = (data: { trynbuy_id: string; step: string; action: string; meta?: any }) => {
  if (data.trynbuy_id === id) {
    stepEvents.value = [...stepEvents.value, {
      step: data.step,
      action: data.action,
      meta: data.meta,
      created_at: new Date().toISOString(),
    }]
    if (data.step === 'Delivered' && data.action === 'complete') {
      deliveryConfirmed.value = true
    }
    if (data.step === 'DecisionDone' && data.action === 'complete') {
      // Re-fetch from server so the frozen elapsed reflects the actual event timestamp
      reconcileWaitingElapsed()
      customerWaitingDone.value = true
    }
  }
}
// Real-time: trynbuyUpdate from /delivered endpoint (backup for deliveryConfirmed)
// Only ever flip ON — earlier-state emits (e.g. PACKED from storetools)
// must not regress the flag and tear down the timer.
const onTrynbuyUpdate = (data: {
  trynbuy_id: string
  order_status: string
  partial_cancellation?: boolean
  cancelled_store_id?: string | null
  cancelled_store_name?: string | null
}) => {
  if (data.trynbuy_id !== id) return
  const status = String(data.order_status || '').toUpperCase()
  if (data.partial_cancellation && data.cancelled_store_id) {
    removeCompanyCoupon(data.cancelled_store_id)
    showToast({
      message: `${data.cancelled_store_name || 'One store'} cancelled its part of this order.`,
      color: 'warning',
      duration: 3500,
    })
  }
  if (status === 'CANCELLED') {
    showToast({
      message: 'This order was cancelled.',
      color: 'warning',
      duration: 3000,
    })
    packStore.remove(id)
    router.push({ name: 'shops' })
    return
  }
  if (['DELIVERED', 'DECISION_DONE', 'RETURNED', 'COMPLETED'].includes(status)) {
    deliveryConfirmed.value = true
  }
}
socket.on('deliveryStepUpdate', onDeliveryStep)
socket.on('trynbuyUpdate', onTrynbuyUpdate)
onUnmounted(() => {
  socket.off('deliveryStepUpdate', onDeliveryStep)
  socket.off('trynbuyUpdate', onTrynbuyUpdate)
  stopWaitingTicker()
})

// ------------------- Coupon Functions -------------------
async function loadCoupons() {
  try {
    if (!order.value || !order.value.companies) {
      return;
    }

    availableCoupons.value = [];

    // First, fetch company-specific coupons for each company
    for (const company of activeCompanies.value) {
      const companyIdForApi = company.id;

      if (!companyIdForApi) {
        continue;
      }

      try {
        const response = await fetchCoupons(companyIdForApi, clientId.value);

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const transformedCoupons = response.data.map((coupon: any) => {
            let description = '';
            if (coupon.type === 'PERCENTAGE') {
              description = `${coupon.discount_value}% off`;
              if (coupon.max_discount_amount) {
                description += ` up to ₹${coupon.max_discount_amount}`;
              }
            } else if (coupon.type === 'FLAT') {
              description = `₹${coupon.discount_value} off`;
            } else {
              description = 'Special offer';
            }

            return {
              id: coupon.id,
              code: coupon.code,
              type: coupon.type,
              discount_value: coupon.discount_value,
              max_discount_amount: coupon.max_discount_amount,
              min_order_value: coupon.min_order_value,
              description: description,
              isMarkit: false,
              companyId: companyIdForApi,
              companyName: company.name
            };
          });

          availableCoupons.value = [...availableCoupons.value, ...transformedCoupons];
        }
      } catch (error) {
        console.error(`Error fetching coupons for company ${company.name}:`, error);
      }
    }

    // Now fetch Markit coupons (app-wide coupons)
    try {
      const markitResponse = await fetchCoupons('markit', clientId.value, 'markit');

      if (markitResponse.data && Array.isArray(markitResponse.data) && markitResponse.data.length > 0) {
        const markitCoupons = markitResponse.data.map((coupon: any) => {
          let description = '';
          if (coupon.type === 'PERCENTAGE') {
            description = `${coupon.discount_value}% off`;
            if (coupon.max_discount_amount) {
              description += ` up to ₹${coupon.max_discount_amount}`;
            }
          } else if (coupon.type === 'FLAT') {
            description = `₹${coupon.discount_value} off`;
          }

          if (coupon.min_order_value) {
            description += ` (Min. order ₹${coupon.min_order_value})`;
          }

          return {
            id: coupon.id,
            code: coupon.code,
            type: coupon.type,
            discount_value: coupon.discount_value,
            max_discount_amount: coupon.max_discount_amount,
            min_order_value: coupon.min_order_value,
            description: description,
            isMarkit: true,
            companyId: null,
            companyName: 'Markit'
          };
        });

        availableCoupons.value = [...availableCoupons.value, ...markitCoupons];
      }
    } catch (error) {
      console.error('Error fetching Markit coupons:', error);
    }
  } catch (error) {
    console.error('Error in loadCoupons:', error);
  }
}

function openCompanyCouponModal(company: any) {
  if (isCompanyCancelled(company.id)) {
    showToast({
      message: `${formatCompanyName(company.name)} cancelled its part of this order.`,
      color: 'warning',
    })
    return
  }
  selectedCompanyId.value = company.id;
  couponModalType.value = 'company';
  showCouponModal.value = true;
}

function openMarkitCouponModal() {
  selectedCompanyId.value = null
  couponModalType.value = 'app'
  showCouponModal.value = true
}

async function handleApplyCoupon(data: {
  code: string;
  discount?: number;
  discountType?: string;
  discountValue?: number;
  companyId?: string;
  isMarkit?: boolean;
  isManual?: boolean;
}) {
  try {
    if (!clientId.value) {
      showToast({
        message: 'Please login to apply coupons',
        color: 'warning',
        icon: 'warning-outline'
      })
      return
    }

    const companyId = data.companyId

    if (data.companyId && !companyId) {
      showToast({
        message: 'Invalid coupon',
        color: 'warning',
        icon: 'warning-outline'
      })
      return
    }

    const keptItemsValue = data.companyId
      ? getCompanyKeptSubtotal(data.companyId)
      : getOverallKeptSubtotal()

    if (keptItemsValue <= 0) {
      showToast({
        message: 'Please select items to keep before applying coupon',
        color: 'warning',
        icon: 'warning-outline'
      })
      return
    }

    // Additional frontend validation for known coupons
    if (!data.isManual) {
      // Find the coupon in available coupons
      const coupon = availableCoupons.value.find(
        c => c.code.toUpperCase() === data.code.toUpperCase() &&
          (data.companyId ? c.companyId === data.companyId : true)
      )

      if (coupon) {
        const minOrder = coupon.min_order_value || 0
        if (keptItemsValue < minOrder) {
          showToast({
            message: `Minimum order of ₹${minOrder} required`,
            color: 'warning',
            icon: 'warning-outline'
          })
          return
        }
      }
    }

    // Prepare request data with keptItemsValue instead of original order value
    const requestData = {
      code: data.code,
      companyId: companyId || '',
      clientId: clientId.value,
      orderValue: keptItemsValue,
      isMarkit: !data.companyId,
    }

    const response = await validateCoupon(requestData)
    if (response.data.valid) {
      if (data.companyId) {
        const originalCoupon = availableCoupons.value.find(
          c => c.code.toUpperCase() === data.code.toUpperCase()
        )

        companyCoupons.value[data.companyId] = {
          code: response.data.coupon.code,
          couponId: response.data.coupon.id,
          type: response.data.coupon.type,
          discount_value: originalCoupon?.discount_value ||
            (response.data.coupon.type === 'PERCENTAGE'
              ? parseFloat(response.data.coupon.originalDiscount)
              : response.data.coupon.discount),
          max_discount_amount: originalCoupon?.max_discount_amount,
          min_order_value: originalCoupon?.min_order_value
        }
      } else {
        const originalCoupon = availableCoupons.value.find(
          c => c.code.toUpperCase() === data.code.toUpperCase() && c.isMarkit
        )

        MarkitCoupon.value = {
          code: response.data.coupon.code,
          couponId: response.data.coupon.id,
          type: response.data.coupon.type,
          discount_value: originalCoupon?.discount_value ||
            (response.data.coupon.type === 'PERCENTAGE'
              ? parseFloat(response.data.coupon.originalDiscount)
              : response.data.coupon.discount),
          max_discount_amount: originalCoupon?.max_discount_amount,
          min_order_value: originalCoupon?.min_order_value,
          discount: calculateDiscountAmount(originalCoupon, keptItemsValue),
        }
      }

      showToast({
        message: response.data.message || 'Coupon applied successfully!',
        color: 'success',
        icon: 'checkmark-circle-outline',
        duration: 2000
      })
      showCouponModal.value = false
    } else {
      showToast({
        message: response.data.error || 'Coupon cannot be applied',
        color: 'warning',
        icon: 'warning-outline'
      })
    }
  } catch (error: any) {
    console.error('Error applying coupon:', error)
    const errorMessage = error.response?.data?.error
      || error.response?.data?.message
      || 'Failed to apply coupon'
    showToast({
      message: errorMessage,
      color: 'danger',
      icon: 'close-circle-outline'
    })
  }
}

function removeCompanyCoupon(companyId: string) {
  delete companyCoupons.value[companyId]
}

function removeMarkitCoupon() {
  MarkitCoupon.value = null
}
// ------------------- Existing Functions -------------------
function toggleDecision(itemId: string, decision: 'keep' | 'return') {
  decisions.value[itemId] = decision
}

async function proceed() {
  if (!canPay.value) {
    showToast({ message: 'Please wait until the delivery is completed.', color: 'warning' })
    return
  }
  const amount = summary.value.total
  if (amount <= 0) {
    // All returned — no payment needed, submit bills directly
    await submitBills('NONE')
    return
  }
  // Show Cash / UPI choice
  showPaymentSheet.value = true
}

function onPaymentMethodSelected(method: 'CASH' | 'UPI') {
  showPaymentSheet.value = false
  submitBills(method)
}

async function cancelOrder() {
  if (!order.value || isCancelling.value) return

  const fee = cancellationPreviewFee.value
  const message = fee > 0
    ? `${isPickedOrLater.value ? 'Delivery has already picked item(s).' : 'A delivery partner has already accepted this order.'} Cancelling now adds a fee of ₹${fee.toFixed(2)} to your next order. Continue?`
    : 'Cancel this order?'

  if (!window.confirm(message)) return

  isCancelling.value = true
  try {
    const res = await cancelTrynBuyOrder(order.value.trynbuy_id)
    const charged = Number(res.data?.cancellationFee || 0)
    const banned = !!res.data?.ban

    packStore.remove(order.value.trynbuy_id)
    showToast({
      message: banned
        ? 'Order cancelled. Account banned after 3 repeated picked-order cancellations.'
        : charged > 0
          ? `Order cancelled. ₹${charged.toFixed(2)} will be added to your next order.`
          : 'Order cancelled.',
      color: banned ? 'danger' : charged > 0 ? 'warning' : 'success',
      duration: 4000,
    })
    router.push({ name: 'shops' })
  } catch (error: any) {
    const message = error.response?.data?.error || 'Unable to cancel this order'
    showToast({ message, color: 'danger', icon: 'close-circle-outline' })
  } finally {
    isCancelling.value = false
  }
}

async function submitBills(paymentMethod: 'CASH' | 'UPI' | 'NONE') {
  try {
    const amount = summary.value.total
    const allocatedMarkitDiscount = calculateMarkitDiscount()
    const billingCompanies = activeCompanies.value

    // Collect all returned items across all companies for the delivery partner
    const allReturnedItems = billingCompanies.flatMap((company: any) =>
      company.cartitems
        .filter(isReturned)
        .map((i: any) => ({ id: i.id, cartItemId: i.cartItemId, itemId: i.itemId, name: i.name, size: i.size, quantity: itemQty(i), companyId: company.id, companyName: company.name }))
    )

    // Notify delivery partner before creating bills
    socket.emit('customerProceed', {
      trynbuyId: order.value.trynbuy_id,
      paymentMethod,
      amount,
      returnedItems: allReturnedItems,
    })

    const companies = billingCompanies.map((company: any) => {
      const keptItems = company.cartitems.filter(isKept)
      const companyCouponDiscount = calculateCompanyDiscount(company.id)
      const companyKeptSubtotal = keptItems.reduce((s: number, i: any) => s + itemValue(i), 0)
      return {
        trynbuyId: order.value.trynbuy_id,
        companyId: company.id,
        companyName: company.name,
        paymentMethod,
        transactionId: null,
        subtotal: companyKeptSubtotal,
        grandTotal: Math.max(0, roundMoney(companyKeptSubtotal - companyCouponDiscount)),
        discount: keptItems.reduce((s: number, i: any) => s + ((Number(i.s_price || 0) - Number(i.d_price || 0)) * itemQty(i)), 0),
        deliveryFees: 0,
        waitingFee: 0,
        cancellationFees: 0,
        keptItems: keptItems.map((i: any) => ({
          ...i,
          cartItemId: i.cartItemId,
          quantity: itemQty(i),
        })),
        returnedItems: company.cartitems
          .filter(isReturned)
          .map((i: any) => ({ id: i.id, cartItemId: i.cartItemId, itemId: i.itemId, quantity: itemQty(i), name: i.name })),
        couponId: companyCoupons.value[company.id]?.couponId || null,
        appliedCoupon: companyCoupons.value[company.id]?.code || null,
        couponDiscount: companyCouponDiscount,
      }
    })

    const checkoutRes = await completeTrynBuyCheckout({
      trynbuyId: order.value.trynbuy_id,
      paymentMethod,
      transactionId: null,
      customerGrandTotal: amount,
      customerCancellationFees: pendingCancellationFees.value,
      markitCouponId: MarkitCoupon.value?.couponId || null,
      markitCouponCode: MarkitCoupon.value?.code || null,
      markitCouponDiscount: allocatedMarkitDiscount,
      deliveryDiscount: deliveryDeduction.value,
      waitingDiscount: waitingDeduction.value,
      companies,
    })

    if (checkoutRes.data?.success) {
      pendingCancellationFees.value = 0
      showToast({ message: 'Checkout completed!', color: 'success', icon: 'checkmark-circle-outline', duration: 3000 })
    } else {
      showToast({ message: 'Some items checkout failed. Retry later.', color: 'warning', icon: 'warning-outline', duration: 4000 })
    }

    packStore.remove(order.value.trynbuy_id)
    router.push({ name: 'shops' })
  } catch (error) {
    console.error('Checkout error:', error)
    showToast({ message: 'Something went wrong', color: 'danger', icon: 'close-circle-outline' })
  }
}

function formatCompanyName(name: string) {
  if (!name) return ''
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.pack-content {
  --background: var(--markit-bg);
}

.otp-card {
  background: #fff7ed;
  border: 1px solid rgba(245, 158, 11, 0.38);
  border-radius: var(--markit-radius-lg);
  padding: 16px;
  text-align: center;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8), var(--markit-glass-shadow);
}
.otp-card-label {
  font-size: 13px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 6px;
}
.otp-card-code {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 8px;
  color: #78350f;
  font-family: monospace;
}
.otp-card-hint {
  font-size: 11px;
  color: #b45309;
  margin-top: 4px;
}

.company-card {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  padding: 14px;
  box-shadow: var(--markit-glass-shadow);
}

.company-card-cancelled {
  border-color: #dc2626;
  background: linear-gradient(180deg, rgba(254, 242, 242, 0.98), rgba(255, 255, 255, 0.98));
}

.company-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--markit-border);
}

.company-title-wrap {
  min-width: 0;
}

.company-title {
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
}

.company-meta {
  margin-top: 2px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--markit-text-muted);
}

.company-cancelled-banner {
  margin-top: 8px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(220, 38, 38, 0.1);
  color: #b91c1c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.company-card-cancelled .item-row,
.company-card-cancelled .company-summary {
  opacity: 0.78;
}

.item-row {
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px 0;
  margin-bottom: 0;
  border-bottom: 1px solid var(--markit-border);
}

.item-row:last-of-type {
  border-bottom: 0;
}

.item-media {
  width: 82px;
  height: 104px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
}

.item-info {
  min-width: 0;
}

.item-name {
  font-size: 0.92rem;
  line-height: 1.3;
  font-weight: 800;
  color: var(--markit-text);
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 5px;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--markit-text-muted);
}

.decision-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.decision-row ion-button {
  min-width: 72px;
  height: 32px;
  --border-radius: var(--markit-btn-radius);
}

.item-price {
  text-align: right;
  white-space: nowrap;
}

.item-price-current {
  font-size: 0.94rem;
  line-height: 1.25;
  font-weight: 800;
  color: var(--markit-text);
}

.item-price-strike {
  margin-top: 2px;
  font-size: 0.76rem;
  color: var(--markit-text-muted);
  text-decoration: line-through;
}

.company-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--markit-border);
  background: var(--markit-surface-muted);
  border-radius: var(--markit-radius-lg);
  padding: 12px;
}

.company-total {
  border-top: 1px dashed #d1d5db;
}

.card {
  background: var(--markit-surface);
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  padding: 18px;
  margin-bottom: 96px;
  box-shadow: var(--markit-glass-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.coupon-btn {
  --padding-start: 8px;
  --padding-end: 8px;
  font-size: 12px;
}

.applied-coupon {
  display: flex;
  align-items: center;
  justify-content: space-between;
}


.remove-coupon {
  width: 28px;
  min-width: 28px;
  --padding-start: 4px;
  --padding-end: 4px;
  height: 24px;

  --background: transparent;
  --background-hover: transparent;
  --background-activated: transparent;
  --background-focused: transparent;

  --box-shadow: none;
  --ripple-color: transparent;
}

/* Remove focus ring */
.remove-coupon::part(native) {
  outline: none !important;
  box-shadow: none !important;
}


ion-button {
  --border-width: 1px !important;
  box-sizing: border-box;
  min-width: 80px;
}

.item-row:last-child {
  margin-bottom: 0;
}

.pack-footer {
  background: transparent;
}

.pack-footer-bg {
  background: var(--markit-glass-surface);
  border-bottom: none;
  border-top: 1px solid var(--markit-glass-border);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 -8px 18px rgba(20, 34, 28, 0.06);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  padding: 12px 14px calc(var(--markit-bottom-inset) + 12px);
}

.pack-footer-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.pack-footer-value {
  flex: 0 0 auto;
  font-size: 1.25rem;
  line-height: 1.1;
  font-weight: 800;
  color: var(--markit-text);
  white-space: nowrap;
  padding: 10px 14px;
  border-radius: 14px;
  border: 1px solid var(--markit-border);
  background: color-mix(in srgb, var(--ion-color-primary) 6%, #ffffff);
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight);
}

.pack-footer-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 22%, var(--markit-border));
  color: var(--ion-color-primary);
  font-size: 0.74rem;
  font-weight: 600;
  margin-bottom: 10px;
}

.pack-footer-hint-icon {
  font-size: 0.95rem;
}

.pack-pay-btn {
  --background: var(--ion-color-primary);
  --background-hover: var(--ion-color-primary);
  --background-activated: var(--ion-color-primary);
  --background-focused: var(--ion-color-primary);
  --color: #ffffff;
  --border-radius: 14px;
  --box-shadow: none;
  flex: 1 1 0;
  min-width: 0;
  min-height: 48px;
  margin: 0;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.pack-pay-btn::part(native) {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 70%, #ffffff);
}

.pack-cancel-btn {
  --border-radius: 14px;
  --box-shadow: none;
  flex: 0 0 auto;
  min-width: 92px;
  min-height: 48px;
  margin: 0;
  font-weight: 700;
}

.waiting-timer-card {
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff);
  border-radius: var(--markit-radius-lg);
  padding: 12px 14px;
  text-align: center;
}

.waiting-timer-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.waiting-timer-display {
  margin-top: 4px;
  font-family: monospace;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--markit-text);
  letter-spacing: 2px;
}

.waiting-timer-cap {
  margin-top: 2px;
  font-size: 0.72rem;
  color: var(--markit-text-muted);
}

.waiting-timer-note {
  margin-top: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--markit-text-muted);
}

.waiting-timer-card.is-overflow {
  border-color: rgba(217, 119, 6, 0.45);
  background: #fff7ed;
}

.waiting-timer-card.is-overflow .waiting-timer-title {
  color: #b45309;
}

.waiting-timer-card.is-overflow .waiting-timer-display {
  color: #b45309;
}

.waiting-timer-card.is-overflow .waiting-timer-note {
  color: #b45309;
}

@media (max-width: 380px) {
  .item-row {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .item-price {
    grid-column: 2;
    text-align: left;
  }
}
</style>
