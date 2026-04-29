<template>
  <ion-page>
    <Topbar title="Order Details" />

    <ion-content class="ion-padding" :fullscreen="true">
      <div v-if="order">
        <!-- Delivery step tracker -->
        <DeliveryTracker
          :events="stepEvents"
          :storeCount="order.companies?.length ?? 1"
          :packed="['PACKED', 'DELIVERED', 'PAID', 'COMPLETED'].includes(String(order.order_status || '').toUpperCase())"
        />

        <!-- Delivery OTP card -->
        <div v-if="order.delivery_otp" class="otp-card mb-4">
          <div class="otp-card-label">Your Delivery OTP</div>
          <div class="otp-card-code">{{ order.delivery_otp }}</div>
          <div class="otp-card-hint">Share this with the delivery person to confirm delivery</div>
        </div>

        <!-- ================= PER COMPANY CARDS ================= -->
        <div v-for="(company, index) in order.companies" :key="company.id" class="company-card mb-4">
          <!-- Company Header -->
          <div class="company-header">
            <div class="font-bold text-lg text-gray-800">
              {{ formatCompanyName(company.name) }}
            </div>
            <ion-button size="small" fill="outline" color="primary" @click="openCompanyCouponModal(company)"
              class="coupon-btn">
              <ion-icon :icon="pricetagOutline" slot="start"></ion-icon>
              Apply Coupon
            </ion-button>
          </div>
          <!-- Company Items -->
          <div v-for="item in company.cartitems" :key="item.id" class="flex mb-5 item-row">
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
              <div class="text-xs text-gray-500">Qty: {{ item.quantity }}</div>

              <div class="mt-2 flex gap-2">
                <ion-button size="small" color="danger" :fill="decisions[item.id] === 'return' ? 'solid' : 'outline'"
                  @click="toggleDecision(item.id, 'return')">
                  Return
                </ion-button>

                <ion-button size="small" color="primary" :fill="decisions[item.id] === 'keep' ? 'solid' : 'outline'"
                  @click="toggleDecision(item.id, 'keep')">
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
            <div v-if="companyCoupons[company.id]" class="applied-coupon mt-2">
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

          <div class="flex justify-between text-sm mb-2">
            <span>Delivery Fees</span>
            <span>₹ {{ summary.delivery }}</span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Waiting Fees</span>
            <span class="flex items-center gap-2">
              <span class="line-through text-gray-400">&#8377; {{ order.waiting_fee || 0 }}</span>
              <span>&#8377; 0</span>
            </span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Waiting Time</span>
            <span>{{ order.waiting_time || 0 }} mins</span>
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

    <!-- Payment Method Sheet -->
    <ion-action-sheet
      :is-open="showPaymentSheet"
      header="How will the customer pay?"
      :buttons="[
        { text: 'Cash', icon: 'cash-outline', handler: () => submitBills('CASH') },
        { text: 'UPI', icon: 'qr-code-outline', handler: () => submitBills('UPI') },
        { text: 'Cancel', role: 'cancel' },
      ]"
      @didDismiss="showPaymentSheet = false"
    />
    <!-- Footer -->
    <ion-footer class="pack-footer">
      <div class="pack-footer-bg">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="flex items-center gap-2">
            <div class="text-sm text-gray-600">Total Amount</div>
            <div class="text-lg font-semibold text-gray-900">&#8377; {{ summary.total }}</div>
          </div>

          <ion-button expand="block" shape="round"
            :color="allDecided && canPay ? 'primary' : 'medium'"
            :disabled="!allDecided || !canPay"
            @click="proceed">
            Proceed to Payment
          </ion-button>
        </div>
        <div v-if="allDecided && !canPay" class="px-4 pb-2 text-xs text-gray-500">
          Waiting for delivery confirmation
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
import { IonPage, IonContent, IonButton, IonFooter, IonIcon, IonToast, IonActionSheet } from '@ionic/vue'
import { pricetagOutline, checkmarkCircleOutline, closeOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import CouponModal from '@/components/CouponModal.vue'
import DeliveryTracker from '@/components/DeliveryTracker.vue'
import { usePackStore } from '@/store/usePackStore'
import { createTrynBuyBill, fetchCoupons, validateCoupon, fetchDeliveryStepEvents } from '@/api/api'
import { Preferences } from '@capacitor/preferences'
import socket from '@/services/socket'

const route = useRoute()
const router = useIonRouter()
const id = route.params.id as string
const packStore = usePackStore()
const order = ref<any | null>(null)
const decisions = ref<Record<string, 'keep' | 'return' | null>>({})
const showPaymentSheet = ref(false)

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
const stepEvents = ref<Array<{ step: string; action: string; created_at: string }>>([])
const canPay = computed(() => deliveryConfirmed.value)

const roundMoney = (value: number) => Math.round((Number(value) || 0) * 100) / 100

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
  const coupon = companyCoupons.value[companyId]
  if (!coupon) return 0

  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return 0

  // Calculate kept items subtotal for this company
  const keptSubtotal = company.cartitems.reduce((sum: number, i: any) => {
    if (decisions.value[i.id] === 'keep') {
      return sum + i.d_price
    }
    return sum
  }, 0)

  if (keptSubtotal <= 0) return 0

  return calculateDiscountAmount(coupon, keptSubtotal)
}

// Function to calculate dynamic Markit discount
const calculateMarkitDiscount = () => {
  const coupon = MarkitCoupon.value
  if (!coupon) return 0

  // Calculate total kept items across all companies
  const totalKeptSubtotal = order.value?.companies.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) => {
      if (decisions.value[i.id] === 'keep') {
        return sum + i.d_price
      }
      return sum
    }, 0)
  }, 0) || 0

  if (totalKeptSubtotal <= 0) return 0

  return calculateDiscountAmount(coupon, totalKeptSubtotal)
}

const getCompanyKeptSubtotal = (companyId: string) => {
  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return 0

  return company.cartitems.reduce((sum: number, i: any) => {
    if (decisions.value[i.id] === 'keep') {
      return sum + i.d_price
    }
    return sum
  }, 0)
}

const getOverallKeptSubtotal = () => {
  return order.value?.companies.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) => {
      if (decisions.value[i.id] === 'keep') {
        return sum + i.d_price
      }
      return sum
    }, 0)
  }, 0) || 0
}
// ------------------- Computed -------------------
const allItems = computed(() => {
  if (!order.value) return []
  return order.value.companies.flatMap((c: any) => c.cartitems)
})

const allDecided = computed(() => {
  if (!allItems.value.length) return false
  return allItems.value.every((item: any) => decisions.value[item.id])
})

const selectedCompanyKeptSubtotal = computed(() => {
  if (!selectedCompanyId.value || !order.value) return 0

  const company = order.value.companies.find((c: any) => c.id === selectedCompanyId.value)
  if (!company) return 0

  // Only sum the kept items in this company
  return company.cartitems.reduce((sum: number, i: any) => {
    if (decisions.value[i.id] === 'keep') {
      return sum + i.d_price
    }
    return sum
  }, 0)
})

// Watch for decisions changes and remove coupons if kept items become 0
watch(decisions, () => {
  if (!order.value) return

  // Check each company
  order.value.companies.forEach((company: any) => {
    const keptItemsValue = company.cartitems.reduce((sum: number, i: any) => {
      if (decisions.value[i.id] === 'keep') {
        return sum + i.d_price
      }
      return sum
    }, 0)

    // If kept items value is 0 and company has a coupon, remove it
    if (keptItemsValue === 0 && companyCoupons.value[company.id]) {
      removeCompanyCoupon(company.id)
    }
  })

  // Check Markit coupon
  const totalKeptValue = order.value.companies.reduce((total: number, company: any) => {
    return total + company.cartitems.reduce((sum: number, i: any) => {
      if (decisions.value[i.id] === 'keep') {
        return sum + i.d_price
      }
      return sum
    }, 0)
  }, 0)

  if (totalKeptValue === 0 && MarkitCoupon.value) {
    removeMarkitCoupon()
  }
}, { deep: true })

// Company-specific summary
const companySummary = (companyId: string) => {
  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return { subtotal: 0, discount: 0, total: 0 }

  const keptItems = company.cartitems.filter((i: any) => decisions.value[i.id] === 'keep')
  const subtotal = keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)

  // Calculate dynamic coupon discount
  const couponDiscount = calculateCompanyDiscount(companyId)

  return {
    subtotal: roundMoney(subtotal),
    discount: couponDiscount,
    total: roundMoney(Math.max(0, subtotal - couponDiscount))
  }
}

const summary = computed(() => {
  if (!order.value) return { subtotal: 0, delivery: 0, discount: 0, companyDiscounts: 0, total: 0 }

  let subtotal = 0
  let companyDiscounts = 0

  order.value.companies.forEach((company: any) => {
    // Only sum kept items for actual total
    const keptItems = company.cartitems.filter((i: any) => decisions.value[i.id] === 'keep')
    subtotal += keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)
    companyDiscounts += calculateCompanyDiscount(company.id)
  })

  const delivery = order.value.shipping || 0
  const waitingFees = order.value.waiting_fee || 0
  const MarkitDiscount = calculateMarkitDiscount()

  // Ensure total doesn't go negative
  const total = roundMoney(Math.max(0, subtotal + delivery + waitingFees - MarkitDiscount - companyDiscounts))

  return {
    subtotal: roundMoney(subtotal),
    delivery: roundMoney(delivery),
    discount: MarkitDiscount,
    companyDiscounts: roundMoney(companyDiscounts),
    total
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

  if (order.value) {
    order.value.companies.forEach((company: any) => {
      company.cartitems.forEach((item: any) => {
        decisions.value[item.id] = null
      })
    })
  }

  // Ensure this page is in the client socket room for real-time updates
  if (clientId.value) {
    socket.emit('joinClient', clientId.value)
  }

  // Fetch delivery step events (also determines if delivery is confirmed)
  fetchDeliveryStepEvents(id)
    .then((res) => {
      const events = res.data?.events || []
      stepEvents.value = events
      // Check if "Delivered complete" exists in the events
      deliveryConfirmed.value = events.some(
        (e: any) => e.step === 'Delivered' && e.action === 'complete'
      )
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
  }
}
// Real-time: trynbuyUpdate from /delivered endpoint (backup for deliveryConfirmed)
const onTrynbuyUpdate = (data: { trynbuy_id: string; order_status: string }) => {
  if (data.trynbuy_id === id) {
    deliveryConfirmed.value = true
  }
}
socket.on('deliveryStepUpdate', onDeliveryStep)
socket.on('trynbuyUpdate', onTrynbuyUpdate)
onUnmounted(() => {
  socket.off('deliveryStepUpdate', onDeliveryStep)
  socket.off('trynbuyUpdate', onTrynbuyUpdate)
})

// ------------------- Coupon Functions -------------------
async function loadCoupons() {
  try {
    if (!order.value || !order.value.companies) {
      return;
    }

    availableCoupons.value = [];

    // First, fetch company-specific coupons for each company
    for (const company of order.value.companies) {
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

async function submitBills(paymentMethod: 'CASH' | 'UPI' | 'NONE') {
  try {
    const amount = summary.value.total
    const allocatedMarkitDiscount = calculateMarkitDiscount()
    // Collect all returned items across all companies for the delivery partner
    const allReturnedItems = order.value.companies.flatMap((company: any) =>
      company.cartitems
        .filter((i: any) => decisions.value[i.id] === 'return')
        .map((i: any) => ({ id: i.id, name: i.name, size: i.size, quantity: i.quantity, companyId: company.id, companyName: company.name }))
    )

    // Notify delivery partner before creating bills
    socket.emit('customerProceed', {
      trynbuyId: order.value.trynbuy_id,
      paymentMethod,
      amount,
      returnedItems: allReturnedItems,
    })

    const totalKeptSubtotal = order.value.companies.reduce((total: number, company: any) =>
      total + company.cartitems.reduce((sum: number, i: any) =>
        decisions.value[i.id] === 'keep' ? sum + i.d_price : sum, 0), 0)

    const firstKeptCompanyId = order.value.companies.find((company: any) =>
      company.cartitems.some((i: any) => decisions.value[i.id] === 'keep')
    )?.id

    const billPromises = order.value.companies.map(async (company: any) => {
      const keptItems = company.cartitems.filter(
        (i: any) => decisions.value[i.id] === 'keep'
      )
      const companyCouponDiscount = calculateCompanyDiscount(company.id)
      const companyKeptSubtotal = keptItems.reduce((s: number, i: any) => s + i.d_price, 0)
      const share = totalKeptSubtotal > 0 ? companyKeptSubtotal / totalKeptSubtotal : 0
      const companyWaitingFee = Math.round(share * (order.value.waiting_fee || 0) * 100) / 100
      const companyMarkitDiscount = Math.round(share * allocatedMarkitDiscount * 100) / 100

      const payload = {
        trynbuyId: order.value.trynbuy_id,
        companyId: company.id,
        companyName: company.name,
        paymentMethod,
        transactionId: null,
        subtotal: companyKeptSubtotal,
        grandTotal: Math.max(0, companyKeptSubtotal - companyCouponDiscount - companyMarkitDiscount),
        discount: keptItems.reduce((s: number, i: any) => s + (i.s_price - i.d_price), 0),
        deliveryFees: 0,
        waitingFee: companyWaitingFee,
        keptItems,
        returnedItems: company.cartitems
          .filter((i: any) => decisions.value[i.id] === 'return')
          .map((i: any) => ({ id: i.id, itemId: i.itemId, quantity: i.quantity, name: i.name })),
        couponId: companyCoupons.value[company.id]?.couponId || null,
        appliedCoupon: companyCoupons.value[company.id]?.code || null,
        couponDiscount: companyCouponDiscount,
        markitCouponId: (company.id === firstKeptCompanyId && companyMarkitDiscount > 0)
          ? MarkitCoupon.value?.couponId || null : null,
        markitCouponCode: (company.id === firstKeptCompanyId && companyMarkitDiscount > 0)
          ? MarkitCoupon.value?.code || null : null,
        markitCouponDiscount: companyMarkitDiscount,
      }

      try {
        const billRes = await createTrynBuyBill(payload)
        return { company: company.name, success: billRes.data.success }
      } catch (err) {
        console.error(`❌ Failed bill for ${company.name}:`, err)
        return { company: company.name, success: false }
      }
    })

    const results = await Promise.allSettled(billPromises)
    const successful = (results as any[]).filter(r => r.value?.success).length
    const failed = results.length - successful

    if (successful > 0) {
      showToast({ message: 'Checkout completed!', color: 'success', icon: 'checkmark-circle-outline', duration: 3000 })
    }
    if (failed > 0) {
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
.otp-card {
  background: #fffbeb;
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
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
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.company-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.company-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px;
  padding: 12px;
}

.company-total {
  border-top: 1px dashed #d1d5db;
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
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
  background: rgba(255, 255, 0, 0);
}

.pack-footer-bg {
  background: var(--markit-glass-surface);
  border-bottom: none;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 8px 18px rgba(20, 34, 28, 0.08);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
  padding-bottom: var(--markit-bottom-inset);
}
</style>
