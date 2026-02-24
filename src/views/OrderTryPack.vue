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
            <ion-button 
              size="small" 
              fill="outline" 
              color="primary"
              @click="openCompanyCouponModal(company)"
              class="coupon-btn"
            >
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
                <ion-button size="small" color="danger" 
                  :fill="decisions[item.id] === 'return' ? 'solid' : 'outline'"
                  @click="toggleDecision(item.id, 'return')">
                  Return
                </ion-button>

                <ion-button size="small" color="primary" 
                  :fill="decisions[item.id] === 'keep' ? 'solid' : 'outline'"
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
              <span class="text-xs text-green-600 flex items-center">
                <ion-icon :icon="checkmarkCircleOutline" class="mr-1"></ion-icon>
                Coupon {{ companyCoupons[company.id].code }} applied 
                (-₹ {{ companyCoupons[company.id].discount }})
              </span>
              <ion-button 
                size="small" 
                fill="clear" 
                color="medium"
                @click="removeCompanyCoupon(company.id)"
                class="remove-coupon"
              >
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
            <ion-button 
              size="small" 
              fill="outline" 
              color="primary"
              @click="openMarkitCouponModal"
              class="coupon-btn"
            >
              <ion-icon :icon="pricetagOutline" slot="start"></ion-icon>
              Apply Coupon
            </ion-button>
          </div>

          <!-- Applied Markit Coupon Display -->
          <div v-if="MarkitCoupon" class="applied-coupon mb-3">
            <span class="text-xs text-green-600 flex items-center">
              <ion-icon :icon="checkmarkCircleOutline" class="mr-1"></ion-icon>
              Markit Coupon {{ MarkitCoupon.code }} applied (-₹ {{ MarkitCoupon.discount }})
            </span>
            <ion-button 
              size="small" 
              fill="clear" 
              color="medium"
              @click="removeMarkitCoupon"
              class="remove-coupon"
            >
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
            <span>- ₹ {{ MarkitCoupon.discount }}</span>
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
      <CouponModal
        v-model:isOpen="showCouponModal"
        :companyId="selectedCompanyId"
        :type="couponModalType"
        :availableCoupons="availableCoupons"
        @apply="handleApplyCoupon"
      />
    </ion-content>

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

          <ion-button expand="block" shape="round" 
            :color="allDecided ? 'primary' : 'medium'" 
            :disabled="!allDecided"
            @click="proceed">
            Proceed to Payment
          </ion-button>
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onIonViewWillEnter } from '@ionic/vue'
import { useIonRouter } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { IonPage, IonContent, IonButton, IonFooter, IonIcon } from '@ionic/vue'
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

// Coupon related state
const showCouponModal = ref(false)
const selectedCompanyId = ref<string | null>(null)
const couponModalType = ref<'company' | 'app'>('company')
const availableCoupons = ref<any[]>([])
const companyCoupons = ref<Record<string, { code: string; discount: number }>>({})
const MarkitCoupon = ref<{ code: string; discount: number } | null>(null)
const clientId = ref<string>('')

// ------------------- Computed -------------------
const allItems = computed(() => {
  if (!order.value) return []
  return order.value.companies.flatMap((c: any) => c.cartitems)
})

const allDecided = computed(() => {
  if (!allItems.value.length) return false
  return allItems.value.every((item: any) => decisions.value[item.id])
})

// Company-specific summary
const companySummary = (companyId: string) => {
  const company = order.value?.companies.find((c: any) => c.id === companyId)
  if (!company) return { subtotal: 0, discount: 0, total: 0 }

  const keptItems = company.cartitems.filter((i: any) => decisions.value[i.id] === 'keep')
  const subtotal = keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)
  const itemDiscounts = keptItems.reduce((sum: number, i: any) => sum + (i.s_price - i.d_price), 0)
  const companyDiscount = companyCoupons.value[companyId]?.discount || 0
  
  return {
    subtotal,
    discount: itemDiscounts + companyDiscount,
    total: Math.max(0, subtotal - companyDiscount) // Ensure non-negative
  }
}

const summary = computed(() => {
  if (!order.value) return { subtotal: 0, delivery: 0, discount: 0, companyDiscounts: 0, total: 0 }

  let subtotal = 0
  let companyDiscounts = 0
  
  order.value.companies.forEach((company: any) => {
    // Only sum kept items for actual total, but we might want to show potential savings
    const keptItems = company.cartitems.filter((i: any) => decisions.value[i.id] === 'keep')
    subtotal += keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)
    companyDiscounts += companyCoupons.value[company.id]?.discount || 0
  })

  const delivery = order.value.shipping || 0
  const waitingFees = Number(order.value.waiting_fee) || 0
  const MarkitDiscount = MarkitCoupon.value?.discount || 0
  
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
    const companyId = order.value?.companies[0]?.companyId
    if (!companyId) return

    // Fetch both company and Markit coupons
    const response = await fetchCoupons(companyId, clientId.value)
    
    // Process coupons to add display properties
    availableCoupons.value = (response.data ?? []).map((coupon: any) => ({
      id: coupon.id,
      code: coupon.code,
      type: coupon.isMarkit ? 'app' : 'company',
      description: coupon.type === 'PERCENTAGE' 
        ? `${coupon.discountValue}% off up to ₹${coupon.maxDiscountAmount || '∞'}`
        : `₹${coupon.discountValue} off`,
      discount: coupon.type === 'PERCENTAGE'
        ? `${coupon.discountValue}%`
        : `₹${coupon.discountValue}`,
      minOrderValue: coupon.minOrderValue,
      isMarkit: coupon.isMarkit
    }))
  } catch (error) {
    console.error('Error loading coupons:', error)
  }
}

function openCompanyCouponModal(company: any) {
  selectedCompanyId.value = company.id
  couponModalType.value = 'company'
  showCouponModal.value = true
}

function openMarkitCouponModal() {
  selectedCompanyId.value = null 
  couponModalType.value = 'app' 
  showCouponModal.value = true
}

async function handleApplyCoupon(data: { code: string; discount?: number; companyId?: string }) {
  try {
    if (!clientId.value) {
      alert('Please login to apply coupons')
      return
    }

    // For Markit coupons, we need a companyId from the order
    const companyId = data.companyId || order.value?.companies[0]?.companyId
    
    if (!companyId) {
      alert('Coupon Invalid')
      return
    }

    // Calculate potential order value (all items, regardless of keep/return)
    let orderValue = 0
    
    if (data.companyId) {
      // For company coupon - sum all items in that company
      const company = order.value?.companies.find((c: any) => c.id === data.companyId)
      orderValue = company?.cartitems.reduce((sum: number, i: any) => sum + i.d_price, 0) || 0
    } else {
      // For Markit coupon - sum all items across all companies
      orderValue = order.value?.companies.reduce((total: number, company: any) => {
        return total + company.cartitems.reduce((sum: number, i: any) => sum + i.d_price, 0)
      }, 0) || 0
    }

    if (orderValue <= 0) {
      alert('No items in order to apply coupon')
      return
    }

    // Prepare request data
    const requestData = {
      code: data.code,
      companyId: companyId,
      clientId: clientId.value,
      orderValue,
      isMarkit: !data.companyId,
    }

    console.log('Sending request with data:', requestData)

    const response = await validateCoupon(requestData)

    if (response.data.valid) {
      if (data.companyId) {
        companyCoupons.value[data.companyId] = {
          code: response.data.coupon.code,
          discount: response.data.coupon.discount
        }
      } else {
        MarkitCoupon.value = {
          code: response.data.coupon.code,
          discount: response.data.coupon.discount
        }
      }
      
      alert(response.data.message || 'Coupon applied successfully!')
      showCouponModal.value = false
    } else {
      alert(response.data.error || 'Coupon cannot be applied')
    }
  } catch (error: any) {
    console.error('Error applying coupon:', error)
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || 'Failed to apply coupon'
    alert(errorMessage)
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
      alert('Please select items to keep before proceeding.')
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
          alert('❌ Payment verification failed.')
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
          alert(`✅ Checkout completed successfully!`)
        }
        if (failed > 0) {
          alert(`⚠️ Some items checkout failed. Please retry later.`)
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
    alert('Something went wrong while processing payment.')
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
  justify-content: space-between;
  align-items: center;
  background: #f0fdf4;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #86efac;
}

.remove-coupon {
  --padding-start: 4px;
  --padding-end: 4px;
  height: 24px;
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