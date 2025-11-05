<template>
  <div class="bg-white p-3 mx-2 rounded-lg" @click="goToDetails">
    <!-- Header -->
     <div class="flex flex-row pb-2  border-b border-gray-200">
      <div class="flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden bg-gray-100">
        <img
          :src="`https://images.markit.co.in/${trynbuy.company.logo}`"
          alt="product"
          class="w-full h-full object-fill"
        />
      </div>
      <div class="flex flex-col justify-between ms-3 py-[0.5px]">
        <div class="text-xl leading-none" >
           {{ trynbuy.company.name }}
        </div>
        <div class="text-sm font-semibold text-[#097D4C]">
           View Products
        </div>
      </div>
     </div>
   

    <!-- Items horizontal scroll -->
    <div class="flex space-x-3 pb-2 border-b border-gray-200 overflow-x-auto pt-2">
      <div
        v-for="item in trynbuy.cartitems"
        :key="item.id"
        class="flex-shrink-0 w-28 h-36 rounded-lg overflow-hidden bg-gray-100"
      >
        <img
           :src="`https://images.markit.co.in/${item.images[0]}`"
          alt="product"
          class="w-full h-full object-cover"
        />
      </div>
    </div>
    
     <div class="flex justify-between items-start mt-2">
      <div>
        <div
          :class="[
            'font-semibold text-base',
            trynbuy.packing_status === 'pending' ? 'text-yellow-600' : trynbuy.order_status === 'cancelled' ? 'text-red-600' : 'text-green-600'
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
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  trynbuy: any
}>()

const goToDetails = () => {
     router.push(`/account/orderhistory/${props.trynbuy.trynbuy_id}`)
}

watch(() => props.trynbuy, (newValue, oldValue) => {
  console.log('Trynbuy updated:', { 
    new: newValue,
    old: oldValue 
  });
}, { deep: true });

function formatDate(date: string) {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


  function formatStatus(status: string | null): string {
    if (!status) return ''
    return status
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }



</script>
