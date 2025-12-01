<template>
  <div class="bg-white p-3 mx-2 rounded-lg" @click="goToDetails">
    <!-- Companies Section -->

      <div class="font-semibold text-base text-[#53816C] border-b border-gray-200 pb-2 mb-2">
        Order Number: {{ trynbuy.order_number }}
      </div>


    <!-- Cart Items Horizontal Scroll -->
    <div class="flex space-x-3 pb-2 border-b border-gray-200 overflow-x-auto pt-2">
      <div
        v-for="item in trynbuy.cartitems"
        :key="item.id"
        class="flex-shrink-0 w-28 h-36 rounded-lg overflow-hidden bg-gray-100"
      >
        <img
          v-if="item.images?.length"
          :src="`https://images.markit.co.in/${item.images[0]}`"
          alt="product"
          class="w-full h-full object-cover"
        />
        <div v-else class="flex items-center justify-center w-full h-full text-xs text-gray-500">
          No Image
        </div>
      </div>
    </div>

    <!-- Status & Date -->
    <div class="flex justify-between items-start mt-2">
      <div>
        <div
          :class="[
            'font-semibold text-base',
            trynbuy.packing_status === 'pending'
              ? 'text-yellow-600'
              : trynbuy.order_status === 'cancelled'
              ? 'text-red-600'
              : 'text-green-600'
          ]"
        >
          {{ formatStatus(trynbuy.order_status) }}
        </div>
        <div class="text-sm text-gray-500">
          Ordered: {{ formatDate(trynbuy.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const props = defineProps<{
  trynbuy: any
}>()

const router = useRouter()
console.log(props.trynbuy)

const goToDetails = () => {
  router.push(`/account/orderhistory/${props.trynbuy.trynbuy_id}`)
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
