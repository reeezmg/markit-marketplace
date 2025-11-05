<template> 
  <ion-page>
    <Topbar />

    <ion-content class="ion-padding">
      <div v-if="order">
        <!-- Product List -->
        <div v-for="item in order.cartitems" :key="item.id" class="flex mb-6">
          <!-- Product Image -->
          <div class="w-24 h-28 rounded-md overflow-hidden bg-gray-100">
            <img
              :src="`https://images.markit.co.in/${item.images[0]}`"
              alt="product"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="ml-4 flex-1">
            <div class="font-semibold text-gray-900">
              {{ order.company.name }}
            </div>
            <div class="text-sm text-gray-600">
              {{ item.name }}
            </div>
            <div class="text-sm text-gray-500">
              Size : {{ item.size }}
            </div>
            <div class="text-sm text-gray-500">
              Quantity : {{ item.quantity }}
            </div>
          </div>

          <!-- Price + Actions -->
          <div class="text-right flex flex-col justify-between">
            <div class="text-gray-900 font-semibold">
              ₹ {{ item.d_price }}
            </div>
            <div
              v-if="item.s_price && item.s_price > item.d_price"
              class="text-gray-400 text-sm line-through"
            >
              ₹ {{ item.s_price }}
            </div>

            <!-- Action Buttons -->
            <div class="flex mt-2 gap-2">
              <ion-button
                color="danger"
                size="small"
                :fill="decisions[item.id] === 'return' ? 'solid' : 'outline'"
                @click="toggleDecision(item.id, 'return')"
              >
                Return
              </ion-button>

              <ion-button
                color="primary"
                size="small"
                :fill="decisions[item.id] === 'keep' ? 'solid' : 'outline'"
                @click="toggleDecision(item.id, 'keep')"
              >
                Keep
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="mt-6 border-t border-gray-200 pt-4">
          <div class="font-semibold text-lg text-gray-900 mb-2">
            Order Summary
          </div>

          <div class="flex justify-between text-sm mb-1">
            <span>Subtotal</span>
            <span>₹ {{ summary.subtotal }}</span>
          </div>

          <div class="flex justify-between text-sm mb-1">
            <span>Delivery</span>
            <span>₹ {{ summary.delivery }}</span>
          </div>

          <div class="flex justify-between text-sm mb-1">
            <span>Discount</span>
            <span>- ₹{{ summary.discount }}</span>
          </div>

          <!-- ✅ Waiting Fees -->
          <div class="flex justify-between text-sm mb-1">
            <span>Waiting Fees</span>
            <span>₹ {{ order.waiting_fee || 0 }}</span>
          </div>

          <!-- ✅ Waiting Time -->
          <div class="flex justify-between text-sm mb-1">
            <span>Waiting Time</span>
            <span>{{ order.waiting_time || 0 }} mins</span>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-500">Loading order...</div>
    </ion-content>

    <!-- Footer -->
    <ion-footer class="ion-no-border bg-white">
      <div class="flex justify-between items-center px-4 py-3 border-t">
        <div class="text-lg font-semibold text-gray-900">
          Total: ₹ {{ summary.total }}
        </div>

        <ion-button
          expand="block"
          shape="round"
          :color="allDecided ? 'primary' : 'medium'"
          :disabled="!allDecided"
          @click="proceed"
        >
          Proceed
        </ion-button>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Topbar from '@/components/Topbar.vue'
import { usePackStore } from '@/store/usePackStore'
import { IonPage, IonContent, IonButton, IonFooter } from '@ionic/vue'
import { createTrynBuyBill, initiatePayment, verifyPayment } from '@/api/api'

const route = useRoute()
const id = route.params.id as string
const packStore = usePackStore()
const order = ref<any | null>(null)
const decisions = ref<Record<string, 'keep' | 'return' | null>>({})

const RAZORPAY_KEY_ID = 'rzp_test_RYuGLP5Z8RaUqo'

// --- All decided check ---
const allDecided = computed(() => {
  if (!order.value) return false
  return order.value.cartitems.every((item: any) => decisions.value[item.id])
})

// --- Simplified Summary ---
const summary = computed(() => {
  if (!order.value) {
    return { subtotal: 0, delivery: 0, discount: 0, total: 0 }
  }

  const keptItems = order.value.cartitems.filter(
    (i: any) => decisions.value[i.id] === 'keep'
  )
  const subtotal = keptItems.reduce((sum: number, i: any) => sum + i.d_price, 0)
  const discount =
    keptItems.reduce((sum: number, i: any) => sum + i.s_price, 0) - subtotal

  const delivery = order.value.shipping || 0
  const waitingFees = Number(order.value.waiting_fee) || 0

  const total = subtotal + delivery + waitingFees - discount

  return { subtotal, delivery, discount, total }
})

// --- Mount logic ---
onMounted(async () => {
  await packStore.loadFromStorage()
  order.value = packStore.getById(id)
  if (order.value) {
    order.value.cartitems.forEach((item: any) => {
      decisions.value[item.id] = null
    })
  }
})

// --- Decision toggle ---
function toggleDecision(itemId: string, decision: 'keep' | 'return') {
  decisions.value[itemId] = decision
}

// --- Proceed (same as before) ---
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
      name: order.value.company?.name || 'Markit Try & Buy',
      description: 'Payment for Try & Buy order',
      order_id: orderData.id,
      prefill: {
        name: order.value.client?.name || 'Guest User',
        email: order.value.client?.email || 'test@example.com',
        contact: order.value.client?.phone || '9999999999',
      },
      handler: async (response: any) => {
        const verify = await verifyPayment(response)
        const result = verify.data

        if (result.success) {
          const payload = {
            trynbuyId: order.value.trynbuy_id,
            companyId: order.value.company.id,
            paymentMethod: 'UPI',
            transactionId: response.razorpay_payment_id,
            subtotal: summary.value.subtotal,
            grandTotal: summary.value.total,
            discount: summary.value.discount,
            deliveryFees: summary.value.delivery,
            waitingFees: order.value.waiting_fee,
            waitingTime: order.value.waiting_time,
            keptItems: order.value.cartitems.filter((i: any) => decisions.value[i.id] === 'keep'),
            returnedItems: order.value.cartitems.filter((i: any) => decisions.value[i.id] === 'return'),
          }

          const res = await createTrynBuyBill(payload)
          if (res.data.success) alert('✅ Bill created successfully!')
          else alert('⚠️ Payment succeeded but bill creation failed.')
        } else {
          alert('❌ Payment verification failed.')
        }
      },
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error('Payment Error:', error)
    alert('Something went wrong while processing payment.')
  }
}
</script>
