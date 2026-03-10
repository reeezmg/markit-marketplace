<template>
  <div class="order-card p-3" @click="goToDetails">
    <!-- Companies Section -->
    <div class="order-card-head">
      <div class="order-number">
        Order Number: {{ trynbuy.order_number }}
      </div>
      <span class="order-open-indicator">View Details</span>
    </div>

    <div class="order-items-row">
      <div
        v-for="item in trynbuy.cartitems"
        :key="item.id"
        class="order-item-tile"
      >
        <img
          v-if="item.images?.length"
          :src="`https://images.markit.co.in/${item.images[0]}`"
          alt="product"
          class="w-full h-full object-cover"
        />
        <div v-else class="order-item-fallback">
          No Image
        </div>
      </div>
    </div>

    <div class="order-status-row">
      <div>
        <div
          :class="[
            'order-status-text',
            trynbuy.packing_status === 'pending'
              ? 'status-pending'
              : trynbuy.order_status === 'cancelled'
              ? 'status-cancelled'
              : 'status-complete'
          ]"
        >
          {{ formatStatus(trynbuy.order_status) }}
        </div>
        <div class="order-date-text">
          Ordered: {{ formatDate(trynbuy.created_at) }}
        </div>
        <div class="order-date-text">
          Kept: {{ keptCount }} · Returned: {{ returnedCount }}
        </div>
      </div>
      <button
        v-if="canCheckout"
        type="button"
        class="order-checkout-btn"
        @click.stop="goToCheckout"
      >
        Checkout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useIonRouter } from '@ionic/vue'
import { usePackStore } from '@/store/usePackStore'

const props = defineProps<{
  trynbuy: any
}>()

const router = useIonRouter()
const packStore = usePackStore()

const terminalStatuses = ['PAID', 'COMPLETED', 'CANCELLED', 'cancelled']

const keptCount = computed(() => {
  const cartItems = Array.isArray(props.trynbuy?.cartitems) ? props.trynbuy.cartitems : []
  return cartItems.filter((item: any) => item.status !== 'RETURNED').length
})

const returnedCount = computed(() => {
  if (Array.isArray(props.trynbuy?.returneditems) && props.trynbuy.returneditems.length) {
    return props.trynbuy.returneditems.length
  }

  const cartItems = Array.isArray(props.trynbuy?.cartitems) ? props.trynbuy.cartitems : []
  return cartItems.filter((item: any) => item.status === 'RETURNED').length
})

const canCheckout = computed(() => {
  const status = props.trynbuy?.order_status
  return !!status && !terminalStatuses.includes(status)
})

function buildPackFromHistory(trynbuy: any) {
  const companiesMap = new Map<string, any>()
  const companies = Array.isArray(trynbuy?.companies) ? trynbuy.companies : []

  companies.forEach((company: any) => {
    companiesMap.set(company.id, {
      id: company.id,
      name: company.name,
      logo: company.logo ?? null,
      cartitems: [],
      returneditems: [],
    })
  })

  const cartItems = Array.isArray(trynbuy?.cartitems) ? trynbuy.cartitems : []
  cartItems.forEach((item: any) => {
    const company = item.company || {}
    if (!companiesMap.has(company.id)) {
      companiesMap.set(company.id, {
        id: company.id,
        name: company.name || 'Unknown Company',
        logo: company.logo ?? null,
        cartitems: [],
        returneditems: [],
      })
    }

    companiesMap.get(company.id).cartitems.push({
      id: item.id,
      name: item.name,
      s_price: item.s_price,
      d_price: item.d_price,
      discount: item.discount,
      images: item.images,
      size: item.size,
      quantity: item.quantity,
      itemId: item.itemId,
      barcode: item.barcode,
      status: item.status || 'PENDING',
      product_name: item.product_name,
    })
  })

  const returnedItems = Array.isArray(trynbuy?.returneditems) ? trynbuy.returneditems : []
  returnedItems.forEach((item: any) => {
    const company = item.company || {}
    if (!companiesMap.has(company.id)) {
      companiesMap.set(company.id, {
        id: company.id,
        name: company.name || 'Unknown Company',
        logo: company.logo ?? null,
        cartitems: [],
        returneditems: [],
      })
    }

    companiesMap.get(company.id).returneditems.push({
      id: item.id,
      name: item.name,
      s_price: item.s_price,
      d_price: item.d_price,
      discount: item.discount,
      images: item.images,
      size: item.size,
      quantity: item.quantity,
      itemId: item.itemId,
      barcode: item.barcode,
      product_name: item.product_name,
    })
  })

  return {
    trynbuy_id: trynbuy.trynbuy_id,
    order_number: trynbuy.order_number,
    created_at: trynbuy.created_at,
    checkout_method: trynbuy.checkout_method,
    subtotal: trynbuy.subtotal,
    product_discount: trynbuy.product_discount,
    total_discount: trynbuy.total_discount,
    shipping: trynbuy.shipping,
    delivery_type: trynbuy.delivery_type,
    delivery_time: trynbuy.delivery_time,
    waiting_time: trynbuy.waiting_time,
    waiting_fee: trynbuy.waiting_fee,
    order_status: trynbuy.order_status,
    packing_status: trynbuy.packing_status,
    companies: Array.from(companiesMap.values()),
  }
}

const goToDetails = () => {
  router.push({ name: 'account-order-history-detail', params: { id: props.trynbuy.trynbuy_id } })
}

const goToCheckout = async () => {
  const pack = buildPackFromHistory(props.trynbuy)
  const existing = packStore.getById(props.trynbuy.trynbuy_id)

  if (existing) {
    await packStore.update(props.trynbuy.trynbuy_id, pack)
  } else {
    await packStore.add(pack)
  }

  router.push({ name: 'pack', params: { id: props.trynbuy.trynbuy_id } })
}

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatStatus(status: string | null): string {
  if (!status) return ''
  return status
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<style scoped>
.order-card {
  border: 1px solid var(--markit-border);
  border-radius: var(--markit-radius-xl);
  background: var(--markit-surface);
  box-shadow: var(--markit-shadow-soft);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  border-color: color-mix(in srgb, var(--ion-color-primary) 28%, var(--markit-border));
}

.order-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--markit-border);
  padding: 2px 0 10px;
  margin-bottom: 2px;
}

.order-number {
  font-size: 1.05rem;
  line-height: 1.3;
  font-weight: 700;
  color: var(--markit-text);
}

.order-open-indicator {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--ion-color-primary);
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 28%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 8%, #ffffff);
  border-radius: 999px;
  padding: 4px 8px;
}

.order-items-row {
  display: flex;
  gap: 10px;
  padding: 10px 0 12px;
  border-bottom: 1px solid var(--markit-border);

  overflow-x: auto;
  overflow-y: hidden;

  /* Hide scrollbar (desktop) */
  scrollbar-width: none;           /* Firefox */
  -ms-overflow-style: none;        /* IE/Edge */
}

.order-items-row::-webkit-scrollbar {
  display: none;                   /* Chrome, Safari */
}


.order-item-tile {
  flex-shrink: 0;
  width: 92px;
  height: 122px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--markit-surface-muted);
  border: 1px solid var(--markit-border);
}

.order-item-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  color: var(--markit-text-muted);
}

.order-status-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: 10px;
  gap: 12px;
}

.order-status-text {
  font-size: 1.02rem;
  line-height: 1.25;
  font-weight: 700;
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

.order-date-text {
  margin-top: 3px;
  font-size: 0.86rem;
  line-height: 1.3;
  color: var(--markit-text-muted);
}

.order-checkout-btn {
  flex-shrink: 0;
  align-self: center;
  border: 1px solid color-mix(in srgb, var(--ion-color-primary) 24%, var(--markit-border));
  background: color-mix(in srgb, var(--ion-color-primary) 10%, #ffffff);
  color: var(--ion-color-primary);
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1;
}
</style>
