<template>
  <ion-page>
    <Topbar title="Order Details" />

    <ion-content class="ion-padding" :fullscreen="true">

      <div v-if="order">

        <!-- ================= PRODUCT DETAILS CARD ================= -->
        <div class="card mb-6">
          <div v-for="(company, index) in order.companies" :key="company.id" class="mb-6">
            <div class="font-bold text-lg mb-3 text-gray-800">
              {{ formatCompanyName(company.name) }}
            </div>

            <div v-for="item in company.cartitems" :key="item.id" class="flex mb-5">
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
            <div v-if="index !== order.companies.length - 1" class="company-divider"></div>
          </div>
        </div>

        <!-- ================= ORDER SUMMARY CARD ================= -->
        <div class="card">

          <div class="card-title mb-2 font-bold text-lg">Order Summary</div>

          <div class="flex justify-between text-sm mb-2">
            <span>Subtotal</span>
            <span>₹ {{ summary.subtotal }}</span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Delivery</span>
            <span>₹ {{ summary.delivery }}</span>
          </div>

          <div class="flex justify-between text-sm mb-2">
            <span>Discount</span>
            <span>- ₹ {{ summary.discount }}</span>
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

    </ion-content>


    <!-- Footer -->
    <ion-footer class="pack-footer">
      <div class="pack-footer-bg">
        <div class="flex justify-between items-center px-4 py-3">
          <div class="text-lg font-semibold text-gray-900">
            Total: ₹ {{ summary.total }}
          </div>

          <ion-button expand="block" shape="round" :color="allDecided ? 'primary' : 'medium'" :disabled="!allDecided"
            @click="proceed">
            Proceed
          </ion-button>
        </div>
      </div>
    </ion-footer>

  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Topbar from '@/components/Topbar.vue'
import { usePackStore } from '@/store/usePackStore'
import { IonPage, IonContent, IonButton, IonFooter } from '@ionic/vue'
import { createTrynBuyBill, initiatePayment, verifyPayment } from '@/api/api'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const packStore = usePackStore()
const order = ref<any | null>(null)
const decisions = ref<Record<string, 'keep' | 'return' | null>>({})
const RAZORPAY_KEY_ID = 'rzp_test_RYuGLP5Z8RaUqo'

// ------------------- Computed -------------------
const allItems = computed(() => {
  if (!order.value) return []
  return order.value.companies.flatMap((c: any) => c.cartitems)
})

const allDecided = computed(() => {
  if (!allItems.value.length) return false
  return allItems.value.every((item: any) => decisions.value[item.id])
})

const summary = computed(() => {
  if (!order.value) return { subtotal: 0, delivery: 0, discount: 0, total: 0 }

  const keptItems = allItems.value.filter((i: any) => decisions.value[i.id] === 'keep')
  const subtotal = keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)
  const discount = keptItems.reduce((sum: number, i: any) => sum + (i.s_price - i.d_price), 0)

  const delivery = order.value.shipping || 0
  const waitingFees = Number(order.value.waiting_fee) || 0
  const total = subtotal + delivery + waitingFees - discount

  return { subtotal, delivery, discount, total }
})

// ------------------- Lifecycle -------------------
onMounted(async () => {
  await packStore.loadFromStorage()
  order.value = packStore.getById(id)
  if (order.value) {
    order.value.companies.forEach((company: any) => {
      company.cartitems.forEach((item: any) => {
        decisions.value[item.id] = null
      })
    })
  }
})

// ------------------- Functions -------------------
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

        // ✅ Create bills per company
        const billPromises = order.value.companies.map(async (company: any) => {
          const keptItems = company.cartitems.filter(
            (i: any) => decisions.value[i.id] === 'keep'
          )
          const returnedItems = company.cartitems.filter(
            (i: any) => decisions.value[i.id] === 'return'
          )

          // Skip if no items to keep
          // if (!keptItems.length && !returnedItems.length) {
          //   console.warn(`⚠️ No items selected for ${company.name}`)
          //   return null
          // }

          const payload = {
            trynbuyId: order.value.trynbuy_id,
            companyId: company.id,
            paymentMethod: 'UPI',
            transactionId: response.razorpay_payment_id,
            subtotal: keptItems.reduce((s, i) => s + i.d_price, 0),
            grandTotal: keptItems.reduce((s, i) => s + i.d_price, 0),
            discount: keptItems.reduce((s, i) => s + (i.s_price - i.d_price), 0),
            deliveryFees: order.value.shipping || 0,
            waitingFees: order.value.waiting_fee || 0,
            waitingTime: order.value.waiting_time || 0,
            keptItems,
            returnedItems,
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
          alert(`✅  checkout successfully!`)
        }
        if (failed > 0) {
          alert(`⚠️ checkout failed. Please retry later.`)
        }

        // ✅ Remove the order locally
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
.pack-footer {
  
  background: rgba(255, 255, 0, 0.002);
}

.card {
  background: #ffffff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

ion-button {
  --border-width: 1px !important;
  box-sizing: border-box;
  min-width: 80px;
}

.company-divider {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
}
.pack-footer-bg {
  background: var(--markit-glass-surface);
  border-bottom: none;
  box-shadow: inset 0 1px 0 var(--markit-glass-highlight), 0 8px 18px rgba(20, 34, 28, 0.08);
  backdrop-filter: blur(18px) saturate(145%);
  -webkit-backdrop-filter: blur(18px) saturate(145%);
}
</style>
