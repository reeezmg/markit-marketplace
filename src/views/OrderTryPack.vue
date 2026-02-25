<template>
  <ion-page>
    <Topbar title="Order Details" />

    <ion-content class="ion-padding" :fullscreen="true">
      <div v-if="order">
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
            <span>Delivery</span>
            <span>₹ {{ summary.delivery }}</span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Waiting Fees</span>
            <span>₹ {{ order.waiting_fee || 0 }}</span>
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
    <!-- Footer -->
    <ion-footer class="pack-footer">
      <div class="pack-footer-bg">
        <div class="flex justify-between items-center px-4 py-3">
          <div>
            <div class="text-sm text-gray-600">Total Amount</div>
            <div class="text-lg font-semibold text-gray-900">
              ₹ {{ summary.total }}
            </div>
          </div>

          <ion-button expand="block" shape="round" :color="allDecided ? 'primary' : 'medium'" :disabled="!allDecided"
            @click="proceed">
            Proceed to Payment
          </ion-button>
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonButton, IonFooter, IonIcon, IonToast } from '@ionic/vue'
import { pricetagOutline, checkmarkCircleOutline, closeOutline } from 'ionicons/icons'
import Topbar from '@/components/Topbar.vue'
import CouponModal from '@/components/CouponModal.vue'
import { usePackStore } from '@/store/usePackStore'
import { createTrynBuyBill, initiatePayment, verifyPayment, fetchCoupons, validateCoupon } from '@/api/api'
import { Preferences } from '@capacitor/preferences'

const route = useRoute()
const router = useIonRouter()
const id = route.params.id as string
const packStore = usePackStore()
const order = ref<any | null>(null)
const decisions = ref<Record<string, 'keep' | 'return' | null>>({})
const RAZORPAY_KEY_ID = 'rzp_test_RYuGLP5Z8RaUqo'

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

  // Calculate discount based on coupon type
  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = (keptSubtotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
  } else if (coupon.type === 'FLAT') {
    discount = coupon.discount_value
  }

  // Cap at kept subtotal
  return Math.min(discount, keptSubtotal)
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

  // Calculate discount based on coupon type
  let discount = 0
  if (coupon.type === 'PERCENTAGE') {
    discount = (totalKeptSubtotal * coupon.discount_value) / 100
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount)
    }
  } else if (coupon.type === 'FLAT') {
    discount = coupon.discount_value
  }

  // Cap at total kept subtotal
  return Math.min(discount, totalKeptSubtotal)
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
    subtotal,
    discount: couponDiscount,
    total: Math.max(0, subtotal - couponDiscount) // Ensure non-negative
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
  const waitingFees = Number(order.value.waiting_fee) || 0
  const MarkitDiscount = calculateMarkitDiscount()

  // Ensure total doesn't go negative
  const total = Math.max(0, subtotal + delivery + waitingFees - MarkitDiscount - companyDiscounts)

  return {
    subtotal,
    delivery,
    discount: MarkitDiscount,
    companyDiscounts,
    total
  }
})

// ------------------- Lifecycle -------------------
onIonViewWillEnter(async () => {
  await packStore.loadFromStorage()
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

  // Fetch available coupons
  await loadCoupons()
})

// ------------------- Coupon Functions -------------------
async function loadCoupons() {
  try {
    if (!order.value || !order.value.companies) {
      console.log('No order or companies found');
      return;
    }

    console.log('Loading coupons for order:', order.value);
    availableCoupons.value = [];

    const companies = order.value.companies;

    // First, fetch company-specific coupons for each company
    for (const company of companies) {
      const companyIdForApi = company.id;

      if (!companyIdForApi) {
        console.log('Company missing id:', company);
        continue;
      }

      console.log(`Fetching coupons for company: ${company.name} (ID: ${companyIdForApi})`);

      try {
        // Don't pass type parameter for company coupons, or pass 'company'
        const response = await fetchCoupons(companyIdForApi, clientId.value);

        console.log(`Response for company ${company.name}:`, response.data);

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
          console.log(`Added ${transformedCoupons.length} company coupons for ${company.name}`);
        }
      } catch (error) {
        console.error(`Error fetching coupons for company ${company.name}:`, error);
      }
    }

    // Now fetch Markit coupons (app-wide coupons)
    try {
      console.log('Fetching Markit coupons...');

      // For Markit coupons, pass 'markit' as the type and a special companyId
      // The server will handle this appropriately
      const markitResponse = await fetchCoupons('markit', clientId.value, 'markit');

      console.log('Markit coupons response:', markitResponse.data);

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
        console.log(`Added ${markitCoupons.length} Markit coupons`);
      } else {
        console.log('No Markit coupons found');
      }
    } catch (error) {
      console.error('Error fetching Markit coupons:', error);
    }

    console.log('Final available coupons:', availableCoupons.value);
  } catch (error) {
    console.error('Error in loadCoupons:', error);
  }
}

function openCompanyCouponModal(company: any) {
  console.log('Opening coupon modal for company:', company);

  const companySpecificCoupons = availableCoupons.value.filter(
    (coupon: any) => coupon.companyId === company.id && !coupon.isMarkit
  );

  console.log(`Company coupons for ${company.name}:`, companySpecificCoupons);

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

    // For company coupons, we need a companyId
    const companyId = data.companyId

    if (data.companyId && !companyId) {
      showToast({
        message: 'Invalid coupon',
        color: 'warning',
        icon: 'warning-outline'
      })
      return
    }

    // Calculate kept items value for validation
    let keptItemsValue = 0
    let companyForValidation = null

    if (data.companyId) {
      // For company coupon - sum only KEPT items in that company
      companyForValidation = order.value?.companies.find((c: any) => c.id === data.companyId)
      keptItemsValue = companyForValidation?.cartitems.reduce((sum: number, i: any) => {
        if (decisions.value[i.id] === 'keep') {
          return sum + i.d_price
        }
        return sum
      }, 0) || 0
    } else {
      // For Markit coupon - sum KEPT items across all companies
      keptItemsValue = order.value?.companies.reduce((total: number, company: any) => {
        return total + company.cartitems.reduce((sum: number, i: any) => {
          if (decisions.value[i.id] === 'keep') {
            return sum + i.d_price
          }
          return sum
        }, 0)
      }, 0) || 0
    }

    console.log('Kept items value for validation:', keptItemsValue)

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
      companyId: companyId,
      clientId: clientId.value,
      orderValue: keptItemsValue, // Use kept items value for validation
      isMarkit: !data.companyId,
    }

    console.log('Sending request with kept items value:', requestData)

    const response = await validateCoupon(requestData)
    if (response.data.valid) {
      if (data.companyId) {
        // Find the original coupon to get all details
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

        // Calculate the actual discount amount
        let discountAmount = 0
        if (response.data.coupon.type === 'PERCENTAGE') {
          discountAmount = (keptItemsValue * (originalCoupon?.discount_value || parseFloat(response.data.coupon.originalDiscount))) / 100
          if (originalCoupon?.max_discount_amount) {
            discountAmount = Math.min(discountAmount, originalCoupon.max_discount_amount)
          }
        } else if (response.data.coupon.type === 'FLAT') {
          discountAmount = originalCoupon?.discount_value || response.data.coupon.discount
        }

        discountAmount = Math.min(discountAmount, keptItemsValue)

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
          discount: discountAmount,
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
  try {
    const amount = summary.value.total
    if (amount <= 0) {
      showToast({
        message: 'Please select items to keep before proceeding',
        color: 'warning',
        icon: 'warning-outline'
      })
      return
    }

    const res = await initiatePayment({ amount, currency: 'INR' })
    const orderData = res.data

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Markit Try & Buy',
      description: 'Payment for Try & Buy order',
      order_id: orderData.id,

      handler: async (response: any) => {
        const verify = await verifyPayment(response)
        const result = verify.data

        if (!result.success) {
          showToast({
            message: 'Payment verification failed',
            color: 'danger',
            icon: 'close-circle-outline'
          })
          return
        }

        // Create bills per company with coupon info
        const billPromises = order.value.companies.map(async (company: any) => {
          const keptItems = company.cartitems.filter(
            (i: any) => decisions.value[i.id] === 'keep'
          )
          const returnedItems = company.cartitems.filter(
            (i: any) => decisions.value[i.id] === 'return'
          )

          const payload = {
            trynbuyId: order.value.trynbuy_id,
            companyId: company.id,
            paymentMethod: 'UPI',
            transactionId: response.razorpay_payment_id,
            subtotal: keptItems.reduce((s, i) => s + i.d_price, 0),
            grandTotal: keptItems.reduce((s, i) => s + i.d_price, 0) - (companyCoupons.value[company.id]?.discount || 0),
            discount: keptItems.reduce((s, i) => s + (i.s_price - i.d_price), 0),
            deliveryFees: order.value.shipping || 0,
            waitingFees: order.value.waiting_fee || 0,
            waitingTime: order.value.waiting_time || 0,
            keptItems,
            returnedItems,
            appliedCoupon: companyCoupons.value[company.id]?.code || null,
            couponDiscount: companyCoupons.value[company.id]?.discount || 0
          }

          try {
            const billRes = await createTrynBuyBill(payload)
            return { company: company.name, success: billRes.data.success }
          } catch (err) {
            console.error(`❌ Failed bill for ${company.name}:`, err)
            return { company: company.name, success: false, error: err }
          }
        })

        const results = await Promise.allSettled(billPromises)

        const successful = results.filter(r => r.value?.success).length
        const failed = results.length - successful

        if (successful > 0) {
          showToast({
            message: `Checkout completed successfully!`,
            color: 'success',
            icon: 'checkmark-circle-outline',
            duration: 3000
          })
        }
        if (failed > 0) {
          showToast({
            message: `Some items checkout failed. Please retry later.`,
            color: 'warning',
            icon: 'warning-outline',
            duration: 4000
          })
        }

        // Remove the order locally
        packStore.remove(order.value.trynbuy_id)
        router.push({ name: 'shops' })
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error('Payment Error:', error)
    showToast({
      message: 'Something went wrong while processing payment',
      color: 'danger',
      icon: 'close-circle-outline'
    })
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