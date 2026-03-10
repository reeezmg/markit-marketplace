<template>
  <ion-page>
    <Topbar title="Order Details" />

    <ion-content :fullscreen="true" class="ion-padding order-details-page">
      <div v-if="order" class="order-details-wrap">
        <div v-if="displayedCartItems.length" class="order-section">
          <div class="order-section-title">Ordered Items</div>
          <div
            v-for="item in displayedCartItems"
            :key="`${item.id}-${item.itemId || item.size || 'cart'}`"
            class="order-line-item"
          >
            <div class="order-item-image">
              <img 
                v-if="item.images?.length"
                :src="`https://images.markit.co.in/${item.images[0]}`"
                alt="product"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="flex items-center justify-center w-full h-full text-xs text-gray-500"
              >
                No Image
              </div>
            </div>

            <div class="order-item-info">
              <div class="order-company-name">
                <span>{{ item.company?.name || 'Unknown Company' }}</span>
              </div>

              <div class="order-product-name">{{ item.product_name }} - {{ item.name }}</div>
              <div class="order-meta">Size: {{ item.size || '-' }}</div>
              <div class="order-meta">Qty: {{ item.quantity }}</div>
            </div>

            <div class="order-price-wrap">
              <div class="order-price-main">
                &#8377; {{ item.d_price }}
              </div>
              <div
                v-if="item.s_price && item.s_price > item.d_price"
                class="order-price-strike"
              >
                &#8377; {{ item.s_price }}
              </div>
              <div class="order-item-badge status-complete">Kept</div>
            </div>
          </div>
        </div>

        <div v-if="displayedReturnedItems.length" class="order-section">
          <div class="order-section-title">Returned Items</div>
          <div
            v-for="item in displayedReturnedItems"
            :key="`${item.id}-${item.itemId || item.size || 'returned'}-returned`"
            class="order-line-item order-line-item-returned"
          >
            <div class="order-item-image">
              <img 
                v-if="item.images?.length"
                :src="`https://images.markit.co.in/${item.images[0]}`"
                alt="product"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="flex items-center justify-center w-full h-full text-xs text-gray-500"
              >
                No Image
              </div>
            </div>

            <div class="order-item-info">
              <div class="order-company-name">
                <span>{{ item.company?.name || 'Unknown Company' }}</span>
              </div>

              <div class="order-product-name">{{ item.product_name }} - {{ item.name }}</div>
              <div class="order-meta">Size: {{ item.size || '-' }}</div>
              <div class="order-meta">Qty: {{ item.quantity }}</div>
            </div>

            <div class="order-price-wrap">
              <div class="order-price-main">
                &#8377; {{ item.d_price }}
              </div>
              <div
                v-if="item.s_price && item.s_price > item.d_price"
                class="order-price-strike"
              >
                &#8377; {{ item.s_price }}
              </div>
              <div class="order-item-badge status-cancelled">Returned</div>
            </div>
          </div>
        </div>

        <div v-if="!displayedCartItems.length && !displayedReturnedItems.length" class="order-loading">
          No item details available for this order.
        </div>

        <div class="order-summary-card">
          <div class="order-summary-row">
            <span class="order-summary-label">Order</span>
            <span class="order-summary-value">
              Order ID: #{{ order.order_number }}
            </span>
          </div>

          <div class="order-summary-meta">
            Expected Delivery: {{ formatDate(order.delivery_time) }}
          </div>
          <div class="order-summary-meta">
            Order Placed: {{ formatDate(order.created_at) }}
          </div>
          <div class="order-summary-meta">
            Waiting Time: {{ order.waiting_time || 0 }} mins
          </div>

          <div class="order-summary-status">
            Status:
            <span
              :class="{
                'status-pending': order.packing_status === 'pending',
                'status-cancelled': order.order_status === 'cancelled',
                'status-complete': order.order_status !== 'cancelled'
              }"
            >
              {{ formatStatus(order.order_status) }}
            </span>
          </div>

          <div class="order-summary-divider"></div>

          <div class="order-summary-row">
            <span class="order-summary-label">Subtotal</span>
            <span class="order-summary-value amount">₹{{ formatAmount(order.purchasedSubtotal || 0) }}</span>
          </div>
          <div class="order-summary-row">
            <span class="order-summary-label">Delivery Fee</span>
            <span class="order-summary-value amount">₹{{ formatAmount(order.shipping || 0) }}</span>
          </div>
          <div class="order-summary-row">
            <span class="order-summary-label">Waiting Fee</span>
            <span class="order-summary-value amount">₹{{ formatAmount(order.waiting_fee || 0) }}</span>
          </div>
          <div v-if="order.companyCoupons?.length" class="order-coupon-block">
            <div class="order-coupon-title">Company Coupons</div>
            <div
              v-for="coupon in order.companyCoupons"
              :key="`${coupon.couponId}-${coupon.billId}`"
              class="order-summary-row"
            >
              <span class="order-summary-label">{{ coupon.companyName || 'Company' }}: {{ coupon.code }}</span>
              <span class="order-summary-value amount">-₹{{ formatAmount(coupon.discount || 0) }}</span>
            </div>
          </div>
          <div v-if="order.markitCoupon" class="order-coupon-block">
            <div class="order-coupon-title">Markit Coupon</div>
            <div class="order-summary-row">
              <span class="order-summary-label">{{ order.markitCoupon.code }}</span>
              <span class="order-summary-value amount">-₹{{ formatAmount(order.markitCouponDiscount || 0) }}</span>
            </div>
          </div>
          <div class="order-summary-divider"></div>
          <div class="order-summary-row total-row">
            <span class="order-summary-label">Total Paid</span>
            <span class="order-summary-value amount total-amount">₹{{ formatAmount(order.totalPaid || 0) }}</span>
          </div>
        </div>
      </div>

      <div v-else class="order-loading">Loading order...</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import Topbar from '@/components/Topbar.vue'

const route = useRoute()
const id = route.params.id as string
const store = useTryHistoryStore()
const order = ref<any | null>(null)

const displayedReturnedItems = computed(() => {
  if (!order.value) return []
  if (Array.isArray(order.value.returneditems) && order.value.returneditems.length) {
    return order.value.returneditems
  }
  return Array.isArray(order.value.cartitems)
    ? order.value.cartitems.filter((item: any) => item.status === 'RETURNED')
    : []
})

const displayedCartItems = computed(() => {
  if (!order.value || !Array.isArray(order.value.cartitems)) return []
  return order.value.cartitems.filter((item: any) => item.status !== 'RETURNED')
})

onIonViewWillEnter(async () => {
  await store.fetchFromApi()
  order.value = store.getTryHistoryById(id)
})

function formatDate(date: string | null) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatus(status: string | null) {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatAmount(amount: number | string | null | undefined) {
  const value = Number(amount) || 0
  return value.toFixed(2)
}
</script>

<style scoped>
.order-details-page {
  --background: var(--markit-bg);
  --padding-bottom: calc(92px + var(--markit-bottom-inset));
}

.order-details-wrap {
  padding: 0 2px 6px;
}

.order-section {
  margin-bottom: 12px;
}

.order-section-title {
  margin: 2px 4px 10px;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--markit-text-muted);
}

.order-line-item {
  display: flex;
  gap: 14px;
  margin-bottom: 10px;
  padding: 10px 8px 12px;
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  box-shadow: var(--markit-shadow-soft);
}

.order-line-item-returned {
  opacity: 0.78;
}

.order-item-image {
  width: 84px;
  height: 104px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
  flex-shrink: 0;
}

.order-item-info {
  flex: 1;
  min-width: 0;
}

.order-company-name {
  font-size: 1.02rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
}

.order-product-name {
  margin-top: 2px;
  font-size: 0.95rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}

.order-meta {
  margin-top: 1px;
  font-size: 0.92rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}

.order-price-wrap {
  min-width: 86px;
  text-align: right;
  padding-right: 10px;
}

.order-price-main {
  font-size: 1.02rem;
  line-height: 1.25;
  font-weight: 700;
  color: var(--markit-text);
}

.order-price-strike {
  margin-top: 2px;
  font-size: 0.86rem;
  line-height: 1.2;
  color: var(--markit-text-muted);
  text-decoration: line-through;
}

.order-item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  border: 1px solid currentColor;
}

.order-summary-card {
  margin-top: 8px;
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  box-shadow: var(--markit-shadow-soft);
  padding: 12px 12px 10px;
}

.order-summary-divider {
  height: 1px;
  background: var(--markit-border);
  margin: 10px 0;
}

.order-summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.order-summary-label {
  font-size: 1rem;
  font-weight: 700;
  color: var(--markit-text);
}

.order-summary-value {
  font-size: 0.88rem;
  color: var(--markit-text-muted);
}

.order-summary-value.amount {
  font-variant-numeric: tabular-nums;
}

.order-summary-meta {
  font-size: 0.9rem;
  line-height: 1.35;
  color: var(--markit-text-muted);
  margin-top: 2px;
}

.order-summary-status {
  margin-top: 8px;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--markit-text);
}

.order-coupon-block {
  margin-top: 10px;
}

.order-coupon-title {
  margin-bottom: 4px;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--markit-text-muted);
}

.total-row {
  margin-top: 4px;
}

.total-amount {
  font-size: 1rem;
  font-weight: 700;
  color: var(--markit-text);
}

.status-pending {
  color: #b57b00;
}

.status-cancelled {
  color: #d33c3c;
}

.status-complete {
  color: var(--ion-color-primary);
}

.order-loading {
  margin-top: 40px;
  text-align: center;
  color: var(--markit-text-muted);
}
</style>
