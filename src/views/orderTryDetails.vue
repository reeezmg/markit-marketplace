<template>
  <ion-page>
  <Topbar/>

    <ion-content class="ion-padding">
      <div v-if="order">
        <!-- Products -->
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

          <!-- Price -->
          <div class="text-right">
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

        <!-- Order details -->
        <div class="border-t border-gray-200 pt-4">
          <div class="flex justify-between items-center mb-2">
            <div class="font-semibold text-lg text-gray-900">Order details</div>
            <span class="text-sm text-gray-600">Order ID: #{{ order.order_number }}</span>
          </div>
          <div class="text-sm text-gray-500">
            Expected Delivery - {{ formatDate(order.delivery_time) }}
          </div>
          <div class="text-sm text-gray-500">
            Order Placed - {{ formatDate(order.created_at) }}
          </div>
        </div>
      </div>

      <!-- Loading / Fallback -->
      <div v-else class="text-center text-gray-500">Loading order...</div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonButtons,IonTitle, IonBackButton, IonHeader, IonContent } from '@ionic/vue'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useTryHistoryStore } from '@/store/useTryHistoryStore'
import { heartOutline, heart, cartOutline } from "ionicons/icons";
import Topbar from '@/components/Topbar.vue';

const route = useRoute()
const id = route.params.id as string

const store = useTryHistoryStore()
const order = ref<any | null>(null)

onMounted(async () => {
  // ensure store has data
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
}

</script>
