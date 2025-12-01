<template>
  <ion-page>
    <Topbar />

    <ion-content class="ion-padding">
      <div v-if="order">
        <!-- 🛍️ Products -->
        <div
          v-for="item in order.cartitems"
          :key="item.id"
          class="flex mb-6 border-b border-gray-200 pb-3"
        >
          <!-- Product Image -->
          <div class="w-24 h-28 rounded-md overflow-hidden bg-gray-100">
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

          <!-- Info -->
          <div class="ml-4 flex-1">
            <div class="font-semibold text-gray-900 flex items-center gap-1">
              <span>{{ item.company?.name || 'Unknown Company' }}</span>
            </div>

            <div class="text-sm text-gray-600">{{ item.product_name }} - {{ item.name }}</div>
            <div class="text-sm text-gray-500">Size: {{ item.size || '-' }}</div>
            <div class="text-sm text-gray-500">Qty: {{ item.quantity }}</div>
          </div>

          <!-- Price -->
          <div class="text-right min-w-[80px]">
            <div class="text-gray-900 font-semibold">
              ₹ {{ item.d_price }}
            </div>
            <div
              v-if="item.s_price && item.s_price > item.d_price"
              class="text-gray-400 text-sm line-through"
            >
              ₹ {{ item.s_price }}
            </div>
          </div>
        </div>

        <!-- 📦 Order Details -->
        <div class="border-t border-gray-200 pt-4">
          <div class="flex justify-between items-center mb-2">
            <div class="font-semibold text-lg text-gray-900">
              Order Details
            </div>
            <span class="text-sm text-gray-600">
              Order ID: #{{ order.order_number }}
            </span>
          </div>

          <div class="text-sm text-gray-500">
            Expected Delivery: {{ formatDate(order.delivery_time) }}
          </div>
          <div class="text-sm text-gray-500">
            Order Placed: {{ formatDate(order.created_at) }}
          </div>

          <div class="mt-2 text-sm font-semibold">
            Status:
            <span
              :class="{
                'text-yellow-600': order.packing_status === 'pending',
                'text-red-600': order.order_status === 'cancelled',
                'text-green-600': order.order_status !== 'cancelled'
              }"
            >
              {{ formatStatus(order.order_status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 🌀 Loading -->
      <div v-else class="text-center text-gray-500 mt-10">Loading order...</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import Topbar from '@/components/Topbar.vue'

const route = useRoute()
const id = route.params.id as string
const store = useTryHistoryStore()
const order = ref<any | null>(null)

onMounted(async () => {
  // ensure data is loaded
  await store.loadFromStorage()
  if (!store.tryHistoryList.length) {
    await store.fetchFromApi()
  }
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
</script>
